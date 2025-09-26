import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const status = searchParams.get('status') || undefined
    const carrier = searchParams.get('carrier') || undefined
    const dateRange = searchParams.get('dateRange') || 'week'
    
    // Get logistics data
    const { data: logisticsData, error: logisticsError } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          "Full Name",
          email,
          phone,
          address
        )
      `)
      .not('shipping_status', 'is', null)
      .order('created_at', { ascending: false })
    
    if (logisticsError) throw logisticsError
    
    // Get shipping metrics
    const { data: shippingMetrics, error: metricsError } = await supabase
      .from('orders')
      .select('shipping_status, tracking_number, estimated_delivery')
    
    if (metricsError) throw metricsError
    
    // Calculate logistics metrics
    const pendingShipments = shippingMetrics?.filter((order: any) => order.shipping_status === 'pending').length || 0
    const inTransit = shippingMetrics?.filter((order: any) => order.shipping_status === 'in_transit').length || 0
    const delivered = shippingMetrics?.filter((order: any) => order.shipping_status === 'delivered').length || 0
    const delayed = shippingMetrics?.filter((order: any) => order.shipping_status === 'delayed').length || 0
    
    // Organize data by status
    const logisticsByStatus = {
      'Pending': logisticsData?.filter((order: any) => order.shipping_status === 'pending') || [],
      'In Transit': logisticsData?.filter((order: any) => order.shipping_status === 'in_transit') || [],
      'Out for Delivery': logisticsData?.filter((order: any) => order.shipping_status === 'out_for_delivery') || [],
      'Delivered': logisticsData?.filter((order: any) => order.shipping_status === 'delivered') || [],
      'Delayed': logisticsData?.filter((order: any) => order.shipping_status === 'delayed') || [],
      'Returned': logisticsData?.filter((order: any) => order.shipping_status === 'returned') || []
    }
    
    // Get recent tracking updates
    const { data: trackingUpdates, error: trackingError } = await supabase
      .from('tracking_updates')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20)
    
    if (trackingError) {
      console.warn('Failed to fetch tracking updates:', trackingError)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        logisticsByStatus,
        metrics: {
          pendingShipments,
          inTransit,
          delivered,
          delayed,
          totalShipments: logisticsData?.length || 0
        },
        recentTracking: trackingUpdates || [],
        recentActivity: logisticsData?.slice(0, 10) || []
      }
    })
    
  } catch (error: any) {
    console.error('Logistics API error:', error)
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
    
    // Update shipping status
    const { order_id, shipping_status, tracking_number, estimated_delivery, notes } = body
    
    if (!order_id || !shipping_status) {
      return NextResponse.json({ error: 'Order ID and shipping status are required' }, { status: 400 })
    }
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        shipping_status,
        tracking_number,
        estimated_delivery,
        shipping_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Log tracking update
    if (tracking_number) {
      const { error: logError } = await supabase
        .from('tracking_updates')
        .insert([{
          order_id,
          tracking_number,
          status: shipping_status,
          estimated_delivery,
          notes,
          timestamp: new Date().toISOString()
        }])
      
      if (logError) {
        console.warn('Failed to log tracking update:', logError)
      }
    }
    
    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Shipping status updated to ${shipping_status}`
    })
    
  } catch (error: any) {
    console.error('Logistics update API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 