import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subcategory-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subcategory-tabs.component.html'
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
