// import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { sendEmail } from '@/lib/email'
import { uploadFile } from '@/lib/storage'
import { calculateMetalValue } from '@/lib/metal-calculator'
import { logger } from '@/lib/logger'
import { createSupabaseServerClient } from '@/lib/supabase/server'
// import { notifyStaff } from '@/lib/notifications'

// Types
export type TradeInStatus = 'pending' | 'approved' | 'completed' | 'cancelled'
export type TradeInItem = {
  id: string
  itemType: string
  metalType: string
  metalPurity: string
  weight: number
  weightUnit: string
  condition: string
  acceptedValue: number
  appraisalValue: number
  description: string
  photos: string[]
  gemstone?: {
    type: string
    carat: number
    quality: string
    cert?: string
  }
}

export type NewItem = {
  id?: string
  name: string
  sku: string
  price: number
  quantity: number
  status: string
  isCustom?: boolean
  specs?: string
  dueDate?: string
}

// Validation schemas
const tradeInItemSchema = z.object({
  itemType: z.string(),
  metalType: z.string(),
  metalPurity: z.string(),
  weight: z.number().positive(),
  weightUnit: z.string(),
  condition: z.string(),
  acceptedValue: z.number().min(0),
  appraisalValue: z.number().min(0),
  description: z.string(),
  photos: z.array(z.string()),
  gemstone: z.object({
    type: z.string(),
    carat: z.number().positive(),
    quality: z.string(),
    cert: z.string().optional(),
  }).optional(),
})

const newItemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  sku: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  status: z.string(),
  isCustom: z.boolean().optional(),
  specs: z.string().optional(),
  dueDate: z.string().optional(),
})

const tradeInSchema = z.object({
  customerId: z.string(),
  staffId: z.string(),
  date: z.string(),
  status: z.enum(['pending', 'approved', 'completed', 'cancelled']),
  notes: z.string().optional(),
  items: z.array(tradeInItemSchema),
  newItems: z.array(newItemSchema),
  financial: z.object({
    tradeInCredit: z.number(),
    newItemsCost: z.number(),
    tax: z.number(),
    netDifference: z.number(),
    paymentMethod: z.string().optional(),
  }),
})

