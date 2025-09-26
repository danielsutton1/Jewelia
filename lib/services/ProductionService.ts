import { supabase } from '../supabase'
import { z } from 'zod'

export type ProductionStage = 
  | "Design" 
  | "Casting" 
  | "Setting" 
  | "Polishing" 
  | "QC" 
  | "Completed"
  | "Rework"
  | "Shipping"

export type ProductionStatus = 
  | "pending"
  | "in-progress" 
  | "review"
  | "approved"
  | "revise"
  | "completed"
  | "delayed"
  | "blocked"

export interface ProductionItem {
  id: string
  product_id: string
  name: string
  description?: string
  category: string
  stage: ProductionStage
  status: ProductionStatus
  assigned_employee?: string
  start_date: string
  estimated_completion: string
  actual_completion?: string
  priority: "low" | "medium" | "high" | "urgent"
  notes?: string
  order_id?: string
  customer_name?: string
  progress: number
  created_at: string
  updated_at: string
}

export interface ProductionBatch {
  id: string
  name: string
  description?: string
  stage: ProductionStage
  status: ProductionStatus
  priority: "low" | "medium" | "high" | "urgent"
  item_count: number
  material: string
  process: string
  created_at: string
  due_date: string
  progress: number
  assigned_employee?: string
  notes?: string
}

export interface CreateProductionItemRequest {
  product_id: string
  name: string
  description?: string
  category: string
  stage: ProductionStage
  priority?: "low" | "medium" | "high" | "urgent"
  order_id?: string
  customer_name?: string
  assigned_employee?: string
  estimated_completion: string
  notes?: string
}

export interface CreateBatchRequest {
  name: string
  description?: string
  stage: ProductionStage
  priority?: "low" | "medium" | "high" | "urgent"
  material: string
  process: string
  due_date: string
  assigned_employee?: string
  item_ids: string[]
  notes?: string
}

export interface UpdateStatusRequest {
  status: ProductionStatus
  stage?: ProductionStage
  notes?: string
  progress?: number
  actual_completion?: string
}

// Validation schemas
const CreateProductionItemSchema = z.object({
  product_id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  stage: z.enum(['Design', 'Casting', 'Setting', 'Polishing', 'QC', 'Completed', 'Rework', 'Shipping']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  order_id: z.string().optional(),
  customer_name: z.string().optional(),
  assigned_employee: z.string().optional(),
  estimated_completion: z.string(),
  notes: z.string().optional()
})

const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'review', 'approved', 'revise', 'completed', 'delayed', 'blocked']),
  stage: z.enum(['Design', 'Casting', 'Setting', 'Polishing', 'QC', 'Completed', 'Rework', 'Shipping']).optional(),
  notes: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  actual_completion: z.string().optional()
})

// Mapping functions for database values
const stageMapping: Record<string, ProductionStage> = {
  'Design': 'Design',
  'Casting': 'Casting',
  'Stone Setting': 'Setting',
  'Setting': 'Setting',
  'Polishing': 'Polishing',
  'Quality Check': 'QC',
  'QC': 'QC',
  'Completed': 'Completed',
  'Rework': 'Rework',
  'Shipping': 'Shipping'
}

const statusMapping: Record<string, ProductionStatus> = {
  'Planning': 'pending',
  'pending': 'pending',
  'In Progress': 'in-progress',
  'in-progress': 'in-progress',
  'review': 'review',
  'approved': 'approved',
  'revise': 'revise',
  'completed': 'completed',
  'Completed': 'completed',
  'delayed': 'delayed',
  'blocked': 'blocked'
}

// Reverse mapping for database updates
const reverseStageMapping: Record<ProductionStage, string> = {
  'Design': 'Design',
  'Casting': 'Casting',
  'Setting': 'Stone Setting',
  'Polishing': 'Polishing',
  'QC': 'Quality Check',
  'Completed': 'Completed',
  'Rework': 'Rework',
  'Shipping': 'Shipping'
}

const reverseStatusMapping: Record<ProductionStatus, string> = {
  'pending': 'Planning',
  'in-progress': 'In Progress',
  'review': 'review',
  'approved': 'approved',
  'revise': 'revise',
  'completed': 'Completed',
  'delayed': 'delayed',
  'blocked': 'blocked'
}

