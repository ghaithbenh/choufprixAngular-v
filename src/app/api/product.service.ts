import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  Product,
  ProductsResponse,
  SearchResponse,
  Taxonomy,
  ProductCounts,
  PriceHistory,
  ProductQueryParams,
  SearchQueryParams
} from '../types';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiClientService) {}

  getProducts(params: ProductQueryParams = {}): Observable<ProductsResponse> {
    return this.api.get<ProductsResponse>('/products', params as Record<string, any>);
  }

  searchProducts(params: SearchQueryParams): Observable<SearchResponse> {
    return this.api.get<SearchResponse>('/products/search', params as Record<string, any>);
  }

  getProductById(id: string): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  getPriceHistory(productId: string): Observable<PriceHistory[]> {
    return this.api.get<PriceHistory[]>(`/price-history/${productId}`);
  }

  getStores(): Observable<string[]> {
    return this.api.get<string[]>('/products/stores');
  }

  getTaxonomy(): Observable<Taxonomy> {
    return this.api.get<Taxonomy>('/products/taxonomy');
  }

  getProductCounts(): Observable<ProductCounts> {
    return this.api.get<ProductCounts>('/products/counts');
  }

  getTrendingProducts(limit = 8): Observable<Product[]> {
    return this.api.get<Product[]>('/products', { limit, page: 1 });
  }

  createProduct(data: Partial<Product>, token: string): Observable<Product> {
    return this.api.post<Product>('/products', data, token);
  }

  updateProduct(id: string, data: Partial<Product>, token: string): Observable<Product> {
    return this.api.patch<Product>(`/products/${id}`, data, token);
  }

  getUserProducts(token: string): Observable<Product[]> {
    return this.api.get<Product[]>('/products/user/all', undefined, token);
  }

  deleteProduct(id: string, token: string): Observable<void> {
    return this.api.delete<void>(`/products/${id}`, token);
  }

  getDashboardStats(token: string): Observable<any> {
    return this.api.get<any>('/products/stats', undefined, token);
  }

  deleteStore(storeName: string, token: string): Observable<{ deletedProducts: number }> {
    return this.api.delete<{ deletedProducts: number }>(`/products/stores/${encodeURIComponent(storeName)}`, token);
  }
}
