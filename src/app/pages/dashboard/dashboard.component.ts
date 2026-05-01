import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
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
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = signal<Stats | null>(null);
  isLoading = signal(true);
  deletingStore = signal<string | null>(null);
  private socket: Socket | null = null;

  // Derive stores directly from stats.byStore (no extra API call needed)
  stores = computed(() => {
    const s = this.stats();
    if (!s?.byStore) return [];
    const scraperMap = new Map<string, any>();
    s.scraperStatus?.forEach((sc: any) => scraperMap.set(sc.store, sc));
    return s.byStore.map(store => ({
      name: store.name,
      productCount: store.value,
      status: scraperMap.get(store.name)?.status,
      lastScrapeTime: scraperMap.get(store.name)?.lastScrapeTime,
      productCountScraper: scraperMap.get(store.name)?.productCount
    }));
  });

  constructor(
    public auth: AuthService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin() && !this.auth.isSubAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.auth.getToken().then(token => {
      if (!token) return;
      this.productService.getDashboardStats(token).subscribe({
        next: (data) => {
          this.stats.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    });

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

  async deleteStore(storeName: string): Promise<void> {
    if (!confirm(`Voulez-vous vraiment supprimer le magasin "${storeName}" et tous ses produits ? Cette action est irréversible.`)) {
      return;
    }

    this.deletingStore.set(storeName);
    const token = await this.auth.getToken();
    if (!token) { this.deletingStore.set(null); return; }

    this.productService.deleteStore(storeName, token).subscribe({
      next: (result: any) => {
        // Refresh stats so stores list updates
        this.auth.getToken().then(t => {
          if (t) {
            this.productService.getDashboardStats(t).subscribe({
              next: (data) => this.stats.set(data)
            });
          }
        });
        this.deletingStore.set(null);
        alert(`Supprimé : ${result.deletedProducts} produits, ${result.deletedPriceHistory} historiques de prix`);
      },
      error: (err) => {
        alert(err?.error?.message || 'Erreur lors de la suppression');
        this.deletingStore.set(null);
      }
    });
  }

  navigateToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }
}
