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
  templateUrl: './dashboard.component.html'
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
