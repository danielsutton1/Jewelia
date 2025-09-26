import { supabase } from '../supabase'
import { z } from 'zod'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'wire'

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  order_id?: string
  status: InvoiceStatus
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  currency: string
  due_date: string
  paid_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id?: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  created_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  payment_date: string
  reference_number?: string
  status: PaymentStatus
  notes?: string
  created_at: string
}

export interface AccountsReceivable {
  id: string
  customer_id: string
  customer_name: string
  invoice_number: string
  amount: number
  balance: number
  due_date: string
  status: string
  created_at: string
  updated_at: string
  notes?: string
}

export interface AccountsPayable {
  id: string
  vendor_id?: string
  vendor_name: string
  bill_number: string
  amount: number
  balance: number
  due_date: string
  status: string
  created_at: string
  updated_at: string
  notes?: string
}

export interface FinancialMetrics {
  total_revenue: number
  total_receivables: number
  total_payables: number
  cash_flow: number
  outstanding_invoices: number
  overdue_invoices: number
  average_payment_time: number
  top_customers: Array<{
    customer_name: string
    total_paid: number
    invoice_count: number
  }>
  monthly_revenue: Array<{
    month: string
    revenue: number
    receivables: number
  }>
}

export interface CreateInvoiceRequest {
  customer_id: string
  order_id?: string
  items: Array<{
    product_id?: string
    description: string
    quantity: number
    unit_price: number
  }>
  tax_rate?: number
  due_date: string
  notes?: string
}

export interface RecordPaymentRequest {
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  reference_number?: string
  notes?: string
}

// Validation schemas
const CreateInvoiceSchema = z.object({
  customer_id: z.string(),
  order_id: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().optional(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit_price: z.number().positive()
  })).min(1),
  tax_rate: z.number().min(0).max(100).optional(),
  due_date: z.string(),
  notes: z.string().optional()
})

const RecordPaymentSchema = z.object({
  invoice_id: z.string(),
  amount: z.number().positive(),
  payment_method: z.enum(['credit_card', 'bank_transfer', 'cash', 'check', 'wire']),
  reference_number: z.string().optional(),
  notes: z.string().optional()
})

