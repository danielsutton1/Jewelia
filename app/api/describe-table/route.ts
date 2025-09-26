import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get('table') || 'customers'
    
    // Try to get table structure by attempting different column names
    const testColumns = [
      'id', 'full_name', 'name', 'email', 'phone', 'address', 'notes', 
      'created_at', 'updated_at', 'customer_name', 'first_name', 'last_name',
      'customer_id', 'status', 'total_amount', 'payment_status', 'order_number',
      'tax_amount', 'shipping_amount', 'discount_amount', 'expected_delivery_date',
      'sku', 'description', 'category', 'price', 'cost', 'quantity', 'stock',
      'stock_quantity', 'inventory_status', 'status'
    ]
    
    const results: any = {}
    
    for (const column of testColumns) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select(column)
          .limit(1)
        
        results[column] = {
          exists: !error,
          error: error?.message || null
        }
      } catch (e: any) {
        results[column] = {
          exists: false,
          error: e.message
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      table: tableName,
      columnTests: results
    })
    
  } catch (error: any) {
    console.error('Table description error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
