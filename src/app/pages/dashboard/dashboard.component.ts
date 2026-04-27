import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { AuthService } from '../../services/auth.service';
import { Stats } from '../../types';
import { formatPrice } from '../../lib/utils';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Header -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h1 class="font-outfit text-4xl font-black text-slate-900">Dashboard</h1>
          <p class="text-slate-500 mt-1">Statistiques et monitoring en temps réel</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span class="text-emerald-700 text-sm font-medium">Temps réel</span>
        </div>
      </div>

      @if (isLoading()) {
        <!-- Loading skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
          }
        </div>
      } @else {
        <!-- Stats cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div class="card p-6 border-l-4 border-blue-500">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📦</div>
              <span class="badge bg-blue-100 text-blue-700 text-xs">Total</span>
            </div>
            <p class="text-3xl font-black text-slate-900 font-outfit">{{ stats()?.totalProducts?.toLocaleString() || '—' }}</p>
            <p class="text-slate-500 text-sm mt-1">Produits</p>
          </div>

          <div class="card p-6 border-l-4 border-emerald-500">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">🏪</div>
              <span class="badge bg-emerald-100 text-emerald-700 text-xs">Actifs</span>
            </div>
            <p class="text-3xl font-black text-slate-900 font-outfit">{{ stats()?.totalStores || '—' }}</p>
            <p class="text-slate-500 text-sm mt-1">Marchands</p>
          </div>

          <div class="card p-6 border-l-4 border-orange-500">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">⚡</div>
              <span class="badge bg-orange-100 text-orange-700 text-xs">Aujourd'hui</span>
            </div>
            <p class="text-3xl font-black text-slate-900 font-outfit">{{ stats()?.addedToday || 0 }}</p>
            <p class="text-slate-500 text-sm mt-1">Ajoutés aujourd'hui</p>
          </div>

          <div class="card p-6 border-l-4 border-purple-500">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">🕐</div>
              <span class="badge bg-purple-100 text-purple-700 text-xs">Dernier</span>
            </div>
            <p class="text-lg font-bold text-slate-900">{{ formatLastScrape() }}</p>
            <p class="text-slate-500 text-sm mt-1">Dernier scraping</p>
          </div>
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

          <!-- Products by store -->
          <div class="card p-6">
            <h2 class="section-title mb-6">Produits par marchand</h2>
            @if (stats()?.byStore?.length) {
              <div class="space-y-4">
                @for (store of stats()!.byStore; track store.name) {
                  <div>
                    <div class="flex items-center justify-between text-sm mb-1">
                      <span class="font-medium text-slate-700">{{ store.name }}</span>
                      <span class="text-slate-500">{{ store.value.toLocaleString() }}</span>
                    </div>
                    <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                           [style.width.%]="getStoreBarWidth(store.value)">
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-slate-400 text-center py-8">Aucune donnée disponible</p>
            }
          </div>

          <!-- Price distribution -->
          <div class="card p-6">
            <h2 class="section-title mb-6">Distribution des prix</h2>
            @if (stats()?.priceRanges?.length) {
              <div class="space-y-4">
                @for (range of stats()!.priceRanges; track range.range) {
                  <div>
                    <div class="flex items-center justify-between text-sm mb-1">
                      <span class="font-medium text-slate-700">{{ range.range }}</span>
                      <span class="text-slate-500">{{ range.count }}</span>
                    </div>
                    <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-700"
                           [style.width.%]="getPriceBarWidth(range.count)">
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-slate-400 text-center py-8">Aucune donnée disponible</p>
            }
          </div>
        </div>

        <!-- Scraper status + recent updates -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Scraper status -->
          <div class="card p-6">
            <h2 class="section-title mb-6">🕷️ Statut des scrapers</h2>
            @if (stats()?.scraperStatus?.length) {
              <div class="space-y-4">
                @for (scraper of stats()!.scraperStatus; track scraper.store) {
                  <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div class="flex items-center gap-3">
                      <div class="w-3 h-3 rounded-full"
                           [class.bg-emerald-500]="scraper.status === 'success'"
                           [class.bg-red-500]="scraper.status !== 'success'"
                           [class.animate-pulse]="scraper.status === 'success'">
                      </div>
                      <div>
                        <p class="font-medium text-slate-800 text-sm">{{ scraper.store }}</p>
                        <p class="text-xs text-slate-400">{{ formatScraperTime(scraper.lastScrapeTime) }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-slate-700 text-sm">{{ scraper.productCount?.toLocaleString() }}</p>
                      <span class="text-xs px-2 py-0.5 rounded-full"
                            [class.bg-emerald-100]="scraper.status === 'success'"
                            [class.text-emerald-700]="scraper.status === 'success'"
                            [class.bg-red-100]="scraper.status !== 'success'"
                            [class.text-red-700]="scraper.status !== 'success'">
                        {{ scraper.status }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-slate-400 text-center py-8">Aucun scraper configuré</p>
            }
          </div>

          <!-- Recently updated -->
          <div class="card p-6">
            <h2 class="section-title mb-6">🔄 Récemment mis à jour</h2>
            @if (stats()?.recentlyUpdated?.length) {
              <div class="space-y-3">
                @for (product of stats()!.recentlyUpdated.slice(0, 6); track product._id) {
                  <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                       (click)="navigateToProduct(product._id)">
                    @if (product.image) {
                      <img [src]="product.image" [alt]="product.name"
                           class="w-12 h-12 object-contain rounded-lg bg-slate-100">
                    } @else {
                      <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xl">📦</div>
                    }
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-slate-800 line-clamp-1">{{ product.name }}</p>
                      <p class="text-xs text-slate-400">{{ product.source }}</p>
                    </div>
                    <span class="font-bold text-slate-700 text-sm flex-shrink-0">
                      {{ formatPrice(product.price) }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-slate-400 text-center py-8">Aucune mise à jour récente</p>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = signal<Stats | null>(null);
  isLoading = signal(true);
  private socket: Socket | null = null;

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Role guard
    if (!this.auth.isAdmin() && !this.auth.isSubAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    // Load initial stats
    this.productService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // WebSocket for real-time updates
    try {
      this.socket = io(environment.socketUrl);
      this.socket.on('stats_updated', (newStats: Stats) => {
        this.stats.set(newStats);
      });
    } catch (e) {
      console.warn('WebSocket connection failed:', e);
    }
  }

  ngOnDestroy(): void {
    this.socket?.disconnect();
  }

  getStoreBarWidth(value: number): number {
    const max = Math.max(...(this.stats()?.byStore?.map(s => s.value) || [1]));
    return max ? (value / max) * 100 : 0;
  }

  getPriceBarWidth(count: number): number {
    const max = Math.max(...(this.stats()?.priceRanges?.map(r => r.count) || [1]));
    return max ? (count / max) * 100 : 0;
  }

  formatLastScrape(): string {
    const t = this.stats()?.lastScrapeTime;
    if (!t) return 'Jamais';
    return new Date(t).toLocaleString('fr-TN');
  }

  formatScraperTime(time: number): string {
    if (!time) return 'Jamais';
    return new Date(time).toLocaleString('fr-TN');
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  navigateToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }
}
