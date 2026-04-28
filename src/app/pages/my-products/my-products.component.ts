import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-products.component.html'
})
export class MyProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  isLoading = signal(true);
  productToDelete = signal<Product | null>(null);
  deletingId = signal<string | null>(null);

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isSignedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    const token = await this.auth.getToken();
    if (!token) return;
    this.productService.getUserProducts(token).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  confirmDelete(product: Product): void {
    this.productToDelete.set(product);
  }

  async deleteProduct(): Promise<void> {
    const product = this.productToDelete();
    if (!product) return;
    const token = await this.auth.getToken();
    if (!token) return;

    this.deletingId.set(product._id);
    this.productService.deleteProduct(product._id, token).subscribe({
      next: () => {
        this.products.update(p => p.filter(item => item._id !== product._id));
        this.productToDelete.set(null);
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null)
    });
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  navigateToAdd(): void {
    this.router.navigate(['/add-product']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/edit-product', id]);
  }
}