export class ProductionService {
  /**
   * List all production items with filtering and pagination
   */
  async listProductionItems(filters?: {
    stage?: ProductionStage
    status?: ProductionStatus
    priority?: string
    assigned_employee?: string
    order_id?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<ProductionItem[]> {
    try {
      console.log('Starting listProductionItems with filters:', filters)
      
      let query = supabase
        .from('products_in_production_pipeline')
        .select('*')
        .order('"Start Date"', { ascending: false })

      // Apply filters - convert frontend values to database values
      if (filters?.stage) {
        const dbStage = reverseStageMapping[filters.stage]
        console.log('Converting stage:', filters.stage, 'to db stage:', dbStage)
        query = query.eq('Stage', dbStage)
      }
      if (filters?.status) {
        const dbStatus = reverseStatusMapping[filters.status]
        console.log('Converting status:', filters.status, 'to db status:', dbStatus)
        query = query.eq('Status', dbStatus)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.assigned_employee) {
        query = query.eq('Assigned Employee', filters.assigned_employee)
      }
      if (filters?.order_id) {
        query = query.eq('order_id', filters.order_id)
      }
      if (filters?.search) {
        query = query.or(`Name.ilike.%${filters.search}%,Description.ilike.%${filters.search}%`)
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
      }

      console.log('Executing query...')
      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Fetch customer names for items with order_id and missing customer_name
      const items = data || [];
      const itemsNeedingCustomer = items.filter(item => item.order_id && !item.customer_name);
      let customerMap: Record<string, string> = {};
      if (itemsNeedingCustomer.length > 0) {
        const orderIds = itemsNeedingCustomer.map(item => item.order_id);
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, customer_id')
          .in('id', orderIds);
        if (!ordersError && ordersData) {
          const customerIds = ordersData.map(o => o.customer_id).filter(Boolean);
          const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select('id, "Full Name"')
            .in('id', customerIds);
          if (!customersError && customersData) {
            customerMap = Object.fromEntries(customersData.map(c => [c.id, c['Full Name']]));
          }
          // Map order_id to customer name
          const orderToCustomer = Object.fromEntries(ordersData.map(o => [o.id, customerMap[o.customer_id] || 'Unknown']));
          items.forEach(item => {
            if (item.order_id && !item.customer_name) {
              item.customer_name = orderToCustomer[item.order_id] || 'Unknown';
            }
          });
        }
      }

      // Map database columns to frontend-friendly format
      return items.map(item => {
        return {
          id: item.id,
          product_id: item['Product ID'],
          name: item.Name,
          description: item.Description,
          category: item.Category,
          stage: stageMapping[item.Stage] || 'Design',
          status: statusMapping[item.Status] || 'pending',
          assigned_employee: item['Assigned Employee'],
          start_date: item['Start Date'],
          estimated_completion: item['Estimated Completion'],
          actual_completion: item.actual_completion,
          priority: item.priority || 'medium',
          notes: item.Notes,
          order_id: item.order_id,
          customer_name: item.customer_name || 'Unknown',
          progress: this.calculateProgress(stageMapping[item.Stage] || 'Design', statusMapping[item.Status] || 'pending'),
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      })
    } catch (error: any) {
      console.error('Error in production.listProductionItems:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Error details:', error)
      throw error instanceof Error ? error : new Error(`Unknown error occurred: ${JSON.stringify(error)}`)
    }
  }

  /**
   * Get a single production item by ID
   */
  async getProductionItemById(id: string): Promise<ProductionItem | null> {
    try {
      console.log('Getting production item by ID:', id)
      
      const { data, error } = await supabase
        .from('products_in_production_pipeline')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase error in getProductionItemById:', error)
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw error
      }

      if (!data) {
        console.log('No production item found with ID:', id)
        return null
      }

      // If customer_name is missing and order_id is present, fetch it
      let customer_name = data.customer_name;
      if (!customer_name && data.order_id) {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('customer_id')
          .eq('id', data.order_id)
          .single();
        if (!orderError && orderData && orderData.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('"Full Name"')
            .eq('id', orderData.customer_id)
            .single();
          if (!customerError && customerData) {
            customer_name = customerData['Full Name'];
          }
        }
      }

      // Map database columns to frontend-friendly format
      return {
        id: data.id,
        product_id: data['Product ID'],
        name: data.Name,
        description: data.Description,
        category: data.Category,
        stage: stageMapping[data.Stage] || 'Design',
        status: statusMapping[data.Status] || 'pending',
        assigned_employee: data['Assigned Employee'],
        start_date: data['Start Date'],
        estimated_completion: data['Estimated Completion'],
        actual_completion: data.actual_completion,
        priority: data.priority || 'medium',
        notes: data.Notes,
        order_id: data.order_id,
        customer_name: customer_name || 'Unknown',
        progress: this.calculateProgress(stageMapping[data.Stage] || 'Design', statusMapping[data.Status] || 'pending'),
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error: any) {
      console.error('Error in production.getProductionItemById:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Error details:', error)
      throw error instanceof Error ? error : new Error(`Unknown error occurred: ${JSON.stringify(error)}`)
    }
  }

  /**
   * Create a new production item
   */
  async createProductionItem(itemData: CreateProductionItemRequest): Promise<ProductionItem> {
    try {
      const validatedData = CreateProductionItemSchema.parse(itemData)

      const { data, error } = await supabase
        .from('products_in_production_pipeline')
        .insert([{
          'Product ID': validatedData.product_id,
          'Name': validatedData.name,
          'Description': validatedData.description,
          'Category': validatedData.category,
          'Stage': reverseStageMapping[validatedData.stage],
          'Status': reverseStatusMapping['pending'],
          'Assigned Employee': validatedData.assigned_employee,
          'Start Date': new Date().toISOString().split('T')[0],
          'Estimated Completion': validatedData.estimated_completion,
          'priority': validatedData.priority || 'medium',
          'Notes': validatedData.notes,
          'order_id': validatedData.order_id,
          'customer_name': validatedData.customer_name
        }])
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        product_id: data['Product ID'],
        name: data.Name,
        description: data.Description,
        category: data.Category,
        stage: stageMapping[data.Stage] || 'Design',
        status: statusMapping[data.Status] || 'pending',
        assigned_employee: data['Assigned Employee'],
        start_date: data['Start Date'],
        estimated_completion: data['Estimated Completion'],
        actual_completion: data.actual_completion,
        priority: data.priority || 'medium',
        notes: data.Notes,
        order_id: data.order_id,
        customer_name: data.customer_name,
        progress: this.calculateProgress(stageMapping[data.Stage] || 'Design', statusMapping[data.Status] || 'pending'),
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error: any) {
      console.error('Error in production.createProductionItem:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Update production item status and stage
   */
  async updateStatus(itemId: string, updateData: UpdateStatusRequest): Promise<ProductionItem> {
    try {
      const validatedData = UpdateStatusSchema.parse(updateData)

      const updateFields: any = {
        'Status': reverseStatusMapping[validatedData.status],
        'Notes': validatedData.notes
      }

      if (validatedData.stage) {
        updateFields['Stage'] = reverseStageMapping[validatedData.stage]
      }
      if (validatedData.progress !== undefined) {
        updateFields['progress'] = validatedData.progress
      }
      if (validatedData.actual_completion) {
        updateFields['actual_completion'] = validatedData.actual_completion
      }

      const { data, error } = await supabase
        .from('products_in_production_pipeline')
        .update(updateFields)
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        product_id: data['Product ID'],
        name: data.Name,
        description: data.Description,
        category: data.Category,
        stage: stageMapping[data.Stage] || 'Design',
        status: statusMapping[data.Status] || 'pending',
        assigned_employee: data['Assigned Employee'],
        start_date: data['Start Date'],
        estimated_completion: data['Estimated Completion'],
        actual_completion: data.actual_completion,
        priority: data.priority || 'medium',
        notes: data.Notes,
        order_id: data.order_id,
        customer_name: data.customer_name,
        progress: this.calculateProgress(stageMapping[data.Stage] || 'Design', statusMapping[data.Status] || 'pending'),
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error: any) {
      console.error('Error in production.updateStatus:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Create a production batch
   */
  async createBatch(batchData: CreateBatchRequest): Promise<ProductionBatch> {
    try {
      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from('production_batches')
        .insert([{
          name: batchData.name,
          description: batchData.description,
          stage: reverseStageMapping[batchData.stage],
          status: reverseStatusMapping['pending'],
          priority: batchData.priority || 'medium',
          material: batchData.material,
          process: batchData.process,
          due_date: batchData.due_date,
          assigned_employee: batchData.assigned_employee,
          notes: batchData.notes,
          item_count: batchData.item_ids.length,
          progress: 0
        }])
        .select()
        .single()

      if (batchError) throw batchError

      // Update production items to link to batch
      if (batchData.item_ids.length > 0) {
        const { error: updateError } = await supabase
          .from('products_in_production_pipeline')
          .update({ batch_id: batch.id })
          .in('id', batchData.item_ids)

        if (updateError) throw updateError
      }

      return {
        id: batch.id,
        name: batch.name,
        description: batch.description,
        stage: stageMapping[batch.stage] || 'Design',
        status: statusMapping[batch.status] || 'pending',
        priority: batch.priority,
        item_count: batch.item_count,
        material: batch.material,
        process: batch.process,
        created_at: batch.created_at,
        due_date: batch.due_date,
        progress: batch.progress,
        assigned_employee: batch.assigned_employee,
        notes: batch.notes
      }
    } catch (error: any) {
      console.error('Error in production.createBatch:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Get production batches
   */
  async getBatches(filters?: {
    stage?: ProductionStage
    status?: ProductionStatus
    priority?: string
    search?: string
  }): Promise<ProductionBatch[]> {
    try {
      let query = supabase
        .from('production_batches')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.stage) {
        const dbStage = reverseStageMapping[filters.stage]
        query = query.eq('stage', dbStage)
      }
      if (filters?.status) {
        const dbStatus = reverseStatusMapping[filters.status]
        query = query.eq('status', dbStatus)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(batch => ({
        id: batch.id,
        name: batch.name,
        description: batch.description,
        stage: stageMapping[batch.stage] || 'Design',
        status: statusMapping[batch.status] || 'pending',
        priority: batch.priority,
        item_count: batch.item_count,
        material: batch.material,
        process: batch.process,
        created_at: batch.created_at,
        due_date: batch.due_date,
        progress: batch.progress,
        assigned_employee: batch.assigned_employee,
        notes: batch.notes
      }))
    } catch (error: any) {
      console.error('Error in production.getBatches:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Get production statistics
   */
  async getProductionStats(): Promise<{
    total_items: number
    items_by_stage: Record<ProductionStage, number>
    items_by_status: Record<ProductionStatus, number>
    average_completion_time: number
    on_time_delivery_rate: number
    items_in_production: number
    completed_items: number
  }> {
    try {
      const { data: items, error } = await supabase
        .from('products_in_production_pipeline')
        .select('*')

      if (error) throw error

      const items_by_stage: Record<ProductionStage, number> = {
        Design: 0, Casting: 0, Setting: 0, Polishing: 0, QC: 0, Completed: 0, Rework: 0, Shipping: 0
      }

      const items_by_status: Record<ProductionStatus, number> = {
        pending: 0, 'in-progress': 0, review: 0, approved: 0, revise: 0, completed: 0, delayed: 0, blocked: 0
      }

      let completed_items = 0;
      let items_in_production = 0;

      items?.forEach(item => {
        const stage = stageMapping[item.Stage] || 'Design'
        const status = statusMapping[item.Status] || 'pending'
        items_by_stage[stage]++
        items_by_status[status]++
        if (status === 'completed') completed_items++;
        else items_in_production++;
      })

      // Calculate average completion time (simplified)
      const completedItemsArr = items?.filter(item => statusMapping[item.Status] === 'completed') || []
      const average_completion_time = completedItemsArr.length > 0 
        ? completedItemsArr.reduce((sum, item) => {
            const start = new Date(item['Start Date'])
            const end = new Date(item.actual_completion || item['Estimated Completion'])
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) // days
          }, 0) / completedItemsArr.length
        : 0

      // Calculate on-time delivery rate
      const onTimeItems = completedItemsArr.filter(item => {
        const actual = new Date(item.actual_completion || item['Estimated Completion'])
        const estimated = new Date(item['Estimated Completion'])
        return actual <= estimated
      })
      const on_time_delivery_rate = completedItemsArr.length > 0 
        ? (onTimeItems.length / completedItemsArr.length) * 100 
        : 0

      return {
        total_items: items?.length || 0,
        items_by_stage,
        items_by_status,
        average_completion_time: Math.round(average_completion_time * 10) / 10,
        on_time_delivery_rate: Math.round(on_time_delivery_rate * 10) / 10,
        items_in_production,
        completed_items
      }
    } catch (error: any) {
      console.error('Error in production.getProductionStats:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Calculate progress percentage based on stage and status
   */
  private calculateProgress(stage: ProductionStage, status: ProductionStatus): number {
    const stageProgress = {
      Design: 12.5,
      Casting: 25,
      Setting: 37.5,
      Polishing: 50,
      QC: 62.5,
      Completed: 100,
      Rework: 25,
      Shipping: 87.5
    }

    let progress = stageProgress[stage] || 0

    // Adjust based on status
    switch (status) {
      case 'pending':
        progress *= 0.5
        break
      case 'in-progress':
        progress *= 0.75
        break
      case 'review':
        progress *= 0.9
        break
      case 'approved':
        progress *= 0.95
        break
      case 'revise':
        progress *= 0.3
        break
      case 'completed':
        progress = 100
        break
      case 'delayed':
        progress *= 0.6
        break
      case 'blocked':
        progress *= 0.2
        break
    }

    return Math.round(progress)
  }

  /**
   * Get production items by order ID
   */
  async getByOrderId(orderId: string): Promise<ProductionItem[]> {
    return this.listProductionItems({ order_id: orderId })
  }

  /**
   * Get production items by stage
   */
  async getByStage(stage: ProductionStage): Promise<ProductionItem[]> {
    return this.listProductionItems({ stage })
  }

  /**
   * Get production items by status
   */
  async getByStatus(status: ProductionStatus): Promise<ProductionItem[]> {
    return this.listProductionItems({ status })
  }
}

export const productionService = new ProductionService() 