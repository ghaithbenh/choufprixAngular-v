import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages > 1) {
      <div class="flex items-center justify-center gap-2 mt-8">
        <!-- Previous -->
        <button class="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                [disabled]="currentPage <= 1"
                (click)="changePage(currentPage - 1)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Précédent
        </button>

        <!-- Page numbers -->
        @for (page of getPageNumbers(); track page) {
          @if (page === -1) {
            <span class="px-2 text-slate-400">...</span>
          } @else {
            <button class="w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200"
                    [class.bg-gradient-to-r]="page === currentPage"
                    [class.from-blue-600]="page === currentPage"
                    [class.to-indigo-600]="page === currentPage"
                    [class.text-white]="page === currentPage"
                    [class.shadow-md]="page === currentPage"
                    [class.shadow-blue-200]="page === currentPage"
                    [class.bg-white]="page !== currentPage"
                    [class.border]="page !== currentPage"
                    [class.border-gray-200]="page !== currentPage"
                    [class.text-slate-600]="page !== currentPage"
                    [class.hover:bg-blue-50]="page !== currentPage"
                    (click)="changePage(page)">
              {{ page }}
            </button>
          }
        }

        <!-- Next -->
        <button class="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                [disabled]="currentPage >= totalPages"
                (click)="changePage(currentPage + 1)">
          Suivant
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    }
  `
})
export class PaginationComponent {
  @Input({ required: true }) currentPage!: number;
  @Input({ required: true }) totalPages!: number;
  @Output() pageChange = new EventEmitter<number>();

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }
}