// Business rules
const MAX_TRADE_IN_VALUE = 100000 // $100k limit
const STATUS_TRANSITIONS: Record<TradeInStatus, TradeInStatus[]> = {
  pending: ['approved', 'cancelled'],
  approved: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export class TradeInService {
  private supabase: any = null

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // Create new trade-in
  async createTradeIn(data: z.infer<typeof tradeInSchema>) {
    try {
      // Validate input
      const validated = tradeInSchema.parse(data)

      // Check business rules
      if (validated.financial.tradeInCredit > MAX_TRADE_IN_VALUE) {
        throw new Error('Trade-in value exceeds maximum limit')
      }

      // Check inventory availability
      await this.validateInventory(validated.newItems)

      // Generate reference number
      const referenceNumber = `TI-${format(new Date(), 'yyyyMMdd')}-${uuidv4().slice(0, 6)}`

      // Create trade-in record
      const supabase = await this.getSupabase()
      const { data: tradeIn, error } = await supabase
        .from('trade_ins')
        .insert({
          reference_number: referenceNumber,
          ...validated,
          status_history: [{
            status: 'pending',
            at: new Date().toISOString(),
            by: validated.staffId,
          }],
        })
        .select()
        .single()

      if (error) throw error

      // Reserve inventory items
      await this.reserveInventory(validated.newItems)

      // Send notifications
      await this.sendNotifications(tradeIn, 'created')

      return tradeIn
    } catch (error) {
      logger.error('Error creating trade-in:', error)
      throw error
    }
  }

  // Get trade-in by ID
  async getTradeIn(id: string) {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('trade_ins')
        .select(`
          *,
          customer:customers(*),
          staff:staff(*),
          items:trade_in_items(*),
          new_items:trade_in_new_items(*),
          documents:trade_in_documents(*),
          comm_log:trade_in_communications(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Error fetching trade-in:', error)
      throw error
    }
  }

  // Update trade-in
  async updateTradeIn(id: string, data: Partial<z.infer<typeof tradeInSchema>>) {
    try {
      // Validate input
      const validated = tradeInSchema.partial().parse(data)

      // Check business rules
      if (validated.financial?.tradeInCredit && validated.financial.tradeInCredit > MAX_TRADE_IN_VALUE) {
        throw new Error('Trade-in value exceeds maximum limit')
      }

      // Update trade-in record
      const supabase = await this.getSupabase()
      const { data: tradeIn, error } = await supabase
        .from('trade_ins')
        .update(validated)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Log changes
      await this.logChanges(id, validated)

      return tradeIn
    } catch (error) {
      logger.error('Error updating trade-in:', error)
      throw error
    }
  }

  // Update trade-in status
  async updateStatus(id: string, newStatus: TradeInStatus, reason: string, staffId: string) {
    try {
      // Get current trade-in
      const tradeIn = await this.getTradeIn(id)
      if (!tradeIn) throw new Error('Trade-in not found')

      // Validate status transition
      if (!Object.keys(STATUS_TRANSITIONS).includes(tradeIn.status)) {
        throw new Error(`Invalid status: ${tradeIn.status}`)
      }
      if (!STATUS_TRANSITIONS[tradeIn.status as TradeInStatus].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${tradeIn.status} to ${newStatus}`)
      }

      // Update status
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('trade_ins')
        .update({
          status: newStatus,
          status_history: [
            ...tradeIn.status_history,
            {
              status: newStatus,
              at: new Date().toISOString(),
              by: staffId,
              reason,
            },
          ],
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Send notifications
      await this.sendNotifications(data, 'status_changed')

      return data
    } catch (error) {
      logger.error('Error updating trade-in status:', error)
      throw error
    }
  }

  // List trade-ins with filtering and pagination
  async listTradeIns(filters: {
    status?: TradeInStatus
    customerId?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    try {
      const supabase = await this.getSupabase()
      let query = supabase
        .from('trade_ins')
        .select(`
          *,
          customer:customers(*),
          staff:staff(*)
        `, { count: 'exact' })

      // Apply filters
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.customerId) query = query.eq('customer_id', filters.customerId)
      if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
      if (filters.dateTo) query = query.lte('date', filters.dateTo)

      // Apply pagination
      const page = filters.page || 1
      const limit = filters.limit || 10
      query = query.range((page - 1) * limit, page * limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data,
        total: count,
        page,
        limit,
      }
    } catch (error) {
      logger.error('Error listing trade-ins:', error)
      throw error
    }
  }

  // Search trade-ins
  async searchTradeIns(query: string) {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('trade_ins')
        .select(`
          *,
          customer:customers(*)
        `)
        .or(`reference_number.ilike.%${query}%,customer.name.ilike.%${query}%`)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Error searching trade-ins:', error)
      throw error
    }
  }

  // Calculate totals
  async calculateTotals(items: TradeInItem[], newItems: NewItem[]) {
    try {
      // Calculate trade-in value
      const tradeInCredit = items.reduce((sum, item) => sum + item.acceptedValue, 0)

      // Calculate new items cost
      const newItemsCost = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      // Calculate tax (example: 8%)
      const taxRate = 0.08
      const tax = newItemsCost * taxRate

      // Calculate net difference
      const netDifference = newItemsCost + tax - tradeInCredit

      return {
        tradeInCredit,
        newItemsCost,
        tax,
        netDifference,
      }
    } catch (error) {
      logger.error('Error calculating totals:', error)
      throw error
    }
  }

  // Upload files (photos, documents)
  async uploadFiles(files: File[], type: 'photo' | 'document'): Promise<string[]> {
    try {
      const supabase = await this.getSupabase()
      const uploads = await Promise.all(
        files.map(async (file) => {
          // Upload to storage
          const { data, error } = await uploadFile('trade-ins', `trade-ins/${type}s/${uuidv4()}`, file)
          if (error) throw error
          return data?.path || ''
        })
      )

      return uploads.filter(path => path !== '')
    } catch (error) {
      logger.error('Error uploading files:', error)
      throw error
    }
  }

  // Private helper methods
  private async validateInventory(items: NewItem[]) {
    // Check inventory availability
    const supabase = await this.getSupabase()
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('sku, quantity')
      .in('sku', items.map((i: NewItem) => i.sku))

    if (error) throw error

    // Validate quantities
    for (const item of items) {
      const invItem = inventory?.find((i: any) => i.sku === item.sku)
      if (!invItem || invItem.quantity < item.quantity) {
        throw new Error(`Insufficient inventory for ${item.sku}`)
      }
    }
  }

  private async reserveInventory(items: NewItem[]) {
    // Reserve items in inventory
    const supabase = await this.getSupabase()
    for (const item of items) {
      // Fetch current quantity
      const { data: inventory, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('sku', item.sku)
        .single()
      if (fetchError) throw fetchError
      const currentQty = inventory?.quantity ?? 0
      if (currentQty < item.quantity) {
        throw new Error(`Insufficient inventory for ${item.sku}`)
      }
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: currentQty - item.quantity })
        .eq('sku', item.sku)
      if (error) throw error
    }
  }

  private async sendNotifications(tradeIn: any, type: 'created' | 'status_changed') {
    // Send email to customer
    await sendEmail({
      to: tradeIn.customer.email,
      subject: `Trade-In ${type === 'created' ? 'Created' : 'Status Updated'}`,
      template: type === 'created' ? 'trade-in-created' : 'trade-in-status-changed',
      data: tradeIn,
    })

    // Notify staff
    // await notifyStaff({
    //   type: 'trade_in',
    //   action: type,
    //   data: tradeIn,
    // })
  }

  private async logChanges(id: string, changes: any) {
    const supabase = await this.getSupabase()
    await supabase
      .from('trade_in_audit_log')
      .insert({
        trade_in_id: id,
        changes,
        timestamp: new Date().toISOString(),
      })
  }

  private validateFile(file: File) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return false
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return false
    }

    return true
  }

  // Add deleteTradeIn method
  async deleteTradeIn(id: string) {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('trade_ins')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      await this.logChanges(id, { status: 'cancelled' })
      return { success: true }
    } catch (error) {
      logger.error('Error deleting trade-in:', error)
      throw error
    }
  }
} 