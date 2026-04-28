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
  templateUrl: './marketplace.component.html'
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
      source: 'user',
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
