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
  template: `
    @if (isLoading()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div class="h-96 bg-slate-200 rounded-3xl animate-pulse"></div>
          <div class="space-y-4">
            <div class="h-8 bg-slate-200 rounded-xl animate-pulse w-3/4"></div>
            <div class="h-6 bg-slate-200 rounded-xl animate-pulse w-1/2"></div>
            <div class="h-12 bg-slate-200 rounded-xl animate-pulse w-1/3 mt-6"></div>
          </div>
        </div>
      </div>
    } @else if (!product()) {
      <div class="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div class="text-8xl mb-6">📦</div>
        <h1 class="font-outfit text-4xl font-bold text-slate-800 mb-4">Produit introuvable</h1>
        <p class="text-slate-500 mb-8">Ce produit n'existe pas ou a été supprimé.</p>
        <a routerLink="/" class="btn-primary">← Retour à l'accueil</a>
      </div>
    } @else {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
          <a routerLink="/" class="hover:text-blue-600 transition-colors">Accueil</a>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          @if (product()!.parentCategory) {
            <a [routerLink]="['/category', getCategorySlug(product()!.parentCategory!)]"
               class="hover:text-blue-600 transition-colors">
              {{ product()!.parentCategory }}
            </a>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          }
          <span class="text-slate-700 font-medium line-clamp-1">{{ product()!.name }}</span>
        </nav>

        <!-- Main content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          <!-- Left: Product image -->
          <div class="relative">
            <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 flex items-center justify-center min-h-80 border border-gray-100 shadow-sm">
              @if (product()!.image) {
                <img [src]="product()!.image" [alt]="product()!.name"
                     class="max-w-full max-h-80 object-contain"
                     (error)="onImgError($event)">
              } @else {
                <div class="text-9xl opacity-20">📦</div>
              }
            </div>

            <!-- Tracking heart button -->
            <button class="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                    [class.text-red-500]="isTracked()"
                    [class.text-slate-300]="!isTracked()"
                    (click)="toggleTrack()">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>

          <!-- Right: Product info -->
          <div class="space-y-6">
            <!-- Store badge -->
            <div class="flex items-center gap-3">
              <span class="badge text-sm px-3 py-1.5" [class]="getStoreBadgeClass()">
                {{ formatStoreName(product()!.source || '') }}
              </span>
              @if (product()!.subcategory) {
                <span class="badge bg-slate-100 text-slate-600">
                  {{ product()!.subcategory }}
                </span>
              }
            </div>

            <!-- Product name -->
            <h1 class="font-outfit text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
              {{ product()!.name }}
            </h1>

            <!-- Price section -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div class="flex items-end gap-4">
                <div>
                  <p class="text-sm text-slate-500 mb-1">Prix actuel</p>
                  <p class="font-outfit text-4xl font-black text-slate-900">
                    {{ formatPrice(latestPrice()) }}
                  </p>
                </div>
                @if (priceDiff() !== 0) {
                  <div class="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold mb-1"
                       [class.bg-emerald-100]="isPriceDrop()"
                       [class.text-emerald-700]="isPriceDrop()"
                       [class.bg-red-100]="!isPriceDrop()"
                       [class.text-red-700]="!isPriceDrop()">
                    {{ isPriceDrop() ? '▼' : '▲' }}
                    {{ formatPrice(Math.abs(priceDiff())) }}
                  </div>
                }
              </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200">
              <div class="flex gap-0">
                @for (tab of tabs; track tab.id) {
                  <button class="px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2"
                          [class.border-blue-600]="activeTab() === tab.id"
                          [class.text-blue-600]="activeTab() === tab.id"
                          [class.border-transparent]="activeTab() !== tab.id"
                          [class.text-slate-500]="activeTab() !== tab.id"
                          [class.hover:text-slate-700]="activeTab() !== tab.id"
                          (click)="activeTab.set(tab.id)">
                    {{ tab.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Tab content -->
            @if (activeTab() === 'overview') {
              <div class="space-y-4">
                @if (product()!.description) {
                  <p class="text-slate-600 leading-relaxed">{{ product()!.description }}</p>
                }
                <div class="grid grid-cols-2 gap-4 text-sm">
                  @if (product()!.parentCategory) {
                    <div class="bg-slate-50 rounded-xl p-4">
                      <p class="text-slate-400 text-xs mb-1">Catégorie</p>
                      <p class="font-medium text-slate-700">{{ product()!.parentCategory }}</p>
                    </div>
                  }
                  @if (product()!.source) {
                    <div class="bg-slate-50 rounded-xl p-4">
                      <p class="text-slate-400 text-xs mb-1">Source</p>
                      <p class="font-medium text-slate-700">{{ formatStoreName(product()!.source) }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            @if (activeTab() === 'history') {
              <div>
                @if (priceHistory().length > 0) {
                  <!-- Simple price history table -->
                  <div class="space-y-2 max-h-64 overflow-y-auto">
                    @for (entry of priceHistory(); track entry._id) {
                      <div class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 text-sm">
                        <span class="text-slate-500">{{ formatDate(entry.date) }}</span>
                        <span class="font-semibold text-slate-800">{{ formatPrice(entry.price) }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-slate-400 text-center py-8">Pas d'historique de prix disponible</p>
                }
              </div>
            }

            @if (activeTab() === 'store') {
              <div class="space-y-4">
                @if (product()!.url) {
                  <a [href]="product()!.url" target="_blank" rel="noopener"
                     class="flex items-center justify-center gap-2 btn-primary w-full text-center !py-4">
                    Voir sur {{ formatStoreName(product()!.source || '') }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                }
                <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                  💡 Les prix peuvent varier. Vérifiez toujours le prix final sur le site du marchand.
                </div>
              </div>
            }

            <!-- Actions -->
            <div class="flex gap-3">
              <button class="flex-1 btn-secondary flex items-center justify-center gap-2"
                      (click)="toggleTrack()">
                <span>{{ isTracked() ? '♥ Suivi' : '♡ Suivre' }}</span>
              </button>
              @if (product()!.url) {
                <a [href]="product()!.url" target="_blank" rel="noopener"
                   class="flex-1 btn-primary flex items-center justify-center gap-2 text-center">
                  Acheter maintenant →
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Similar products -->
        @if (similarProducts().length > 0) {
          <section>
            <h2 class="section-title text-2xl mb-6">Produits similaires</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              @for (product of similarProducts().slice(0, 8); track product._id) {
                <app-product-card
                  [product]="product"
                  (onClick)="navigateToProduct($event)">
                </app-product-card>
              }
            </div>
          </section>
        }
      </div>
    }
  `
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
