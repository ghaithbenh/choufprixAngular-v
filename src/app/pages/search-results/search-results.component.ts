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
  templateUrl: './search-results.component.html'
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
