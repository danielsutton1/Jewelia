import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const period = searchParams.get('period') || 'month'

    // Get sales metrics
    const salesMetrics = await getSalesMetrics(supabase, startDate, endDate, period)
    
    // Get sales pipeline data
    const pipelineData = await getSalesPipeline(supabase, startDate, endDate)
    
    // Get top performing products
    const topProducts = await getTopProducts(supabase, startDate, endDate)
    
    // Get sales by customer
    const salesByCustomer = await getSalesByCustomer(supabase, startDate, endDate)
    
    // Get recent orders
    const recentOrders = await getRecentOrders(supabase)

    return NextResponse.json({
      success: true,
      data: {
        metrics: salesMetrics,
        pipeline: pipelineData,
        topProducts,
        salesByCustomer,
        recentOrders
      }
    })

  } catch (error: any) {
    console.error('Sales dashboard API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getSalesMetrics(supabase: any, startDate: string, endDate: string, period: string) {
  try {
    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = `created_at.gte.${startDate},created_at.lte.${endDate}`
    }

    // Total sales
    const { data: totalSales, error: salesError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed')
      .not('total_amount', 'is', null)

    const totalRevenue = totalSales?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0

    // Order count
    const { count: orderCount, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Average order value
    const avgOrderValue = orderCount ? totalRevenue / orderCount : 0

    // Customer count
    const { count: customerCount, error: customerError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    return {
      totalRevenue,
      orderCount: orderCount || 0,
      avgOrderValue,
      customerCount: customerCount || 0
    }
  } catch (error) {
    console.error('Error getting sales metrics:', error)
    return {
      totalRevenue: 0,
      orderCount: 0,
      avgOrderValue: 0,
      customerCount: 0
    }
  }
}

async function getSalesPipeline(supabase: any, startDate: string, endDate: string) {
  try {
    const { data: pipeline, error } = await supabase
      .from('orders')
      .select('status, total_amount')
      .in('status', ['pending', 'processing', 'completed', 'cancelled'])

    if (error) throw error

    const pipelineData = {
      pending: { count: 0, value: 0 },
      processing: { count: 0, value: 0 },
      completed: { count: 0, value: 0 },
      cancelled: { count: 0, value: 0 }
    }

    pipeline?.forEach((order: any) => {
      const status = order.status as keyof typeof pipelineData
      if (pipelineData[status]) {
        pipelineData[status].count++
        pipelineData[status].value += order.total_amount || 0
      }
    })

    return pipelineData
  } catch (error) {
    console.error('Error getting sales pipeline:', error)
    return {
      pending: { count: 0, value: 0 },
      processing: { count: 0, value: 0 },
      completed: { count: 0, value: 0 },
      cancelled: { count: 0, value: 0 }
    }
  }
}

async function getTopProducts(supabase: any, startDate: string, endDate: string) {
  try {
    const { data: topProducts, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        inventory!inner(name, sku)
      `)
      .order('quantity', { ascending: false })
      .limit(10)

    if (error) throw error

    return topProducts?.map((item: any) => ({
      name: item.inventory?.name || 'Unknown',
      sku: item.inventory?.sku || '',
      quantity: item.quantity || 0,
      revenue: (item.quantity || 0) * (item.price || 0)
    })) || []
  } catch (error) {
    console.error('Error getting top products:', error)
    return []
  }
}

async function getSalesByCustomer(supabase: any, startDate: string, endDate: string) {
  try {
    const { data: salesByCustomer, error } = await supabase
      .from('orders')
      .select(`
        total_amount,
        customers!inner(full_name, email)
      `)
      .eq('status', 'completed')
      .order('total_amount', { ascending: false })
      .limit(10)

    if (error) throw error

    return salesByCustomer?.map((order: any) => ({
      customerName: order.customers?.full_name || 'Unknown',
      email: order.customers?.email || '',
      totalSpent: order.total_amount || 0
    })) || []
  } catch (error) {
    console.error('Error getting sales by customer:', error)
    return []
  }
}

async function getRecentOrders(supabase: any) {
  try {
    const { data: recentOrders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers!inner(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return recentOrders?.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customers?.full_name || 'Unknown',
      totalAmount: order.total_amount || 0,
      status: order.status,
      createdAt: order.created_at
    })) || []
  } catch (error) {
    console.error('Error getting recent orders:', error)
    return []
  }
} 