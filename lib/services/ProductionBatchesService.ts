import { createClient } from '@supabase/supabase-js';

// Production Batches Types
export interface ProductionBatch {
  id: string;
  batch_number: string;
  name: string;
  description?: string;
  status: 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_start_date?: string;
  estimated_completion_date?: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  total_estimated_hours: number;
  total_actual_hours: number;
  total_estimated_cost: number;
  total_actual_cost: number;
  notes?: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface BatchItem {
  id: string;
  batch_id: string;
  production_order_id?: string;
  order_id?: string;
  item_name: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimated_hours: number;
  actual_hours: number;
  estimated_cost: number;
  actual_cost: number;
  priority_order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionSchedule {
  id: string;
  batch_id?: string;
  schedule_date: string;
  shift: 'morning' | 'day' | 'evening' | 'night';
  start_time?: string;
  end_time?: string;
  total_hours?: number;
  capacity_utilization: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  batch_id: string;
  batch_item_id?: string;
  work_order_number: string;
  title: string;
  description?: string;
  instructions?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours: number;
  actual_hours: number;
  assigned_to?: string;
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  quality_requirements?: string;
  materials_required?: any;
  equipment_required?: any;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderStep {
  id: string;
  work_order_id: string;
  step_number: number;
  step_name: string;
  description?: string;
  instructions?: string;
  estimated_duration_minutes: number;
  actual_duration_minutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  equipment_id?: string;
  materials_required?: any;
  quality_checkpoints?: any;
  dependencies?: any;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BatchProgress {
  id: string;
  batch_id: string;
  work_order_id?: string;
  step_id?: string;
  progress_type: 'batch_started' | 'batch_completed' | 'work_order_started' | 'work_order_completed' | 'step_started' | 'step_completed' | 'quality_check' | 'issue_reported';
  status: string;
  description?: string;
  hours_logged: number;
  cost_incurred: number;
  quality_score?: number;
  issues_reported?: string;
  resolution_notes?: string;
  recorded_by?: string;
  recorded_at: string;
  created_at: string;
}

export interface ResourceAllocation {
  id: string;
  batch_id?: string;
  work_order_id?: string;
  resource_type: 'equipment' | 'labor' | 'material' | 'space';
  resource_id?: string;
  resource_name: string;
  allocation_date: string;
  start_time?: string;
  end_time?: string;
  hours_allocated: number;
  hours_used: number;
  cost_per_hour: number;
  total_cost: number;
  status: 'allocated' | 'in_use' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionDependency {
  id: string;
  dependent_batch_id: string;
  prerequisite_batch_id: string;
  dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag_days: number;
  description?: string;
  created_at: string;
}

export interface BatchAnalytics {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  averageCompletionTime: number;
  onTimeDeliveryRate: number;
  totalProductionHours: number;
  totalProductionCost: number;
  efficiencyScore: number;
  topPerformingBatches: Array<{
    batch_id: string;
    batch_number: string;
    name: string;
    efficiency_score: number;
    completion_time: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface ProductionMetrics {
  batch_id: string;
  batch_number: string;
  name: string;
  efficiency_score: number;
  quality_score: number;
  cost_variance: number;
  time_variance: number;
  resource_utilization: number;
  completion_rate: number;
}

export interface EfficiencyStats {
  overall_efficiency: number;
  quality_score: number;
  cost_efficiency: number;
  time_efficiency: number;
  resource_utilization: number;
  on_time_delivery_rate: number;
  average_cycle_time: number;
  throughput_rate: number;
}

export class ProductionBatchesService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // ===== BATCH MANAGEMENT =====

  async listBatches(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ProductionBatch[]> {
    let query = this.supabase
      .from('production_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters?.startDate) {
      query = query.gte('estimated_start_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('estimated_completion_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createBatch(batch: Omit<ProductionBatch, 'id' | 'created_at' | 'updated_at'>): Promise<ProductionBatch> {
    const { data, error } = await this.supabase
      .from('production_batches')
      .insert(batch)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBatch(id: string): Promise<ProductionBatch> {
    const { data, error } = await this.supabase
      .from('production_batches')
      .select(`
        *,
        batch_items(*),
        work_orders(*),
        production_schedules(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateBatch(id: string, updates: Partial<ProductionBatch>): Promise<ProductionBatch> {
    const { data, error } = await this.supabase
      .from('production_batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBatch(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('production_batches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updateBatchStatus(id: string, status: ProductionBatch['status']): Promise<ProductionBatch> {
    const updates: Partial<ProductionBatch> = { status };

    // Set actual dates based on status
    if (status === 'in_progress') {
      updates.actual_start_date = new Date().toISOString().split('T')[0];
    } else if (status === 'completed') {
      updates.actual_completion_date = new Date().toISOString().split('T')[0];
    }

    return this.updateBatch(id, updates);
  }

  // ===== BATCH ITEMS MANAGEMENT =====

  async addBatchItem(item: Omit<BatchItem, 'id' | 'created_at' | 'updated_at'>): Promise<BatchItem> {
    const { data, error } = await this.supabase
      .from('batch_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBatchItem(id: string, updates: Partial<BatchItem>): Promise<BatchItem> {
    const { data, error } = await this.supabase
      .from('batch_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBatchItems(batchId: string): Promise<BatchItem[]> {
    const { data, error } = await this.supabase
      .from('batch_items')
      .select('*')
      .eq('batch_id', batchId)
      .order('priority_order');

    if (error) throw error;
    return data || [];
  }

  // ===== WORK ORDER MANAGEMENT =====

  async createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrder> {
    const { data, error } = await this.supabase
      .from('work_orders')
      .insert(workOrder)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
    const { data, error } = await this.supabase
      .from('work_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkOrder(id: string): Promise<WorkOrder> {
    const { data, error } = await this.supabase
      .from('work_orders')
      .select(`
        *,
        work_order_steps(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async listWorkOrders(filters?: {
    batchId?: string;
    status?: string;
    assignedTo?: string;
  }): Promise<WorkOrder[]> {
    let query = this.supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.batchId) {
      query = query.eq('batch_id', filters.batchId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ===== WORK ORDER STEPS MANAGEMENT =====

  async addWorkOrderStep(step: Omit<WorkOrderStep, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderStep> {
    const { data, error } = await this.supabase
      .from('work_order_steps')
      .insert(step)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkOrderStep(id: string, updates: Partial<WorkOrderStep>): Promise<WorkOrderStep> {
    const { data, error } = await this.supabase
      .from('work_order_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkOrderSteps(workOrderId: string): Promise<WorkOrderStep[]> {
    const { data, error } = await this.supabase
      .from('work_order_steps')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('step_number');

    if (error) throw error;
    return data || [];
  }

  // ===== SCHEDULING OPERATIONS =====

  async scheduleProduction(schedule: Omit<ProductionSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<ProductionSchedule> {
    const { data, error } = await this.supabase
      .from('production_schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSchedule(id: string, updates: Partial<ProductionSchedule>): Promise<ProductionSchedule> {
    const { data, error } = await this.supabase
      .from('production_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSchedule(batchId?: string, startDate?: string, endDate?: string): Promise<ProductionSchedule[]> {
    let query = this.supabase
      .from('production_schedules')
      .select('*')
      .order('schedule_date');

    if (batchId) {
      query = query.eq('batch_id', batchId);
    }
    if (startDate) {
      query = query.gte('schedule_date', startDate);
    }
    if (endDate) {
      query = query.lte('schedule_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ===== PROGRESS TRACKING =====

  async recordProgress(progress: Omit<BatchProgress, 'id' | 'created_at'>): Promise<BatchProgress> {
    const { data, error } = await this.supabase
      .from('batch_progress')
      .insert(progress)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProgress(id: string, updates: Partial<BatchProgress>): Promise<BatchProgress> {
    const { data, error } = await this.supabase
      .from('batch_progress')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBatchProgress(batchId: string): Promise<BatchProgress[]> {
    const { data, error } = await this.supabase
      .from('batch_progress')
      .select('*')
      .eq('batch_id', batchId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWorkOrderProgress(workOrderId: string): Promise<BatchProgress[]> {
    const { data, error } = await this.supabase
      .from('batch_progress')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ===== RESOURCE MANAGEMENT =====

  async allocateResources(allocation: Omit<ResourceAllocation, 'id' | 'created_at' | 'updated_at'>): Promise<ResourceAllocation> {
    const { data, error } = await this.supabase
      .from('resource_allocation')
      .insert(allocation)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAllocation(id: string, updates: Partial<ResourceAllocation>): Promise<ResourceAllocation> {
    const { data, error } = await this.supabase
      .from('resource_allocation')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getResourceUsage(filters?: {
    resourceType?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ResourceAllocation[]> {
    let query = this.supabase
      .from('resource_allocation')
      .select('*')
      .order('allocation_date', { ascending: false });

    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }
    if (filters?.resourceId) {
      query = query.eq('resource_id', filters.resourceId);
    }
    if (filters?.startDate) {
      query = query.gte('allocation_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('allocation_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ===== DEPENDENCY MANAGEMENT =====

  async addDependency(dependency: Omit<ProductionDependency, 'id' | 'created_at'>): Promise<ProductionDependency> {
    const { data, error } = await this.supabase
      .from('production_dependencies')
      .insert(dependency)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDependencies(batchId: string): Promise<ProductionDependency[]> {
    const { data, error } = await this.supabase
      .from('production_dependencies')
      .select('*')
      .or(`dependent_batch_id.eq.${batchId},prerequisite_batch_id.eq.${batchId}`);

    if (error) throw error;
    return data || [];
  }

  // ===== ANALYTICS & REPORTING =====

  async getBatchAnalytics(): Promise<BatchAnalytics> {
    // Get basic counts
    const { data: batches } = await this.supabase
      .from('production_batches')
      .select('id, batch_number, name, status, total_actual_hours, total_actual_cost, actual_start_date, actual_completion_date');

    const totalBatches = batches?.length || 0;
    const activeBatches = batches?.filter(b => ['scheduled', 'in_progress'].includes(b.status)).length || 0;
    const completedBatches = batches?.filter(b => b.status === 'completed').length || 0;

    // Calculate averages and metrics
    const completedBatchesData = batches?.filter(b => b.status === 'completed') || [];
    const averageCompletionTime = completedBatchesData.length > 0 
      ? completedBatchesData.reduce((sum, b) => {
          if (b.actual_start_date && b.actual_completion_date) {
            const start = new Date(b.actual_start_date);
            const end = new Date(b.actual_completion_date);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
          }
          return sum;
        }, 0) / completedBatchesData.length 
      : 0;

    const totalProductionHours = batches?.reduce((sum, b) => sum + (b.total_actual_hours || 0), 0) || 0;
    const totalProductionCost = batches?.reduce((sum, b) => sum + (b.total_actual_cost || 0), 0) || 0;

    // Get status breakdown
    const statusCounts = batches?.reduce((acc, batch) => {
      acc[batch.status] = (acc[batch.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalBatches > 0 ? (count / totalBatches) * 100 : 0
    }));

    // Get top performing batches (placeholder - would need more complex calculation)
    const topPerformingBatches = completedBatchesData.slice(0, 5).map(batch => ({
      batch_id: batch.id,
      batch_number: batch.batch_number || 'Unknown',
      name: batch.name || 'Unknown',
      efficiency_score: 0.85, // Placeholder
      completion_time: 0 // Placeholder
    }));

    return {
      totalBatches,
      activeBatches,
      completedBatches,
      averageCompletionTime,
      onTimeDeliveryRate: 0.92, // Placeholder
      totalProductionHours,
      totalProductionCost,
      efficiencyScore: 0.87, // Placeholder
      topPerformingBatches,
      statusBreakdown
    };
  }

  async getProductionMetrics(batchId?: string): Promise<ProductionMetrics[]> {
    let query = this.supabase
      .from('production_batches')
      .select('id, batch_number, name, total_estimated_hours, total_actual_hours, total_estimated_cost, total_actual_cost');

    if (batchId) {
      query = query.eq('id', batchId);
    }

    const { data: batches } = await query;

    return (batches || []).map(batch => {
      const timeVariance = batch.total_estimated_hours > 0 
        ? ((batch.total_actual_hours - batch.total_estimated_hours) / batch.total_estimated_hours) * 100 
        : 0;
      
      const costVariance = batch.total_estimated_cost > 0 
        ? ((batch.total_actual_cost - batch.total_estimated_cost) / batch.total_estimated_cost) * 100 
        : 0;

      return {
        batch_id: batch.id,
        batch_number: batch.batch_number,
        name: batch.name,
        efficiency_score: 0.85, // Placeholder calculation
        quality_score: 0.92, // Placeholder
        cost_variance: costVariance,
        time_variance: timeVariance,
        resource_utilization: 0.78, // Placeholder
        completion_rate: 0.95 // Placeholder
      };
    });
  }

  async getEfficiencyStats(): Promise<EfficiencyStats> {
    const { data: batches } = await this.supabase
      .from('production_batches')
      .select('total_estimated_hours, total_actual_hours, total_estimated_cost, total_actual_cost, status');

    const completedBatches = batches?.filter(b => b.status === 'completed') || [];
    
    const totalEstimatedHours = completedBatches.reduce((sum, b) => sum + (b.total_estimated_hours || 0), 0);
    const totalActualHours = completedBatches.reduce((sum, b) => sum + (b.total_actual_hours || 0), 0);
    const totalEstimatedCost = completedBatches.reduce((sum, b) => sum + (b.total_estimated_cost || 0), 0);
    const totalActualCost = completedBatches.reduce((sum, b) => sum + (b.total_actual_cost || 0), 0);

    const timeEfficiency = totalEstimatedHours > 0 ? (totalEstimatedHours / totalActualHours) * 100 : 0;
    const costEfficiency = totalEstimatedCost > 0 ? (totalEstimatedCost / totalActualCost) * 100 : 0;

    return {
      overall_efficiency: (timeEfficiency + costEfficiency) / 2,
      quality_score: 0.92, // Placeholder
      cost_efficiency: costEfficiency,
      time_efficiency: timeEfficiency,
      resource_utilization: 0.78, // Placeholder
      on_time_delivery_rate: 0.95, // Placeholder
      average_cycle_time: 5.2, // Placeholder - days
      throughput_rate: 12.5 // Placeholder - batches per week
    };
  }

  // ===== BATCH OPTIMIZATION =====

  async optimizeBatchGrouping(productionOrders: Array<{
    id: string;
    estimated_hours?: number;
    estimated_cost?: number;
  }>): Promise<Array<{
    id: string;
    name: string;
    orders: any[];
    estimated_hours: number;
    estimated_cost: number;
  }>> {
    // This is a placeholder for batch optimization logic
    // In a real implementation, this would use algorithms to group orders
    // based on materials, processes, equipment, and timing constraints
    
    const batches: Array<{
      id: string;
      name: string;
      orders: any[];
      estimated_hours: number;
      estimated_cost: number;
    }> = [];
    let currentBatch = {
      id: `batch-${Date.now()}`,
      name: `Optimized Batch ${batches.length + 1}`,
      orders: [] as any[],
      estimated_hours: 0,
      estimated_cost: 0
    };

    for (const order of productionOrders) {
      if (currentBatch.estimated_hours + (order.estimated_hours || 0) <= 40) { // 40-hour batch limit
        currentBatch.orders.push(order);
        currentBatch.estimated_hours += order.estimated_hours || 0;
        currentBatch.estimated_cost += order.estimated_cost || 0;
      } else {
        batches.push(currentBatch);
        currentBatch = {
          id: `batch-${Date.now()}-${batches.length + 1}`,
          name: `Optimized Batch ${batches.length + 1}`,
          orders: [order],
          estimated_hours: order.estimated_hours || 0,
          estimated_cost: order.estimated_cost || 0
        };
      }
    }

    if (currentBatch.orders.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  // ===== UTILITY METHODS =====

  async generateBatchNumber(): Promise<string> {
    const { data: lastBatch } = await this.supabase
      .from('production_batches')
      .select('batch_number')
      .order('created_at', { ascending: false })
      .limit(1);

    const lastNumber = lastBatch?.[0]?.batch_number || 'BATCH-2024-000';
    const match = lastNumber.match(/BATCH-(\d{4})-(\d+)/);
    
    if (match) {
      const year = match[1];
      const number = parseInt(match[2]) + 1;
      return `BATCH-${year}-${number.toString().padStart(3, '0')}`;
    }

    return `BATCH-${new Date().getFullYear()}-001`;
  }

  async generateWorkOrderNumber(): Promise<string> {
    const { data: lastWorkOrder } = await this.supabase
      .from('work_orders')
      .select('work_order_number')
      .order('created_at', { ascending: false })
      .limit(1);

    const lastNumber = lastWorkOrder?.[0]?.work_order_number || 'WO-2024-000';
    const match = lastNumber.match(/WO-(\d{4})-(\d+)/);
    
    if (match) {
      const year = match[1];
      const number = parseInt(match[2]) + 1;
      return `WO-${year}-${number.toString().padStart(3, '0')}`;
    }

    return `WO-${new Date().getFullYear()}-001`;
  }
} 