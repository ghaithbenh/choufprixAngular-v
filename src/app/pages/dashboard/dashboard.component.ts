import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { AuthService } from '../../services/auth.service';
import { Stats } from '../../types';
import { formatPrice } from '../../lib/utils';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

interface StoreInfo {
  name: string;
  productCount: number;
  lastScrapeTime?: number;
  status?: string;
  productCountScraper?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = signal<Stats | null>(null);
  stores = signal<StoreInfo[]>([]);
  isLoading = signal(true);
  isLoadingStores = signal(false);
  deletingStore = signal<string | null>(null);
  private socket: Socket | null = null;

  constructor(
    public auth: AuthService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Role guard
    if (!this.auth.isAdmin() && !this.auth.isSubAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    // Load initial stats
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

    // Load stores if admin
    if (this.auth.isAdmin()) {
      this.loadStores();
    }

    // WebSocket for real-time updates
    try {
      this.socket = io(environment.socketUrl);
      this.socket.on('stats_updated', (newStats: Stats) => {
        this.stats.set(newStats);
        if (this.auth.isAdmin()) {
          this.loadStores();
        }
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

  private async loadStores(): Promise<void> {
    this.isLoadingStores.set(true);
    this.productService.getStores().subscribe({
      next: async (storesList) => {
        const scraperStatusMap = new Map<string, any>();
        const currentStats = this.stats();
        if (currentStats?.scraperStatus) {
          currentStats.scraperStatus.forEach((s: any) => {
            scraperStatusMap.set(s.store, s);
          });
        }

        const storesWithCounts: StoreInfo[] = [];
        
        for (const storeName of storesList) {
          try {
            const products = await new Promise<any>((resolve) => {
              this.productService.getProducts({ source: storeName, limit: 1 }).subscribe({
                next: (res) => resolve(res),
                error: () => resolve({ total: 0 })
              });
            });
            
            const scraperInfo = scraperStatusMap.get(storeName) || {};
            storesWithCounts.push({
              name: storeName,
              productCount: products.total || 0,
              lastScrapeTime: scraperInfo.lastScrapeTime,
              status: scraperInfo.status,
              productCountScraper: scraperInfo.productCount
            });
          } catch {
            storesWithCounts.push({ name: storeName, productCount: 0 });
          }
        }
        
        this.stores.set(storesWithCounts);
        this.isLoadingStores.set(false);
      },
      error: () => this.isLoadingStores.set(false)
    });
  }

  async deleteStore(storeName: string): Promise<void> {
    if (!confirm(`Voulez-vous vraiment supprimer le magasin "${storeName}" et tous ses produits ? Cette action est irréversible.`)) {
      return;
    }

    this.deletingStore.set(storeName);
    const token = await this.auth.getToken();
    if (!token) return;

    this.productService.deleteStore(storeName, token).subscribe({
      next: () => {
        this.stores.update(stores => stores.filter(s => s.name !== storeName));
        this.deletingStore.set(null);
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
