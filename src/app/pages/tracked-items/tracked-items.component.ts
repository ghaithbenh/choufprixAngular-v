import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TrackedItemsService } from '../../api/tracked-items.service';
import { AuthService } from '../../services/auth.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { TrackedItem } from '../../types';

@Component({
  selector: 'app-tracked-items',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="font-outfit text-4xl font-black text-slate-900">♥ Mes produits suivis</h1>
        <p class="text-slate-500 mt-2">Suivez l'évolution des prix de vos produits préférés</p>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <app-skeleton-card></app-skeleton-card>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="text-center py-24">
          <div class="text-8xl mb-6">💔</div>
          <h3 class="font-outfit text-2xl font-bold text-slate-700 mb-3">Aucun produit suivi</h3>
          <p class="text-slate-500 mb-8">Ajoutez des produits à vos favoris pour les suivre ici</p>
          <button class="btn-primary" (click)="navigateHome()">
            Explorer les produits
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (item of items(); track item._id) {
            <div class="relative group">
              <app-product-card
                [product]="item.product"
                (onClick)="navigateToProduct($event)">
              </app-product-card>
              <!-- Untrack button overlay -->
              <button class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-md"
                      (click)="untrack(item._id, item.product._id)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TrackedItemsComponent implements OnInit {
  items = signal<TrackedItem[]>([]);
  isLoading = signal(true);

  constructor(
    private trackedService: TrackedItemsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isSignedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadItems();
  }

  private async loadItems(): Promise<void> {
    const token = await this.auth.getToken();
    if (!token) return;
    this.trackedService.getTrackedItems(token).subscribe({
      next: (items) => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  async untrack(itemId: string, productId: string): Promise<void> {
    const token = await this.auth.getToken();
    if (!token) return;
    this.trackedService.untrackProduct(productId, token).subscribe(() => {
      this.items.update(items => items.filter(i => i._id !== itemId));
    });
  }

  navigateToProduct(product: any): void {
    this.router.navigate(['/product', product._id]);
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }
}
