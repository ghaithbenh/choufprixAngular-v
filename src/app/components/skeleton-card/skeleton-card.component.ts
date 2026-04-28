import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-card.component.html'
})
export class SkeletonCardComponent {
  @Input() count: number = 1;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
