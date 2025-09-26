export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  image?: string;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  cost?: number;
  minStock?: number;
  material?: string;
  gemstone?: string;
  weight?: number;
  dimensions?: string;
  images?: string[];
  tags?: string[];
  // Diamond-specific fields
  carat_weight?: number;
  clarity?: string;
  color?: string;
  cut?: string;
  shape?: string;
  certification?: string;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  depth_percentage?: number;
  table_percentage?: number;
  measurements?: string;
  origin?: string;
  treatment?: string;
}

export type ProductStatus = 
  | 'active'
  | 'inactive'
  | 'discontinued'
  | 'out_of_stock'
  | 'low_stock';

export interface CreateProductRequest {
  name: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  image?: string;
  status?: ProductStatus;
  description?: string;
  cost?: number;
  minStock?: number;
  material?: string;
  gemstone?: string;
  weight?: number;
  dimensions?: string;
  images?: string[];
  tags?: string[];
  // Diamond-specific fields
  carat_weight?: number;
  clarity?: string;
  color?: string;
  cut?: string;
  shape?: string;
  certification?: string;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  depth_percentage?: number;
  table_percentage?: number;
  measurements?: string;
  origin?: string;
  treatment?: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  stock?: number;
  category?: string;
  sku?: string;
  image?: string;
  status?: ProductStatus;
  description?: string;
  cost?: number;
  minStock?: number;
  material?: string;
  gemstone?: string;
  weight?: number;
  dimensions?: string;
  images?: string[];
  tags?: string[];
  // Diamond-specific fields
  carat_weight?: number;
  clarity?: string;
  color?: string;
  cut?: string;
  shape?: string;
  certification?: string;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  depth_percentage?: number;
  table_percentage?: number;
  measurements?: string;
  origin?: string;
  treatment?: string;
}

export interface ProductFilters {
  category?: string;
  status?: ProductStatus;
  material?: string;
  gemstone?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductStatistics {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryDistribution: Record<string, number>;
}

export interface LowStockAlert {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  category: string;
  alertLevel: 'low_stock' | 'out_of_stock';
} 