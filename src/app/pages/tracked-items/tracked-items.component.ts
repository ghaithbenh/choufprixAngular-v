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
  templateUrl: './tracked-items.component.html'
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

  handleTrackChange(isTracked: boolean, itemId: string): void {
    if (!isTracked) {
      this.items.update(items => items.filter(i => i._id !== itemId));
    }
  }

  navigateToProduct(product: any): void {
    this.router.navigate(['/product', product._id]);
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }
}
