import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Test basic database connection
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('count')
      .limit(1)
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('count')
      .limit(1)
    
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('count')
      .limit(1)

    return NextResponse.json({
      success: true,
      message: 'Backend connection test successful',
      data: {
        customers: customersError ? 'Error' : 'Connected',
        orders: ordersError ? 'Error' : 'Connected', 
        inventory: inventoryError ? 'Error' : 'Connected',
        timestamp: new Date().toISOString()
      },
      errors: {
        customers: customersError?.message,
        orders: ordersError?.message,
        inventory: inventoryError?.message
      }
    })
  } catch (error: any) {
    console.error('Connection test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Connection test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 