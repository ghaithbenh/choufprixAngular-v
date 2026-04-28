// Core product type
export interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  source: string; // 'scraped' | 'user'
  parentCategory?: string;
  subcategory?: string;
  description?: string;
  store?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Price history entry
export interface PriceHistory {
  _id?: string;
  productId: string;
  price: number;
  date: string;
}

// Tracked item (saved product)
export interface TrackedItem {
  _id: string;
  productId: Product;
  clerkUserId: string;
  createdAt?: string;
}

// Category type (frontend static)
export interface TopCategory {
  slug: string;
  label: string;
  icon: string;
  parentCategory: string;
  color: string;
  gradient: string;
  bgLight: string;
  textColor: string;
  description?: string;
}

// Taxonomy: { ParentCategory: ['sub1', 'sub2', ...] }
export type Taxonomy = Record<string, string[]>;

// Product count per category
export type ProductCounts = Record<string, number>;

// Store info
export interface Store {
  name: string;
  productCount?: number;
}

// Paginated product response
export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Normalized search response
export interface SearchResponse {
  results: Product[];
  total: number;
  page: number;
  totalPages: number;
  normalized?: NormalizedSearch;
}

export interface NormalizedSearch {
  normalizedQuery: string;
  specs?: string[];
  category?: string;
}

// Dashboard stats
export interface Stats {
  totalProducts: number;
  totalStores: number;
  byStore: { name: string; value: number }[];
  priceRanges: { range: string; count: number }[];
  recentlyUpdated: Product[];
  scraperStatus: ScraperStatus[];
  addedToday: number;
  lastScrapeTime: number | null;
}

export interface ScraperStatus {
  store: string;
  status: string;
  lastScrapeTime: number;
  productCount: number;
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  products?: Product[];
  links?: ChatLink[];
}

export interface ChatLink {
  label: string;
  url: string;
}

// User roles
export type UserRole = 'admin' | 'sub-admin' | undefined;

// Form data for product creation
export interface ProductFormData {
  name: string;
  price: string;
  parentCategory: string;
  subcategory: string;
  image: string;
  description: string;
  store: string;
}

// Search params for products API
export interface ProductQueryParams {
  parentCategory?: string;
  subcategory?: string;
  store?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  source?: string;
  page?: number;
  limit?: number;
}

// Search query params
export interface SearchQueryParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  parentCategory?: string;
  subcategory?: string;
  source?: string;
  page?: number;
  limit?: number;
}
