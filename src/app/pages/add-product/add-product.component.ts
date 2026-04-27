import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { AuthService } from '../../services/auth.service';
import { ProductFormData, Taxonomy } from '../../types';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <!-- Header -->
      <div class="text-center mb-10">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-blue-200">
          📦
        </div>
        <h1 class="font-outfit text-4xl font-black text-slate-900">Publier une annonce</h1>
        <p class="text-slate-500 mt-2">Vendez vos produits à des milliers d'acheteurs en Tunisie</p>
      </div>

      <div class="card p-8">
        <form class="space-y-6" (submit)="onSubmit($event)">

          <!-- Product name -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Nom du produit *</label>
            <input type="text"
                   [(ngModel)]="formData.name"
                   name="name"
                   placeholder="ex: iPhone 15 Pro 256GB Noir"
                   class="input-field"
                   required>
          </div>

          <!-- Price -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Prix (TND) *</label>
            <div class="relative">
              <input type="number"
                     [(ngModel)]="formData.price"
                     name="price"
                     placeholder="ex: 3500"
                     class="input-field !pr-16"
                     min="0" required>
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">DT</span>
            </div>
          </div>

          <!-- Category -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Catégorie *</label>
              <select [(ngModel)]="formData.parentCategory"
                      name="parentCategory"
                      class="input-field"
                      required
                      (change)="onCategoryChange()">
                <option value="">Choisir une catégorie</option>
                @for (cat of categoryNames(); track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Sous-catégorie</label>
              <select [(ngModel)]="formData.subcategory"
                      name="subcategory"
                      class="input-field"
                      [disabled]="!formData.parentCategory">
                <option value="">Toutes</option>
                @for (sub of currentSubcategories(); track sub) {
                  <option [value]="sub">{{ sub }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">URL de l'image</label>
            <input type="url"
                   [(ngModel)]="formData.image"
                   name="image"
                   placeholder="https://..."
                   class="input-field">
            @if (formData.image) {
              <div class="mt-3 h-40 rounded-xl overflow-hidden border border-gray-200">
                <img [src]="formData.image" alt="Aperçu" class="w-full h-full object-contain bg-slate-50"
                     (error)="onImgError($event)">
              </div>
            }
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea [(ngModel)]="formData.description"
                      name="description"
                      rows="4"
                      placeholder="Décrivez votre produit..."
                      class="input-field !h-auto resize-none">
            </textarea>
          </div>

          <!-- Error message -->
          @if (error()) {
            <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ error() }}
            </div>
          }

          <!-- Submit -->
          <button type="submit"
                  class="btn-primary w-full !py-4 text-base flex items-center justify-center gap-2"
                  [disabled]="isLoading()">
            @if (isLoading()) {
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publication...
            } @else {
              📦 Publier l'annonce
            }
          </button>
        </form>
      </div>
    </div>
  `
})
export class AddProductComponent implements OnInit {
  formData: ProductFormData = {
    name: '',
    price: '',
    parentCategory: '',
    subcategory: '',
    image: '',
    description: '',
    store: 'Communauté',
  };

  taxonomy = signal<Taxonomy>({});
  isLoading = signal(false);
  error = signal('');

  categoryNames = signal<string[]>([]);
  currentSubcategories = signal<string[]>([]);

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isSignedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.productService.getTaxonomy().subscribe(taxonomy => {
      this.taxonomy.set(taxonomy);
      this.categoryNames.set(Object.keys(taxonomy));
    });
  }

  onCategoryChange(): void {
    const subs = this.taxonomy()[this.formData.parentCategory] || [];
    this.currentSubcategories.set(subs);
    this.formData.subcategory = '';
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.formData.name || !this.formData.price || !this.formData.parentCategory) {
      this.error.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const token = await this.auth.getToken();
    if (!token) {
      this.error.set('Vous devez être connecté');
      this.isLoading.set(false);
      return;
    }

    const productData = {
      name: this.formData.name,
      price: Number(this.formData.price) * 1000, // Convert to millimes
      parentCategory: this.formData.parentCategory,
      subcategory: this.formData.subcategory || undefined,
      image: this.formData.image || undefined,
      description: this.formData.description || undefined,
      source: 'user',
    };

    this.productService.createProduct(productData, token).subscribe({
      next: () => {
        this.router.navigate(['/my-products']);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Une erreur est survenue lors de la publication');
        this.isLoading.set(false);
      }
    });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
