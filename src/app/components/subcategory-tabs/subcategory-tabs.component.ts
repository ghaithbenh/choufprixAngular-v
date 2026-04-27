import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subcategory-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      <!-- All tab -->
      <button class="filter-pill flex-shrink-0 transition-all duration-200"
              [class.filter-pill-active]="!activeSubcategory"
              [class.filter-pill-inactive]="!!activeSubcategory"
              (click)="select('')">
        Tous
      </button>

      <!-- Subcategory tabs -->
      @for (sub of subcategories; track sub) {
        <button class="filter-pill flex-shrink-0 transition-all duration-200"
                [class.filter-pill-active]="activeSubcategory === sub"
                [class.filter-pill-inactive]="activeSubcategory !== sub"
                (click)="select(sub)">
          {{ sub }}
        </button>
      }
    </div>
  `
})
export class SubcategoryTabsComponent {
  @Input({ required: true }) subcategories!: string[];
  @Input() activeSubcategory: string = '';
  @Input() accentColor: string = 'blue';
  @Output() subcategorySelected = new EventEmitter<string>();

  select(sub: string): void {
    this.subcategorySelected.emit(sub);
  }
}
