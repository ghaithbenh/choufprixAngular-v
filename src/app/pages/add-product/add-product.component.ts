import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { AuthService } from '../../services/auth.service';
import { ProductFormData, Taxonomy } from '../../types';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html'
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
  isEditing = signal(false);
  productId = signal<string | null>(null);
  error = signal('');

  categoryNames = signal<string[]>([]);
  currentSubcategories = signal<string[]>([]);

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.auth.isSignedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.productService.getTaxonomy().subscribe(taxonomy => {
      this.taxonomy.set(taxonomy);
      this.categoryNames.set(Object.keys(taxonomy));
      
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditing.set(true);
        this.productId.set(id);
        this.loadProductForEdit(id);
      }
    });
  }

  loadProductForEdit(id: string): void {
    this.isLoading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.formData = {
          name: product.name,
          price: String(product.price / 1000), // convert back from millimes
          parentCategory: product.parentCategory || '',
          subcategory: product.subcategory || '',
          image: product.image || '',
          description: product.description || '',
          store: product.store || 'Communauté',
        };
        this.onCategoryChange();
        this.formData.subcategory = product.subcategory || '';
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le produit.');
        this.isLoading.set(false);
      }
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
      category: this.formData.subcategory || undefined, // Set category as well
      image: this.formData.image || undefined,
      description: this.formData.description || undefined,
      source: 'user',
      store: this.formData.store || 'Communauté', // Store is required by the schema
    };

    if (this.isEditing() && this.productId()) {
      this.productService.updateProduct(this.productId()!, productData, token).subscribe({
        next: () => this.router.navigate(['/my-products']),
        error: (err) => {
          this.error.set(err?.error?.message || 'Une erreur est survenue lors de la modification');
          this.isLoading.set(false);
        }
      });
    } else {
      this.productService.createProduct(productData, token).subscribe({
        next: () => this.router.navigate(['/my-products']),
        error: (err) => {
          this.error.set(err?.error?.message || 'Une erreur est survenue lors de la publication');
          this.isLoading.set(false);
        }
      });
    }
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
