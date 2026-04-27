import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="relative group" (submit)="onSubmit($event)">
      <div class="relative flex items-center bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-gray-200/80 overflow-hidden transition-all duration-300 focus-within:shadow-blue-200/60 focus-within:border-blue-300">
        <!-- Search icon -->
        <div class="pl-5 text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
        </div>

        <!-- Input -->
        <input type="text"
               [(ngModel)]="query"
               name="search"
               [placeholder]="placeholder || 'Rechercher un produit... (ex: iPhone 15, Samsung TV 55)'"
               class="flex-1 px-4 py-4 text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none text-base"
               (keyup.enter)="search()">

        <!-- Clear button -->
        @if (query) {
          <button type="button"
                  class="px-3 text-slate-400 hover:text-slate-600 transition-colors"
                  (click)="clearSearch()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        }

        <!-- Search button -->
        <button type="submit"
                class="m-2 btn-primary !py-2.5 !px-6 flex-shrink-0 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <span class="hidden sm:inline">Rechercher</span>
        </button>
      </div>
    </form>
  `
})
export class HeroSearchComponent {
  @Input() categorySlug?: string;
  @Input() placeholder?: string;
  @Input() initialQuery?: string;
  @Output() queryChanged = new EventEmitter<string>();

  query: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.initialQuery) {
      this.query = this.initialQuery;
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.search();
  }

  search(): void {
    const trimmed = this.query.trim();
    if (!trimmed) return;

    if (this.categorySlug) {
      this.router.navigate(['/category', this.categorySlug], {
        queryParams: { q: trimmed }
      });
    } else {
      this.router.navigate(['/search'], {
        queryParams: { q: trimmed }
      });
    }
    this.queryChanged.emit(trimmed);
  }

  clearSearch(): void {
    this.query = '';
    this.queryChanged.emit('');
  }
}
