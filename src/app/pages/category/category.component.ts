import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { ProductService } from '../../api/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { SubcategoryTabsComponent } from '../../components/subcategory-tabs/subcategory-tabs.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { HeroSearchComponent } from '../../components/hero-search/hero-search.component';
import { getCategoryBySlug } from '../../data/categories';
import { TopCategory, Product, Taxonomy } from '../../types';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ProductCardComponent, SkeletonCardComponent,
    SubcategoryTabsComponent, PaginationComponent, HeroSearchComponent
  ],
  templateUrl: './category.component.html'
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  slug = signal('');
  category = signal<TopCategory | undefined>(undefined);
  subcategories = signal<string[]>([]);
  stores = signal<string[]>([]);
  products = signal<Product[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  activeSubcategory = signal('');
  activeStore = signal('');
  searchQuery = signal('');
  normalizedInfo = signal<any>(null);

  minPriceInput: string = '';
  maxPriceInput: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Subscribe to route param changes
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params['slug'];
      this.slug.set(slug);
      const cat = getCategoryBySlug(slug);
      this.category.set(cat);

      if (cat) {
        this.resetState();
        this.loadData();
      }
    });

    // Query params (for ?q=...)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(qp => {
      if (qp['q']) this.searchQuery.set(qp['q']);
    });

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetState(): void {
    this.products.set([]);
    this.activeSubcategory.set('');
    this.activeStore.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.normalizedInfo.set(null);
    this.minPriceInput = '';
    this.maxPriceInput = '';
  }

  private loadData(): void {
    const cat = this.category();
    if (!cat) return;

    // Load taxonomy and stores in parallel
    this.productService.getTaxonomy().subscribe(taxonomy => {
      this.subcategories.set(taxonomy[cat.parentCategory] || []);
    });

    this.productService.getStores().subscribe(stores => {
      this.stores.set(stores);
    });

    this.loadProducts();
  }

  loadProducts(): void {
    const cat = this.category();
    if (!cat) return;
    this.isLoading.set(true);

    const params: any = {
      parentCategory: cat.parentCategory,
      page: this.currentPage(),
      limit: 12,
    };
    if (this.activeSubcategory()) params.subcategory = this.activeSubcategory();
    if (this.activeStore()) params.store = this.activeStore();
    if (this.minPriceInput) params.minPrice = Number(this.minPriceInput) * 1000;
    if (this.maxPriceInput) params.maxPrice = Number(this.maxPriceInput) * 1000;
    if (this.searchQuery()) params.search = this.searchQuery();

    if (this.searchQuery()) {
      this.productService.searchProducts({
        q: this.searchQuery(),
        parentCategory: cat.parentCategory,
        subcategory: this.activeSubcategory() || undefined,
        source: this.activeStore() || undefined,
        minPrice: this.minPriceInput ? Number(this.minPriceInput) * 1000 : undefined,
        maxPrice: this.maxPriceInput ? Number(this.maxPriceInput) * 1000 : undefined,
        page: this.currentPage(),
        limit: 12,
      }).subscribe({
        next: (res) => {
          const sorted = [...res.results].sort((a, b) => a.price - b.price);
          this.products.set(sorted);
          this.total.set(res.total);
          this.totalPages.set(res.totalPages);
          this.normalizedInfo.set(res.normalized || null);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.productService.getProducts(params).subscribe({
        next: (res) => {
          const sorted = [...res.data].sort((a, b) => a.price - b.price);
          this.products.set(sorted);
          this.total.set(res.total);
          this.totalPages.set(res.totalPages);
          this.normalizedInfo.set(null);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  onSubcategorySelect(sub: string): void {
    this.activeSubcategory.set(sub);
    this.currentPage.set(1);
    this.loadProducts();
  }

  setStore(store: string): void {
    this.activeStore.set(store);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onPriceChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters(): void {
    this.activeSubcategory.set('');
    this.activeStore.set('');
    this.searchQuery.set('');
    this.minPriceInput = '';
    this.maxPriceInput = '';
    this.currentPage.set(1);
    this.loadProducts();
  }

  navigateToProduct(product: Product): void {
    this.router.navigate(['/product', product._id]);
  }
}
