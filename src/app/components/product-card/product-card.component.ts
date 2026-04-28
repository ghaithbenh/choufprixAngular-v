import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../types';
import { AuthService } from '../../services/auth.service';
import { TrackedItemsService } from '../../api/tracked-items.service';
import { formatPrice, getStoreBadgeClass, getStoreGlowClass, formatStoreName, truncate } from '../../lib/utils';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) product!: Product;
  @Output() onClick = new EventEmitter<Product>();
  @Output() onTrackChange = new EventEmitter<boolean>();

  @Input() forceTracked?: boolean;

  isTracked = false;

  constructor(
    private auth: AuthService,
    private trackedService: TrackedItemsService
  ) {}

  ngOnInit(): void {
    if (this.forceTracked !== undefined) {
      this.isTracked = this.forceTracked;
    } else if (this.auth.isSignedIn()) {
      this.checkTracked();
    }
  }

  private async checkTracked(): Promise<void> {
    try {
      const token = await this.auth.getToken();
      if (!token) return;
      this.trackedService.getTrackedProductIds(token).subscribe(ids => {
        this.isTracked = ids.includes(this.product._id);
      });
    } catch {}
  }

  async toggleTrack(event: Event): Promise<void> {
    event.stopPropagation();
    if (!this.auth.isSignedIn()) {
      alert('Connectez-vous pour suivre ce produit');
      return;
    }
    try {
      const token = await this.auth.getToken();
      if (!token) return;
      if (this.isTracked) {
        this.trackedService.untrackProduct(this.product._id, token).subscribe(() => {
          this.isTracked = false;
          this.onTrackChange.emit(false);
        });
      } else {
        this.trackedService.trackProduct(this.product._id, token).subscribe(() => {
          this.isTracked = true;
          this.onTrackChange.emit(true);
        });
      }
    } catch {}
  }

  getStoreBadge(): string {
    return getStoreBadgeClass(this.product.source || this.product.store || '');
  }

  getGlowClass(): string {
    return getStoreGlowClass(this.product.source || this.product.store || '');
  }

  getStoreLabel(): string {
    return formatStoreName(this.product.source || this.product.store || '');
  }

  formatPrice(p: number): string {
    return formatPrice(p);
  }

  truncateName(name: string): string {
    return truncate(name, 80);
  }

  getCategoryEmoji(): string {
    const cat = this.product.parentCategory?.toLowerCase() || '';
    if (cat.includes('informat')) return '💻';
    if (cat.includes('phone') || cat.includes('mobile')) return '📱';
    if (cat.includes('gaming')) return '🎮';
    if (cat.includes('maison')) return '🏠';
    if (cat.includes('mode')) return '👗';
    if (cat.includes('beauté') || cat.includes('beauty')) return '💄';
    if (cat.includes('auto')) return '🚗';
    return '📦';
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
