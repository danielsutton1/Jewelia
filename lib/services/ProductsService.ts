import { createClient } from '@supabase/supabase-js';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters, ProductListResponse, ProductStatistics, LowStockAlert, ProductStatus } from '../../types/product';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ProductsService {
  private readonly tableName = 'inventory';  // Use inventory table instead of products
  private readonly lowStockThreshold = 10;

  /**
   * Map database columns to frontend-friendly keys
   */
  private mapProductFromDB(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name || dbProduct.Name || '',
      price: Number(dbProduct.price) || Number(dbProduct.Price) || 0,
      stock: Number(dbProduct.quantity) || Number(dbProduct.stock_quantity) || Number(dbProduct.stockQuantity) || 0,  // Map quantity to stock
      category: dbProduct.category || dbProduct.Category || '',
      sku: dbProduct.sku || dbProduct.SKU || '',
      image: dbProduct.images?.[0] || dbProduct.image || undefined,
      status: this.mapStatusFromDB(dbProduct.status || dbProduct.Status || 'active'),
      createdAt: dbProduct.created_at || dbProduct.createdAt,
      updatedAt: dbProduct.updated_at || dbProduct.updatedAt,
      description: dbProduct.description,
      cost: dbProduct.cost,
      minStock: dbProduct.min_stock || 0,  // Default to 0 if not present
      material: dbProduct.material || '',
      gemstone: dbProduct.gemstone || '',
      weight: dbProduct.weight || 0,
      dimensions: dbProduct.dimensions || {},
      images: dbProduct.images || [],  // Default to empty array
      tags: dbProduct.tags || [],
      // Diamond-specific fields
      carat_weight: dbProduct.carat_weight || 0,
      clarity: dbProduct.clarity || '',
      color: dbProduct.color || '',
      cut: dbProduct.cut || '',
      shape: dbProduct.shape || '',
      certification: dbProduct.certification || '',
      fluorescence: dbProduct.fluorescence || '',
      polish: dbProduct.polish || '',
      symmetry: dbProduct.symmetry || '',
      depth_percentage: dbProduct.depth_percentage || 0,
      table_percentage: dbProduct.table_percentage || 0,
      measurements: dbProduct.measurements || {},
      origin: dbProduct.origin || '',
      treatment: dbProduct.treatment,
    };
  }

  /**
   * Map frontend status to database status
   */
  private mapStatusToDB(status: ProductStatus): string {
    const statusMap: Record<ProductStatus, string> = {
      active: 'active',
      inactive: 'inactive',
      discontinued: 'discontinued',
      out_of_stock: 'out_of_stock',
      low_stock: 'low_stock'
    };
    return statusMap[status] || 'active';
  }

  /**
   * Map database status to frontend status
   */
  private mapStatusFromDB(dbStatus: string): ProductStatus {
    const statusMap: Record<string, ProductStatus> = {
      'active': 'active',
      'inactive': 'inactive',
      'discontinued': 'discontinued',
      'out_of_stock': 'out_of_stock',
      'low_stock': 'low_stock'
    };
    return statusMap[dbStatus] || 'active';
  }

  /**
   * Validate product data
   */
  private validateProduct(data: CreateProductRequest | UpdateProductRequest): string[] {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length === 0)) {
      errors.push('Product name is required');
    }

    if ('price' in data && (data.price === undefined || data.price < 0)) {
      errors.push('Price must be a positive number');
    }

    if ('stock' in data && (data.stock === undefined || data.stock < 0)) {
      errors.push('Stock must be a non-negative number');
    }

    if ('sku' in data && (!data.sku || data.sku.trim().length === 0)) {
      errors.push('SKU is required');
    }

    return errors;
  }

  /**
   * Check if SKU is unique
   */
  private async isSkuUnique(sku: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from(this.tableName)
      .select('id')
      .eq('sku', sku);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking SKU uniqueness:', error);
      // If the column doesn't exist, assume it's unique
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        return true;
      }
      return false;
    }

    return !data || data.length === 0;
  }

  /**
   * Update product status based on stock level
   */
  private calculateStatus(stock: number): ProductStatus {
    if (stock === 0) {
      return 'out_of_stock';
    } else if (stock <= this.lowStockThreshold) {
      return 'low_stock';
    } else {
      return 'active';
    }
  }

  /**
   * Get all products with filtering and pagination
   */
  async getProducts(filters: ProductFilters = {}, page = 1, limit = 20): Promise<ProductListResponse> {
    try {
      console.log('🔍 ProductsService.getProducts called with filters:', filters);
      
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.category) {
        console.log('🔍 Filtering by category:', filters.category);
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        console.log('🔍 Filtering by status:', filters.status);
        query = query.eq('status', this.mapStatusToDB(filters.status));
      }

      // Temporarily disable material and gemstone filters until columns are added
      // if (filters.material) {
      //   console.log('🔍 Filtering by material:', filters.material);
      //   query = query.eq('material', filters.material);
      // }

      // if (filters.gemstone) {
      //   console.log('🔍 Filtering by gemstone:', filters.gemstone);
      //   query = query.eq('gemstone', filters.gemstone);
      // }

      if (filters.minPrice !== undefined) {
        console.log('🔍 Filtering by min price:', filters.minPrice);
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        console.log('🔍 Filtering by max price:', filters.maxPrice);
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.search) {
        console.log('🔍 Filtering by search:', filters.search);
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
      }

      if (filters.inStock) {
        console.log('🔍 Filtering by in stock');
        query = query.gt('stock_quantity', 0);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by name
      query = query.order('name', { ascending: true });

      console.log('🔍 Executing query...');
      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching products:', error);
        throw new Error('Failed to fetch products');
      }

      console.log('✅ Query successful:', {
        dataCount: data?.length || 0,
        totalCount: count || 0
      });

      const products = data?.map(product => this.mapProductFromDB(product)) || [];
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      console.log('✅ Returning products:', {
        productsCount: products.length,
        total,
        page,
        totalPages
      });

      return {
        products,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('❌ Error in getProducts:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Product not found
        }
        console.error('Error fetching product:', error);
        throw new Error('Failed to fetch product');
      }

      return this.mapProductFromDB(data);
    } catch (error) {
      console.error('Error in getProduct:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const errors = this.validateProduct(productData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Check if SKU is unique
      const isUnique = await this.isSkuUnique(productData.sku);
      if (!isUnique) {
        throw new Error(`SKU ${productData.sku} already exists`);
      }

      // Calculate status based on stock
      const status = this.calculateStatus(productData.stock);

      const dbData = {
        name: productData.name,
        sku: productData.sku,
        price: productData.price,
        stock_quantity: productData.stock,
        category: productData.category || 'general',
        status: this.mapStatusToDB(status),
        images: productData.image ? [productData.image] : null,
        description: productData.description,
        cost: productData.cost,
        min_stock: productData.minStock,
        material: productData.material,
        gemstone: productData.gemstone,
        weight: productData.weight,
        dimensions: productData.dimensions,
        tags: productData.tags,
        // Diamond-specific fields
        carat_weight: productData.carat_weight,
        clarity: productData.clarity,
        color: productData.color,
        cut: productData.cut,
        shape: productData.shape,
        certification: productData.certification,
        fluorescence: productData.fluorescence,
        polish: productData.polish,
        symmetry: productData.symmetry,
        depth_percentage: productData.depth_percentage,
        table_percentage: productData.table_percentage,
        measurements: productData.measurements,
        origin: productData.origin,
        treatment: productData.treatment,
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw new Error('Failed to create product');
      }

      return this.mapProductFromDB(data);
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, updateData: UpdateProductRequest): Promise<Product> {
    try {
      const errors = this.validateProduct(updateData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Check if SKU is unique (excluding current product)
      if (updateData.sku) {
        const isUnique = await this.isSkuUnique(updateData.sku, id);
        if (!isUnique) {
          throw new Error(`SKU ${updateData.sku} already exists`);
        }
      }

      // Get current product to calculate new status
      const currentProduct = await this.getProduct(id);
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      const newStock = updateData.stock !== undefined ? updateData.stock : currentProduct.stock;
      const status = this.calculateStatus(newStock);

      const dbData: any = {};
      
      if (updateData.name !== undefined) dbData.name = updateData.name;
      if (updateData.sku !== undefined) dbData.sku = updateData.sku;
      if (updateData.category !== undefined) dbData.category = updateData.category;
      if (updateData.price !== undefined) dbData.price = updateData.price;
      if (updateData.stock !== undefined) dbData.stock_quantity = updateData.stock;
      if (updateData.image !== undefined) dbData.images = updateData.image ? [updateData.image] : null;
      if (updateData.description !== undefined) dbData.description = updateData.description;
      if (updateData.cost !== undefined) dbData.cost = updateData.cost;
      if (updateData.minStock !== undefined) dbData.min_stock = updateData.minStock;
      if (updateData.material !== undefined) dbData.material = updateData.material;
      if (updateData.gemstone !== undefined) dbData.gemstone = updateData.gemstone;
      if (updateData.weight !== undefined) dbData.weight = updateData.weight;
      if (updateData.dimensions !== undefined) dbData.dimensions = updateData.dimensions;
      if (updateData.tags !== undefined) dbData.tags = updateData.tags;
      if (updateData.carat_weight !== undefined) dbData.carat_weight = updateData.carat_weight;
      if (updateData.clarity !== undefined) dbData.clarity = updateData.clarity;
      if (updateData.color !== undefined) dbData.color = updateData.color;
      if (updateData.cut !== undefined) dbData.cut = updateData.cut;
      if (updateData.shape !== undefined) dbData.shape = updateData.shape;
      if (updateData.certification !== undefined) dbData.certification = updateData.certification;
      if (updateData.fluorescence !== undefined) dbData.fluorescence = updateData.fluorescence;
      if (updateData.polish !== undefined) dbData.polish = updateData.polish;
      if (updateData.symmetry !== undefined) dbData.symmetry = updateData.symmetry;
      if (updateData.depth_percentage !== undefined) dbData.depth_percentage = updateData.depth_percentage;
      if (updateData.table_percentage !== undefined) dbData.table_percentage = updateData.table_percentage;
      if (updateData.measurements !== undefined) dbData.measurements = updateData.measurements;
      if (updateData.origin !== undefined) dbData.origin = updateData.origin;
      if (updateData.treatment !== undefined) dbData.treatment = updateData.treatment;
      
      // Always update status based on stock
      dbData.status = this.mapStatusToDB(status);

      const { data, error } = await supabase
        .from(this.tableName)
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw new Error('Failed to update product');
      }

      return this.mapProductFromDB(data);
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  async getProductStatistics(): Promise<ProductStatistics> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('price, stock_quantity, status');

      if (error) {
        console.error('Error fetching product statistics:', error);
        throw new Error('Failed to fetch product statistics');
      }

      const products = data || [];
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, product) => sum + (Number(product.price) * Number(product.stock_quantity)), 0);
      const lowStockCount = products.filter(product => product.status === 'low_stock').length;
      const outOfStockCount = products.filter(product => product.status === 'out_of_stock').length;

      // Get category distribution
      const { data: categoryData } = await supabase
        .from(this.tableName)
        .select('category');

      const categoryCounts: Record<string, number> = {};
      categoryData?.forEach(product => {
        const category = product.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      return {
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount,
        categoryDistribution: categoryCounts
      };
    } catch (error) {
      console.error('Error in getProductStatistics:', error);
      throw error;
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, name, sku, stock_quantity, category')
        .or(`status.eq.low_stock,status.eq.out_of_stock`);

      if (error) {
        console.error('Error fetching low stock alerts:', error);
        throw new Error('Failed to fetch low stock alerts');
      }

      return (data || []).map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock: product.stock_quantity,
        minStock: 10, // Default minimum stock level
        category: product.category,
        alertLevel: product.stock_quantity === 0 ? 'out_of_stock' : 'low_stock'
      }));
    } catch (error) {
      console.error('Error in getLowStockAlerts:', error);
      throw error;
    }
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category')
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }

      const categories = [...new Set(data?.map(product => product.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, newStock: number): Promise<Product> {
    try {
      if (newStock < 0) {
        throw new Error('Stock cannot be negative');
      }

      const status = this.calculateStatus(newStock);

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          stock_quantity: newStock,
          status: this.mapStatusToDB(status)
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating stock:', error);
        throw new Error('Failed to update stock');
      }

      return this.mapProductFromDB(data);
    } catch (error) {
      console.error('Error in updateStock:', error);
      throw error;
    }
  }
} 