import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('Testing individual table access...')
    
    // Test each table individually
    const [customers, orders, products, inventory] = await Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('products').select('*'),
      supabase.from('inventory').select('*')
    ])
    
    console.log('Table results:', {
      customers: { count: customers.data?.length || 0, error: customers.error },
      orders: { count: orders.data?.length || 0, error: orders.error },
      products: { count: products.data?.length || 0, error: products.error },
      inventory: { count: inventory.data?.length || 0, error: inventory.error }
    })

    return NextResponse.json({
      success: true,
      tables: {
        customers: {
          count: customers.data?.length || 0,
          error: customers.error,
          sample: customers.data?.slice(0, 2) || []
        },
        orders: {
          count: orders.data?.length || 0,
          error: orders.error,
          sample: orders.data?.slice(0, 2) || []
        },
        products: {
          count: products.data?.length || 0,
          error: products.error,
          sample: products.data?.slice(0, 2) || []
        },
        inventory: {
          count: inventory.data?.length || 0,
          error: inventory.error,
          sample: inventory.data?.slice(0, 2) || []
        }
      }
    })

  } catch (error: any) {
    console.error('Test tables error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 