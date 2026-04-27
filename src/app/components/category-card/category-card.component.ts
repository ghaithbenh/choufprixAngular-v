import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopCategory } from '../../types';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/category', category.slug]"
       class="group relative overflow-hidden rounded-2xl cursor-pointer block"
       [style.animation-delay]="(index * 80) + 'ms'"
       [class]="'animate-in'">

      <!-- Gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br transition-all duration-500 group-hover:scale-105"
           [class]="'from-' + category.color + '-500 to-' + category.color + '-700'">
      </div>

      <!-- Pattern overlay -->
      <div class="absolute inset-0 opacity-10"
           style="background-image: radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 30px 30px;">
      </div>

      <!-- Glow effect on hover -->
      <div class="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl"
           style="background: radial-gradient(circle at center, white, transparent 70%);"></div>

      <!-- Content -->
      <div class="relative p-6 text-white">
        <!-- Icon -->
        <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">
          {{ category.icon }}
        </div>

        <!-- Label -->
        <h3 class="font-outfit font-bold text-lg leading-tight mb-1">
          {{ category.label }}
        </h3>

        <!-- Description -->
        @if (category.description) {
          <p class="text-white/70 text-xs leading-relaxed mb-3">
            {{ category.description }}
          </p>
        }

        <!-- Product count -->
        <div class="flex items-center justify-between mt-2">
          <span class="text-white/80 text-sm font-medium">
            @if (productCount > 0) {
              {{ formatCount(productCount) }} produits
            } @else {
              Explorer →
            }
          </span>
          <svg class="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </a>
  `
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: TopCategory;
  @Input() productCount: number = 0;
  @Input() index: number = 0;

  formatCount(count: number): string {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  }
}
