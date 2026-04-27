import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'category/:slug',
        loadComponent: () =>
          import('./pages/category/category.component').then(m => m.CategoryPageComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./pages/search-results/search-results.component').then(m => m.SearchResultsComponent),
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'tracked',
        loadComponent: () =>
          import('./pages/tracked-items/tracked-items.component').then(m => m.TrackedItemsComponent),
      },
      {
        path: 'add-product',
        loadComponent: () =>
          import('./pages/add-product/add-product.component').then(m => m.AddProductComponent),
      },
      {
        path: 'my-products',
        loadComponent: () =>
          import('./pages/my-products/my-products.component').then(m => m.MyProductsComponent),
      },
      {
        path: 'marketplace',
        loadComponent: () =>
          import('./pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent),
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
