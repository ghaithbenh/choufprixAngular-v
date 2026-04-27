import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductService } from '../../api/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { Product } from '../../types';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ProductCardComponent, SkeletonCardComponent, PaginationComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <a routerLink="/" class="hover:text-blue-600 transition-colors">Accueil</a>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        <span class="text-slate-700 font-medium">Résultats de recherche</span>
      </nav>

      <!-- Search input -->
      <div class="max-w-2xl mb-8">
        <div class="relative flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div class="pl-5 text-slate-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
          </div>
          <input type="text"
                 [(ngModel)]="searchInput"
                 placeholder="Rechercher un produit..."
                 class="flex-1 px-4 py-4 text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                 (ngModelChange)="onSearchInput($event)">
          @if (searchInput) {
            <button class="px-4 text-slate-400 hover:text-slate-600"
                    (click)="clearSearch()">×</button>
          }
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 space-y-4">
        <!-- Store pills -->
        <div class="flex flex-wrap gap-2 items-center">
          <span class="text-sm font-medium text-slate-500 mr-2">Marchands:</span>
          <button class="filter-pill"
                  [class.filter-pill-active]="!activeStore()"
                  [class.filter-pill-inactive]="!!activeStore()"
                  (click)="setStore('')">
            Tous les marchands
          </button>
          @for (s of stores(); track s) {
            <button class="filter-pill"
                    [class.filter-pill-active]="activeStore() === s"
                    [class.filter-pill-inactive]="activeStore() !== s"
                    (click)="setStore(s)">
              {{ s }}
            </button>
          }
        </div>

        <!-- Price range -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-500">Prix (DT):</span>
          <input type="number" [(ngModel)]="minPriceInput" placeholder="Min"
                 class="input-field !w-24 !py-2 text-sm" (change)="onPriceChange()">
          <span class="text-slate-400">—</span>
          <input type="number" [(ngModel)]="maxPriceInput" placeholder="Max"
                 class="input-field !w-24 !py-2 text-sm" (change)="onPriceChange()">
          @if (minPriceInput || maxPriceInput) {
            <button class="text-sm text-blue-600 hover:text-blue-700 underline"
                    (click)="clearPriceFilter()">
              Effacer
            </button>
          }
        </div>
      </div>

      <!-- Normalized query info -->
      @if (normalizedInfo()) {
        <div class="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span class="text-slate-600">Recherche comprise:</span>
            <strong class="text-blue-700">{{ normalizedInfo()!.normalizedQuery }}</strong>
            @for (spec of normalizedInfo()!.specs || []; track spec) {
              <span class="badge bg-blue-100 text-blue-700">{{ spec }}</span>
            }
            @if (normalizedInfo()!.category) {
              <span class="badge bg-indigo-100 text-indigo-700">{{ normalizedInfo()!.category }}</span>
            }
          </div>
        </div>
      }

      <!-- Results header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="section-title">
          @if (debouncedSearch()) {
            Résultats pour "<span class="gradient-text">{{ debouncedSearch() }}</span>"
          } @else {
            Derniers produits
          }
        </h1>
        <p class="text-slate-500 text-sm">
          <span class="font-semibold text-slate-700">{{ total() }}</span> produits
        </p>
      </div>

      <!-- Product grid -->
      @if (isLoading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
            <app-skeleton-card></app-skeleton-card>
          }
        </div>
      } @else if (products().length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (product of products(); track product._id) {
            <app-product-card
              [product]="product"
              (onClick)="navigateToProduct($event)">
            </app-product-card>
          }
        </div>
      } @else {
        <div class="text-center py-24">
          <div class="text-7xl mb-6">🔍</div>
          <h3 class="font-outfit text-2xl font-bold text-slate-700 mb-3">Aucun résultat</h3>
          <p class="text-slate-500">Essayez d'autres mots-clés ou filtres</p>
        </div>
      }

      <!-- Pagination -->
      <app-pagination
        [currentPage]="currentPage()"
        [totalPages]="totalPages()"
        (pageChange)="onPageChange($event)">
      </app-pagination>
    </div>
  `
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchInput = '';
  debouncedSearch = signal('');
  activeStore = signal('');
  stores = signal<string[]>([]);
  products = signal<Product[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  normalizedInfo = signal<any>(null);

  minPriceInput = '';
  maxPriceInput = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Load stores
    this.productService.getStores().subscribe(stores => this.stores.set(stores));

    // Read initial query from URL
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(qp => {
      const q = qp['q'] || '';
      this.searchInput = q;
      this.debouncedSearch.set(q);
      this.loadProducts();
    });

    // Debounce search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.debouncedSearch.set(query);
      this.currentPage.set(1);
      this.router.navigate([], {
        queryParams: query ? { q: query } : {},
        replaceUrl: true
      });
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchInput = '';
    this.searchSubject.next('');
  }

  loadProducts(): void {
    this.isLoading.set(true);

    if (this.debouncedSearch()) {
      this.productService.searchProducts({
        q: this.debouncedSearch(),
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
      this.productService.getProducts({
        store: this.activeStore() || undefined,
        minPrice: this.minPriceInput ? Number(this.minPriceInput) * 1000 : undefined,
        maxPrice: this.maxPriceInput ? Number(this.maxPriceInput) * 1000 : undefined,
        page: this.currentPage(),
        limit: 12,
      }).subscribe({
        next: (res) => {
          this.products.set(res.data);
          this.total.set(res.total);
          this.totalPages.set(res.totalPages);
          this.normalizedInfo.set(null);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
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

  clearPriceFilter(): void {
    this.minPriceInput = '';
    this.maxPriceInput = '';
    this.onPriceChange();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToProduct(product: Product): void {
    this.router.navigate(['/product', product._id]);
  }
}
