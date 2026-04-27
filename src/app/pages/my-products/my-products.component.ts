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
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Header -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h1 class="font-outfit text-4xl font-black text-slate-900">Mes annonces</h1>
          <p class="text-slate-500 mt-1">Gérez vos produits publiés</p>
        </div>
        <button class="btn-primary" (click)="navigateToAdd()">
          + Nouvelle annonce
        </button>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-72 bg-slate-200 rounded-2xl animate-pulse"></div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="text-center py-24">
          <div class="text-8xl mb-6">📭</div>
          <h3 class="font-outfit text-2xl font-bold text-slate-700 mb-3">Aucune annonce</h3>
          <p class="text-slate-500 mb-8">Vous n'avez pas encore publié d'annonces</p>
          <button class="btn-primary" (click)="navigateToAdd()">Publier une annonce</button>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (product of products(); track product._id) {
            <div class="card overflow-hidden group relative">
              <!-- Image -->
              <div class="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                @if (product.image) {
                  <img [src]="product.image" [alt]="product.name"
                       class="w-full h-full object-contain p-4">
                } @else {
                  <div class="text-5xl opacity-20">📦</div>
                }
              </div>

              <!-- Content -->
              <div class="p-4">
                <h3 class="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">{{ product.name }}</h3>
                <p class="font-bold text-lg text-slate-900 font-outfit">{{ formatPrice(product.price) }}</p>
                @if (product.parentCategory) {
                  <p class="text-xs text-slate-400 mt-1">{{ product.parentCategory }}</p>
                }
              </div>

              <!-- Delete button -->
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button class="bg-red-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                        (click)="confirmDelete(product)">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Delete confirmation modal -->
      @if (productToDelete()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in">
            <div class="text-center mb-6">
              <div class="text-5xl mb-4">🗑️</div>
              <h3 class="font-outfit text-xl font-bold text-slate-900 mb-2">Supprimer l'annonce?</h3>
              <p class="text-slate-500 text-sm">
                Êtes-vous sûr de vouloir supprimer "<strong>{{ productToDelete()!.name }}</strong>"?
                Cette action est irréversible.
              </p>
            </div>
            <div class="flex gap-3">
              <button class="flex-1 btn-secondary"
                      (click)="productToDelete.set(null)">
                Annuler
              </button>
              <button class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                      [disabled]="deletingId() === productToDelete()?._id"
                      (click)="deleteProduct()">
                @if (deletingId() === productToDelete()?._id) {
                  Suppression...
                } @else {
                  Supprimer
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
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
}
