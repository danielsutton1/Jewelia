import { createClient } from '@supabase/supabase-js';

// Materials Tracking Types
export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialType {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  unit_of_measure: string;
  density?: number;
  melting_point?: number;
  created_at: string;
  updated_at: string;
}

export interface MaterialSupplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  payment_terms?: string;
  lead_time_days: number;
  minimum_order_quantity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  type_id: string;
  supplier_id?: string;
  name: string;
  sku?: string;
  description?: string;
  specifications?: any;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point?: number;
  unit_cost: number;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialPurchaseOrder {
  id: string;
  supplier_id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date?: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialPurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  material_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface MaterialUsage {
  id: string;
  material_id: string;
  production_order_id?: string;
  order_id?: string;
  quantity_used: number;
  usage_date: string;
  usage_type: 'production' | 'maintenance' | 'waste' | 'other';
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface MaterialMovement {
  id: string;
  material_id: string;
  movement_type: 'in' | 'out' | 'transfer';
  quantity: number;
  from_location?: string;
  to_location?: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface MaterialCostHistory {
  id: string;
  material_id: string;
  cost_change_date: string;
  old_cost?: number;
  new_cost: number;
  reason?: string;
  created_by?: string;
  created_at: string;
}

export interface MaterialsAnalytics {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageCost: number;
  stockTurnoverRate: number;
  topSuppliers: Array<{
    supplier_id: string;
    supplier_name: string;
    total_spent: number;
    order_count: number;
  }>;
  categoryBreakdown: Array<{
    category_id: string;
    category_name: string;
    material_count: number;
    total_value: number;
  }>;
}

export interface CostAnalysis {
  material_id: string;
  material_name: string;
  current_cost: number;
  average_cost: number;
  cost_trend: 'increasing' | 'decreasing' | 'stable';
  price_history: Array<{
    date: string;
    cost: number;
  }>;
}

export interface SupplierPerformance {
  supplier_id: string;
  supplier_name: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  on_time_delivery_rate: number;
  quality_rating: number;
  lead_time_avg: number;
}

export class MaterialsTrackingService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // ===== MATERIAL CATEGORIES MANAGEMENT =====

  async listCategories(parentId?: string): Promise<MaterialCategory[]> {
    const query = this.supabase
      .from('material_categories')
      .select('*')
      .order('name');

    if (parentId) {
      query.eq('parent_category_id', parentId);
    } else {
      query.is('parent_category_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createCategory(category: Omit<MaterialCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MaterialCategory> {
    const { data, error } = await this.supabase
      .from('material_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: Partial<MaterialCategory>): Promise<MaterialCategory> {
    const { data, error } = await this.supabase
      .from('material_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('material_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== MATERIAL TYPES MANAGEMENT =====

  async listMaterialTypes(categoryId?: string): Promise<MaterialType[]> {
    const query = this.supabase
      .from('material_types')
      .select('*')
      .order('name');

    if (categoryId) {
      query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createMaterialType(type: Omit<MaterialType, 'id' | 'created_at' | 'updated_at'>): Promise<MaterialType> {
    const { data, error } = await this.supabase
      .from('material_types')
      .insert(type)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMaterialType(id: string, updates: Partial<MaterialType>): Promise<MaterialType> {
    const { data, error } = await this.supabase
      .from('material_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMaterialType(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('material_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== MATERIALS MANAGEMENT =====

  async listMaterials(filters?: {
    categoryId?: string;
    typeId?: string;
    supplierId?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
    active?: boolean;
  }): Promise<Material[]> {
    let query = this.supabase
      .from('materials')
      .select('*')
      .order('name');

    if (filters?.categoryId) {
      query = query.eq('type_id', filters.categoryId);
    }
    if (filters?.typeId) {
      query = query.eq('type_id', filters.typeId);
    }
    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }
    if (filters?.lowStock) {
      query = query.lte('current_stock', 'reorder_point');
    }
    if (filters?.outOfStock) {
      query = query.eq('current_stock', 0);
    }
    if (filters?.active !== undefined) {
      query = query.eq('is_active', filters.active);
    }

    const { data: materials, error } = await query;
    if (error) throw error;
    return materials || [];
  }

  async createMaterial(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
    const { data, error } = await this.supabase
      .from('materials')
      .insert(material)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material> {
    const { data, error } = await this.supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMaterial(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getMaterial(id: string): Promise<Material> {
    const { data, error } = await this.supabase
      .from('materials')
      .select(`
        *,
        material_types(name, unit_of_measure),
        material_categories(name),
        material_suppliers(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // ===== SUPPLIER MANAGEMENT =====

  async listSuppliers(active?: boolean): Promise<MaterialSupplier[]> {
    const query = this.supabase
      .from('material_suppliers')
      .select('*')
      .order('name');

    if (active !== undefined) {
      query.eq('is_active', active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createSupplier(supplier: Omit<MaterialSupplier, 'id' | 'created_at' | 'updated_at'>): Promise<MaterialSupplier> {
    const { data, error } = await this.supabase
      .from('material_suppliers')
      .insert(supplier)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSupplier(id: string, updates: Partial<MaterialSupplier>): Promise<MaterialSupplier> {
    const { data, error } = await this.supabase
      .from('material_suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('material_suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== PURCHASE ORDERS =====

  async createPurchaseOrder(po: Omit<MaterialPurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<MaterialPurchaseOrder> {
    const { data, error } = await this.supabase
      .from('material_purchase_orders')
      .insert(po)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePurchaseOrder(id: string, updates: Partial<MaterialPurchaseOrder>): Promise<MaterialPurchaseOrder> {
    const { data, error } = await this.supabase
      .from('material_purchase_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPurchaseOrder(id: string): Promise<MaterialPurchaseOrder> {
    const { data, error } = await this.supabase
      .from('material_purchase_orders')
      .select(`
        *,
        material_suppliers(name),
        material_purchase_order_items(
          *,
          materials(name, sku)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async listPurchaseOrders(filters?: {
    supplierId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MaterialPurchaseOrder[]> {
    let query = this.supabase
      .from('material_purchase_orders')
      .select(`
        *,
        material_suppliers(name)
      `)
      .order('order_date', { ascending: false });

    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('order_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('order_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async addPurchaseOrderItem(item: Omit<MaterialPurchaseOrderItem, 'id' | 'created_at' | 'updated_at'>): Promise<MaterialPurchaseOrderItem> {
    const { data, error } = await this.supabase
      .from('material_purchase_order_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePurchaseOrderItem(id: string, updates: Partial<MaterialPurchaseOrderItem>): Promise<MaterialPurchaseOrderItem> {
    const { data, error } = await this.supabase
      .from('material_purchase_order_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== USAGE TRACKING =====

  async recordUsage(usage: Omit<MaterialUsage, 'id' | 'created_at'>): Promise<MaterialUsage> {
    const { data, error } = await this.supabase
      .from('material_usage')
      .insert(usage)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUsageHistory(materialId?: string, startDate?: string, endDate?: string): Promise<MaterialUsage[]> {
    let query = this.supabase
      .from('material_usage')
      .select(`
        *,
        materials(name, sku)
      `)
      .order('usage_date', { ascending: false });

    if (materialId) {
      query = query.eq('material_id', materialId);
    }
    if (startDate) {
      query = query.gte('usage_date', startDate);
    }
    if (endDate) {
      query = query.lte('usage_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getUsageByProject(productionOrderId?: string, orderId?: string): Promise<MaterialUsage[]> {
    let query = this.supabase
      .from('material_usage')
      .select(`
        *,
        materials(name, sku)
      `)
      .order('usage_date', { ascending: false });

    if (productionOrderId) {
      query = query.eq('production_order_id', productionOrderId);
    }
    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ===== MATERIAL MOVEMENTS =====

  async recordMovement(movement: Omit<MaterialMovement, 'id' | 'created_at'>): Promise<MaterialMovement> {
    const { data, error } = await this.supabase
      .from('material_movements')
      .insert(movement)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMovementHistory(materialId?: string, movementType?: string): Promise<MaterialMovement[]> {
    let query = this.supabase
      .from('material_movements')
      .select(`
        *,
        materials(name, sku)
      `)
      .order('created_at', { ascending: false });

    if (materialId) {
      query = query.eq('material_id', materialId);
    }
    if (movementType) {
      query = query.eq('movement_type', movementType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ===== COST HISTORY =====

  async recordCostChange(costChange: Omit<MaterialCostHistory, 'id' | 'created_at'>): Promise<MaterialCostHistory> {
    const { data, error } = await this.supabase
      .from('material_cost_history')
      .insert(costChange)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCostHistory(materialId: string): Promise<MaterialCostHistory[]> {
    const { data, error } = await this.supabase
      .from('material_cost_history')
      .select('*')
      .eq('material_id', materialId)
      .order('cost_change_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ===== ANALYTICS AND REPORTING =====

  async getMaterialsAnalytics(): Promise<MaterialsAnalytics> {
    // Get basic counts and totals
    const { data: materials } = await this.supabase
      .from('materials')
      .select('current_stock, unit_cost, reorder_point');

    const totalMaterials = materials?.length || 0;
    const totalValue = materials?.reduce((sum, m) => sum + (m.current_stock * m.unit_cost), 0) || 0;
    const lowStockItems = materials?.filter(m => m.current_stock <= (m.reorder_point || 0)).length || 0;
    const outOfStockItems = materials?.filter(m => m.current_stock === 0).length || 0;
    const averageCost = materials?.length ? totalValue / materials.reduce((sum, m) => sum + m.current_stock, 0) : 0;

    // Get top suppliers
    const { data: topSuppliers } = await this.supabase
      .from('material_purchase_orders')
      .select(`
        supplier_id,
        total_amount,
        material_suppliers(name)
      `)
      .not('supplier_id', 'is', null);

    const supplierStats = topSuppliers?.reduce((acc, po) => {
      const supplierId = po.supplier_id;
      if (!acc[supplierId]) {
        acc[supplierId] = {
          supplier_id: supplierId,
          supplier_name: po.material_suppliers?.[0]?.name || 'Unknown',
          total_spent: 0,
          order_count: 0
        };
      }
      acc[supplierId].total_spent += po.total_amount || 0;
      acc[supplierId].order_count += 1;
      return acc;
    }, {} as Record<string, {
      supplier_id: string;
      supplier_name: string;
      total_spent: number;
      order_count: number;
    }>);

    const topSuppliersList = Object.values(supplierStats || {})
      .sort((a: any, b: any) => (b.total_spent || 0) - (a.total_spent || 0))
      .slice(0, 5) as Array<{
        supplier_id: string;
        supplier_name: string;
        total_spent: number;
        order_count: number;
      }>;

    // Get category breakdown
    const { data: categoryBreakdown } = await this.supabase
      .from('materials')
      .select(`
        current_stock,
        unit_cost,
        material_types(
          material_categories(id, name)
        )
      `);

    const categoryStats = categoryBreakdown?.reduce((acc, material) => {
      const categoryId = material.material_types?.[0]?.material_categories?.[0]?.id;
      const categoryName = material.material_types?.[0]?.material_categories?.[0]?.name;
      if (categoryId && categoryName) {
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category_id: categoryId,
            category_name: categoryName,
            material_count: 0,
            total_value: 0
          };
        }
        acc[categoryId].material_count += 1;
        acc[categoryId].total_value += (material.current_stock * material.unit_cost);
      }
      return acc;
    }, {} as Record<string, any>);

    const categoryBreakdownList = Object.values(categoryStats || {}) as Array<{
      category_id: string;
      category_name: string;
      material_count: number;
      total_value: number;
    }>;

    return {
      totalMaterials,
      totalValue,
      lowStockItems,
      outOfStockItems,
      averageCost,
      stockTurnoverRate: 0, // Would need more complex calculation
      topSuppliers: topSuppliersList,
      categoryBreakdown: categoryBreakdownList
    };
  }

  async getCostAnalysis(materialId: string): Promise<CostAnalysis> {
    const material = await this.getMaterial(materialId);
    const costHistory = await this.getCostHistory(materialId);

    const priceHistory = costHistory.map(ch => ({
      date: ch.cost_change_date,
      cost: ch.new_cost
    }));

    // Determine cost trend
    let costTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (priceHistory.length >= 2) {
      const recent = priceHistory[0].cost;
      const previous = priceHistory[1].cost;
      if (recent > previous) costTrend = 'increasing';
      else if (recent < previous) costTrend = 'decreasing';
    }

    const averageCost = priceHistory.length > 0 
      ? priceHistory.reduce((sum, ph) => sum + ph.cost, 0) / priceHistory.length 
      : material.unit_cost;

    return {
      material_id: materialId,
      material_name: material.name,
      current_cost: material.unit_cost,
      average_cost: averageCost,
      cost_trend: costTrend,
      price_history: priceHistory
    };
  }

  async getSupplierPerformance(supplierId?: string): Promise<SupplierPerformance[]> {
    let query = this.supabase
      .from('material_purchase_orders')
      .select(`
        supplier_id,
        total_amount,
        order_date,
        expected_delivery_date,
        material_suppliers(name, lead_time_days)
      `)
      .not('supplier_id', 'is', null);

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    const { data: orders } = await query;

    const supplierStats = orders?.reduce((acc, order) => {
      const supplierId = order.supplier_id;
      if (!acc[supplierId]) {
        acc[supplierId] = {
          supplier_id: supplierId,
          supplier_name: order.material_suppliers?.[0]?.name || 'Unknown',
          total_orders: 0,
          total_spent: 0,
          average_order_value: 0,
          on_time_delivery_rate: 0,
          quality_rating: 0,
          lead_time_avg: order.material_suppliers?.[0]?.lead_time_days || 0
        };
      }
      acc[supplierId].total_orders += 1;
      acc[supplierId].total_spent += order.total_amount || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(supplierStats || {}).map((supplier: any) => ({
      ...supplier,
      average_order_value: supplier.total_orders > 0 ? supplier.total_spent / supplier.total_orders : 0,
      on_time_delivery_rate: 0.95, // Placeholder - would need delivery tracking
      quality_rating: 4.5 // Placeholder - would need quality tracking
    }));
  }

  // ===== STOCK MANAGEMENT =====

  async checkLowStockItems(): Promise<Material[]> {
    const { data, error } = await this.supabase
      .from('materials')
      .select(`
        *,
        material_types(name),
        material_suppliers(name)
      `)
      .lte('current_stock', 'reorder_point')
      .gt('reorder_point', 0);

    if (error) throw error;
    return data || [];
  }

  async checkOutOfStockItems(): Promise<Material[]> {
    const { data, error } = await this.supabase
      .from('materials')
      .select(`
        *,
        material_types(name),
        material_suppliers(name)
      `)
      .eq('current_stock', 0);

    if (error) throw error;
    return data || [];
  }

  async updateStockLevel(materialId: string, quantity: number, movementType: 'in' | 'out'): Promise<void> {
    const movement = {
      material_id: materialId,
      movement_type: movementType,
      quantity: quantity,
      notes: `Stock ${movementType === 'in' ? 'addition' : 'reduction'}`
    };

    await this.recordMovement(movement);
  }
} 