export class FinanceService {
  /**
   * Create a new invoice from order or manual entry
   */
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<Invoice> {
    try {
      const validatedData = CreateInvoiceSchema.parse(invoiceData)

      // Calculate totals
      const subtotal = validatedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
      const tax_rate = validatedData.tax_rate || 0
      const tax_amount = subtotal * (tax_rate / 100)
      const total_amount = subtotal + tax_amount

      // Generate invoice number
      const invoice_number = await this.generateInvoiceNumber()

      // Get customer name
      const customerName = await this.getCustomerName(validatedData.customer_id)

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('billing_invoices')
        .insert([{
          invoice_number,
          customer_id: validatedData.customer_id,
          status: 'draft',
          subtotal,
          tax_rate,
          tax_amount,
          total_amount,
          currency: 'USD',
          due_date: validatedData.due_date,
          notes: validatedData.notes
        }])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      const invoiceItems = validatedData.items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price
      }))

      const { error: itemsError } = await supabase
        .from('billing_invoice_items')
        .insert(invoiceItems)

      if (itemsError) throw itemsError

      // Create accounts receivable entry
      await this.createAccountsReceivableEntry({
        customer_id: validatedData.customer_id,
        invoice_number,
        amount: total_amount,
        due_date: validatedData.due_date,
        notes: validatedData.notes
      })

      return {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id,
        customer_name: customerName,
        order_id: validatedData.order_id,
        status: invoice.status,
        subtotal: invoice.subtotal,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
        currency: invoice.currency,
        due_date: invoice.due_date,
        paid_at: invoice.paid_at,
        notes: invoice.notes,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at
      }
    } catch (error: any) {
      console.error('Error in finance.createInvoice:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Record a payment for an invoice
   */
  async recordPayment(paymentData: RecordPaymentRequest): Promise<Payment> {
    try {
      const validatedData = RecordPaymentSchema.parse(paymentData)

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('billing_payments')
        .insert([{
          invoice_id: validatedData.invoice_id,
          amount: validatedData.amount,
          payment_method: validatedData.payment_method,
          payment_date: new Date().toISOString(),
          reference_number: validatedData.reference_number,
          status: 'completed',
          notes: validatedData.notes
        }])
        .select()
        .single()

      if (paymentError) throw paymentError

      // Update invoice status if fully paid
      await this.updateInvoicePaymentStatus(validatedData.invoice_id, validatedData.amount)

      // Update accounts receivable
      await this.updateAccountsReceivablePayment(validatedData.invoice_id, validatedData.amount)

      return {
        id: payment.id,
        invoice_id: payment.invoice_id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        reference_number: payment.reference_number,
        status: payment.status,
        notes: payment.notes,
        created_at: payment.created_at
      }
    } catch (error: any) {
      console.error('Error in finance.recordPayment:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Get accounts receivable
   */
  async getAccountsReceivable(filters?: {
    customer_id?: string
    status?: string
    due_date_from?: string
    due_date_to?: string
  }): Promise<AccountsReceivable[]> {
    try {
      let query = supabase
        .from('accounts_receivable')
        .select('*')

      // Apply filters - use quoted column names
      if (filters?.due_date_from) {
        query = query.gte('"Due Date"', filters.due_date_from)
      }
      if (filters?.due_date_to) {
        query = query.lte('"Due Date"', filters.due_date_to)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return [] // Return empty array instead of throwing
      }

      // Map database columns to frontend-friendly format
      return (data || []).map(item => ({
        id: item.id,
        customer_id: '', // Not available in quoted column table
        customer_name: item['Customer'] || 'Unknown',
        invoice_number: item['Invoice ID'] || '',
        amount: Number(item['Amount']) || 0,
        balance: Number(item['Balance']) || 0,
        due_date: item['Due Date'] || '',
        status: 'open', // Default since not in quoted column table
        created_at: item.created_at,
        updated_at: item.updated_at,
        notes: undefined
      }))
    } catch (error: any) {
      console.error('Error in finance.getAccountsReceivable:', error)
      return [] // Return empty array instead of throwing
    }
  }

  /**
   * Get accounts payable
   */
  async getAccountsPayable(filters?: {
    vendor_id?: string
    status?: string
    due_date_from?: string
    due_date_to?: string
  }): Promise<AccountsPayable[]> {
    try {
      let query = supabase
        .from('accounts_payable')
        .select('*')

      // Apply filters - use quoted column names
      if (filters?.due_date_from) {
        query = query.gte('"Due Date"', filters.due_date_from)
      }
      if (filters?.due_date_to) {
        query = query.lte('"Due Date"', filters.due_date_to)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return [] // Return empty array instead of throwing
      }

      // Map database columns to frontend-friendly format
      return (data || []).map(item => ({
        id: item.id,
        vendor_id: '', // Not available in quoted column table
        vendor_name: item['Vendor'] || 'Unknown',
        bill_number: item['Bill ID'] || '',
        amount: Number(item['Amount']) || 0,
        balance: Number(item['Balance']) || 0,
        due_date: item['Due Date'] || '',
        status: 'open', // Default since not in quoted column table
        created_at: item.created_at,
        updated_at: item.updated_at,
        notes: undefined
      }))
    } catch (error: any) {
      console.error('Error in finance.getAccountsPayable:', error)
      return [] // Return empty array instead of throwing
    }
  }

  /**
   * Get financial metrics and analytics
   */
  async getFinancialMetrics(): Promise<FinancialMetrics> {
    try {
      // Get all invoices and payments
      const [invoices, payments, receivables, payables] = await Promise.all([
        this.getAllInvoices(),
        this.getAllPayments(),
        this.getAccountsReceivable(),
        this.getAccountsPayable()
      ])

      // Calculate metrics with safe defaults
      const total_revenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
      const total_receivables = receivables.reduce((sum, ar) => sum + ar.balance, 0)
      const total_payables = payables.reduce((sum, ap) => sum + ap.balance, 0)
      const cash_flow = total_revenue - total_payables

      const outstanding_invoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length
      const overdue_invoices = invoices.filter(inv => inv.status === 'overdue').length

      // Calculate average payment time
      const paidInvoices = invoices.filter(inv => inv.paid_at)
      const average_payment_time = paidInvoices.length > 0 
        ? paidInvoices.reduce((sum, inv) => {
            const created = new Date(inv.created_at)
            const paid = new Date(inv.paid_at!)
            return sum + (paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          }, 0) / paidInvoices.length
        : 0

      // Top customers by total paid
      const customerPayments = new Map<string, { total_paid: number; invoice_count: number }>()
      payments.forEach(payment => {
        const invoice = invoices.find(inv => inv.id === payment.invoice_id)
        if (invoice) {
          const existing = customerPayments.get(invoice.customer_name) || { total_paid: 0, invoice_count: 0 }
          customerPayments.set(invoice.customer_name, {
            total_paid: existing.total_paid + payment.amount,
            invoice_count: existing.invoice_count + 1
          })
        }
      })

      const top_customers = Array.from(customerPayments.entries())
        .map(([customer_name, data]) => ({ customer_name, ...data }))
        .sort((a, b) => b.total_paid - a.total_paid)
        .slice(0, 5)

      // Monthly revenue
      const monthlyRevenue = new Map<string, { revenue: number; receivables: number }>()
      const now = new Date()
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = date.toISOString().slice(0, 7)
        monthlyRevenue.set(monthKey, { revenue: 0, receivables: 0 })
      }

      // Calculate monthly revenue from payments
      payments.forEach(payment => {
        const month = new Date(payment.payment_date).toISOString().slice(0, 7)
        const existing = monthlyRevenue.get(month)
        if (existing) {
          existing.revenue += payment.amount
        }
      })

      // Calculate monthly receivables from invoices
      invoices.forEach(invoice => {
        const month = new Date(invoice.created_at).toISOString().slice(0, 7)
        const existing = monthlyRevenue.get(month)
        if (existing) {
          existing.receivables += invoice.total_amount
        }
      })

      const monthly_revenue = Array.from(monthlyRevenue.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))

      return {
        total_revenue,
        total_receivables,
        total_payables,
        cash_flow,
        outstanding_invoices,
        overdue_invoices,
        average_payment_time: Math.round(average_payment_time),
        top_customers,
        monthly_revenue
      }
    } catch (error: any) {
      console.error('Error in finance.getFinancialMetrics:', error)
      // Return default metrics when there's an error
      return {
        total_revenue: 0,
        total_receivables: 0,
        total_payables: 0,
        cash_flow: 0,
        outstanding_invoices: 0,
        overdue_invoices: 0,
        average_payment_time: 0,
        top_customers: [],
        monthly_revenue: []
      }
    }
  }

  /**
   * Auto-create invoice from completed order
   */
  async createInvoiceFromOrder(orderId: string): Promise<Invoice> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (itemsError) throw itemsError

      // Create invoice items
      const invoiceItems = orderItems.map(item => ({
        product_id: item.inventory_id,
        description: item.description || `Item ${item.inventory_id}`,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))

      // Create invoice
      const invoice = await this.createInvoice({
        customer_id: order.customer_id,
        order_id: orderId,
        items: invoiceItems,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        notes: `Invoice for order ${order.order_number || orderId}`
      })

      return invoice
    } catch (error: any) {
      console.error('Error in finance.createInvoiceFromOrder:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  // Private helper methods
  private async generateInvoiceNumber(): Promise<string> {
    const { data: lastInvoice } = await supabase
      .from('billing_invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1)

    const lastNumber = lastInvoice?.[0]?.invoice_number || 'INV-0000'
    const nextNumber = parseInt(lastNumber.split('-')[1]) + 1
    return `INV-${nextNumber.toString().padStart(4, '0')}`
  }

  private async getCustomerName(customerId: string): Promise<string> {
    const { data: customer } = await supabase
      .from('customers')
      .select('"Full Name"')
      .eq('id', customerId)
      .single()

    return customer?.['Full Name'] || 'Unknown Customer'
  }

  private async createAccountsReceivableEntry(data: {
    customer_id: string
    invoice_number: string
    amount: number
    due_date: string
    notes?: string
  }): Promise<void> {
    await supabase
      .from('accounts_receivable')
      .insert([{
        customer_id: data.customer_id,
        invoice_number: data.invoice_number,
        amount: data.amount,
        balance: data.amount,
        due_date: data.due_date,
        status: 'open',
        notes: data.notes
      }])
  }

  private async updateInvoicePaymentStatus(invoiceId: string, paymentAmount: number): Promise<void> {
    const { data: invoice } = await supabase
      .from('billing_invoices')
      .select('total_amount, paid_at')
      .eq('id', invoiceId)
      .single()

    if (invoice) {
      const totalPaid = (invoice.paid_at ? invoice.total_amount : 0) + paymentAmount
      const isFullyPaid = totalPaid >= invoice.total_amount

      await supabase
        .from('billing_invoices')
        .update({
          status: isFullyPaid ? 'paid' : 'sent',
          paid_at: isFullyPaid ? new Date().toISOString() : invoice.paid_at
        })
        .eq('id', invoiceId)
    }
  }

  private async updateAccountsReceivablePayment(invoiceId: string, paymentAmount: number): Promise<void> {
    const { data: invoice } = await supabase
      .from('billing_invoices')
      .select('invoice_number')
      .eq('id', invoiceId)
      .single()

    if (invoice) {
      await supabase
        .from('accounts_receivable')
        .update({
          balance: supabase.rpc('decrease_balance', { amount: paymentAmount })
        })
        .eq('invoice_number', invoice.invoice_number)
    }
  }

  private async getAllInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('billing_invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(invoice => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      customer_id: invoice.customer_id,
      customer_name: 'Unknown', // Will be populated separately
      order_id: undefined,
      status: invoice.status,
      subtotal: invoice.subtotal,
      tax_rate: invoice.tax_rate,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      currency: invoice.currency,
      due_date: invoice.due_date,
      paid_at: invoice.paid_at,
      notes: invoice.notes,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at
    }))
  }

  private async getAllPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('billing_payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(payment => ({
      id: payment.id,
      invoice_id: payment.invoice_id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      reference_number: payment.reference_number,
      status: payment.status,
      notes: payment.notes,
      created_at: payment.created_at
    }))
  }
}

export const financeService = new FinanceService() 