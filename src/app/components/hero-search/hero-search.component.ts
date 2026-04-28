import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-search.component.html'
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
