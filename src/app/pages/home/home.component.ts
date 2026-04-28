import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HeroSceneComponent } from '../../components/hero-scene/hero-scene.component';
import { HeroSearchComponent } from '../../components/hero-search/hero-search.component';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../api/product.service';
import { TOP_CATEGORIES, ALL_CATEGORIES } from '../../data/categories';
import { Product, Taxonomy, ProductCounts } from '../../types';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeroSceneComponent,
    HeroSearchComponent,
    CategoryCardComponent,
    ProductCardComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  topCategories = TOP_CATEGORIES;
  allCategories = ALL_CATEGORIES;

  isLoading = signal(true);
  productsLoading = signal(true);
  trendingProducts = signal<Product[]>([]);
  productCounts = signal<Record<string, number>>({});
  taxonomy = signal<Record<string, string[]>>({});

  totalProducts = computed(() => {
    const counts = this.productCounts();
    return Object.values(counts).reduce((a, b) => a + b, 0);
  });

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    forkJoin({
      counts: this.productService.getProductCounts(),
      taxonomy: this.productService.getTaxonomy(),
      trending: this.productService.getTrendingProducts(8),
    }).subscribe({
      next: ({ counts, taxonomy, trending }) => {
        this.productCounts.set(counts);
        this.taxonomy.set(taxonomy);
        const data = (trending as any).data || trending;
        this.trendingProducts.set(Array.isArray(data) ? data.slice(0, 8) : []);
        this.isLoading.set(false);
        this.productsLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.productsLoading.set(false);
      }
    });
  }

  scrollToAll(): void {
    document.getElementById('all-categories')?.scrollIntoView({ behavior: 'smooth' });
  }

  navigateToProduct(product: Product): void {
    this.router.navigate(['/product', product._id]);
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/add-product']);
  }
}
