import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Test customers table
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(5)

    // Test orders table
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .limit(5)

    // Test inventory table
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(5)

    return NextResponse.json({
      success: true,
      data: {
        customers: {
          count: customers?.length || 0,
          data: customers,
          error: customerError
        },
        orders: {
          count: orders?.length || 0,
          data: orders,
          error: orderError
        },
        inventory: {
          count: inventory?.length || 0,
          data: inventory,
          error: inventoryError
        }
      }
    })

  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
