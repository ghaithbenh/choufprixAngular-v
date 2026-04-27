import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { SubcategoryTabsComponent } from '../../components/subcategory-tabs/subcategory-tabs.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { HeroSearchComponent } from '../../components/hero-search/hero-search.component';
import { ProductService } from '../../api/product.service';
import { Product } from '../../types';
import { TOP_CATEGORIES } from '../../data/categories';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule, ProductCardComponent, SkeletonCardComponent,
    SubcategoryTabsComponent, PaginationComponent, HeroSearchComponent
  ],
  template: `
    <!-- Hero -->
    <div class="bg-gradient-to-br from-orange-500 to-amber-600 py-14 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="font-outfit text-5xl font-black mb-4">🛍️ Marketplace</h1>
          <p class="text-orange-100 text-xl mb-8">Achetez et vendez directement entre particuliers</p>
          <div class="max-w-xl mx-auto">
            <app-hero-search placeholder="Rechercher dans le marketplace..."></app-hero-search>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Category filter -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button class="filter-pill"
                [class.filter-pill-active]="!activeCategory()"
                [class.filter-pill-inactive]="!!activeCategory()"
                (click)="setCategory('')">
          Toutes les catégories
        </button>
        @for (cat of categories; track cat.slug) {
          <button class="filter-pill"
                  [class.filter-pill-active]="activeCategory() === cat.parentCategory"
                  [class.filter-pill-inactive]="activeCategory() !== cat.parentCategory"
                  (click)="setCategory(cat.parentCategory)">
            {{ cat.icon }} {{ cat.label }}
          </button>
        }
      </div>

      <!-- Results -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-slate-500 text-sm">
          <span class="font-semibold text-slate-800">{{ total() }}</span> annonces disponibles
        </p>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <app-skeleton-card></app-skeleton-card>
          }
        </div>
      } @else if (products().length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (product of products(); track product._id) {
            <app-product-card [product]="product" (onClick)="navigateToProduct($event)"></app-product-card>
          }
        </div>
      } @else {
        <div class="text-center py-20">
          <div class="text-7xl mb-4">🛒</div>
          <h3 class="font-outfit text-2xl font-bold text-slate-700 mb-3">Aucune annonce</h3>
          <p class="text-slate-500">Soyez le premier à publier!</p>
        </div>
      }

      <app-pagination
        [currentPage]="currentPage()"
        [totalPages]="totalPages()"
        (pageChange)="onPageChange($event)">
      </app-pagination>
    </div>
  `
})
export class MarketplaceComponent implements OnInit {
  categories = TOP_CATEGORIES;
  products = signal<Product[]>([]);
  isLoading = signal(true);
  activeCategory = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    const params: any = {
      store: 'user',
      page: this.currentPage(),
      limit: 12,
    };
    if (this.activeCategory()) params.parentCategory = this.activeCategory();

    this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
    this.currentPage.set(1);
    this.loadProducts();
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
