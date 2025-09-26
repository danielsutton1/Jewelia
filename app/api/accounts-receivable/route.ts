import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const InvoiceSchema = z.object({
  customer_id: z.string().uuid(),
  order_id: z.string().uuid().optional(),
  invoice_number: z.string().min(1),
  amount: z.number().positive(),
  due_date: z.string(),
  description: z.string().optional(),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    total: z.number().positive()
  })).optional()
})

const PaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'other']),
  reference_number: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status') || undefined
    const customerId = searchParams.get('customerId') || undefined
    const overdue = searchParams.get('overdue') === 'true'
    
    // Get invoices
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customers (
          "Full Name",
          email,
          phone
        ),
        orders (
          order_number,
          total_amount
        )
      `)
      .order('due_date', { ascending: true })
    
    if (status) query = query.eq('status', status)
    if (customerId) query = query.eq('customer_id', customerId)
    if (overdue) query = query.lt('due_date', new Date().toISOString()).eq('status', 'unpaid')
    
    const { data: invoices, error: invoicesError } = await query
    
    if (invoicesError) throw invoicesError
    
    // Get payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        invoices (
          invoice_number,
          amount
        )
      `)
      .order('payment_date', { ascending: false })
    
    if (paymentsError) throw paymentsError
    
    // Calculate AR metrics
    const totalInvoiced = invoices?.reduce((sum: number, invoice: any) => sum + (invoice.amount || 0), 0) || 0
    const totalPaid = payments?.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) || 0
    const outstandingBalance = totalInvoiced - totalPaid
    const overdueInvoices = invoices?.filter((invoice: any) => 
      new Date(invoice.due_date) < new Date() && invoice.status === 'unpaid'
    ).length || 0
    
    return NextResponse.json({
      success: true,
      data: {
        invoices,
        payments,
        metrics: {
          totalInvoiced,
          totalPaid,
          outstandingBalance,
          overdueInvoices,
          totalInvoices: invoices?.length || 0
        }
      }
    })
    
  } catch (error: any) {
    console.error('Accounts receivable API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    const { type, data } = body
    
    if (type === 'invoice') {
      const parse = InvoiceSchema.safeParse(data)
      if (!parse.success) {
        return NextResponse.json({ 
          error: 'Invalid invoice data',
          details: parse.error.flatten()
        }, { status: 400 })
      }
      
      const invoiceData = parse.data
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          status: 'unpaid',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (invoiceError) throw invoiceError
      
      return NextResponse.json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      }, { status: 201 })
      
    } else if (type === 'payment') {
      const parse = PaymentSchema.safeParse(data)
      if (!parse.success) {
        return NextResponse.json({ 
          error: 'Invalid payment data',
          details: parse.error.flatten()
        }, { status: 400 })
      }
      
      const paymentData = parse.data
      
      // Create payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          payment_date: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (paymentError) throw paymentError
      
      // Update invoice status
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('amount, payments(amount)')
        .eq('id', paymentData.invoice_id)
        .single()
      
      if (invoiceError) throw invoiceError
      
      const totalPaid = (invoice.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) + paymentData.amount
      const newStatus = totalPaid >= invoice.amount ? 'paid' : 'partial'
      
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', paymentData.invoice_id)
      
      if (updateError) throw updateError
      
      return NextResponse.json({
        success: true,
        data: payment,
        message: 'Payment recorded successfully'
      }, { status: 201 })
      
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('AR POST API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 