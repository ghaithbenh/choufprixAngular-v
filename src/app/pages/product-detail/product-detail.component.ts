import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { AuthService } from '../../services/auth.service';
import { TrackedItemsService } from '../../api/tracked-items.service';
import { Product, PriceHistory } from '../../types';
import { formatPrice, formatStoreName, getStoreBadgeClass } from '../../lib/utils';
import { ALL_CATEGORIES } from '../../data/categories';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, SkeletonCardComponent],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  priceHistory = signal<PriceHistory[]>([]);
  similarProducts = signal<Product[]>([]);
  isLoading = signal(true);
  isTracked = signal(false);
  activeTab = signal<'overview' | 'history' | 'store'>('overview');

  Math = Math;

  tabs = [
    { id: 'overview' as const, label: 'Aperçu' },
    { id: 'history' as const, label: '📈 Historique' },
    { id: 'store' as const, label: '🛒 Acheter' },
  ];

  latestPrice = computed(() => {
    const h = this.priceHistory();
    return h.length > 0 ? h[h.length - 1].price : this.product()?.price || 0;
  });

  previousPrice = computed(() => {
    const h = this.priceHistory();
    return h.length > 1 ? h[h.length - 2].price : this.latestPrice();
  });

  priceDiff = computed(() => this.latestPrice() - this.previousPrice());
  isPriceDrop = computed(() => this.priceDiff() < 0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private auth: AuthService,
    private trackedService: TrackedItemsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) this.loadProduct(id);
    });
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    forkJoin({
      product: this.productService.getProductById(id),
      history: this.productService.getPriceHistory(id),
    }).subscribe({
      next: ({ product, history }) => {
        this.product.set(product);
        this.priceHistory.set(Array.isArray(history) ? history : []);
        this.isLoading.set(false);

        // Load similar products
        if (product.parentCategory) {
          this.productService.getProducts({
            parentCategory: product.parentCategory,
            limit: 9,
          }).subscribe(res => {
            const similar = (res.data || []).filter(p => p._id !== id);
            this.similarProducts.set(similar.slice(0, 8));
          });
        }

        // Check if tracked
        if (this.auth.isSignedIn()) {
          this.auth.getToken().then(token => {
            if (!token) return;
            this.trackedService.getTrackedProductIds(token).subscribe(ids => {
              this.isTracked.set(ids.includes(id));
            });
          });
        }
      },
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  async toggleTrack(): Promise<void> {
    if (!this.auth.isSignedIn()) {
      alert('Connectez-vous pour suivre ce produit');
      return;
    }
    const token = await this.auth.getToken();
    if (!token || !this.product()) return;

    if (this.isTracked()) {
      this.trackedService.untrackProduct(this.product()!._id, token).subscribe(() => {
        this.isTracked.set(false);
      });
    } else {
      this.trackedService.trackProduct(this.product()!._id, token).subscribe(() => {
        this.isTracked.set(true);
      });
    }
  }

  navigateToProduct(product: Product): void {
    this.router.navigate(['/product', product._id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCategorySlug(parentCategory: string): string {
    const cat = ALL_CATEGORIES.find(c => c.parentCategory === parentCategory);
    return cat?.slug || parentCategory.toLowerCase();
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  formatStoreName(source: string): string {
    return formatStoreName(source);
  }

  getStoreBadgeClass(): string {
    return getStoreBadgeClass(this.product()?.source || '');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-TN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
