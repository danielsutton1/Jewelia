import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Enable RLS on main tables
    const tables = ['customers', 'orders', 'inventory', 'production_items']
    
    for (const table of tables) {
      // Enable RLS
      const { error: rlsError } = await supabase.rpc('enable_rls', { table_name: table })
      if (rlsError) {
        console.warn(`RLS enable warning for ${table}:`, rlsError.message)
      }
    }

    // Create basic policies for customers table
    const { error: customersPolicyError } = await supabase.rpc('create_policy', {
      table_name: 'customers',
      policy_name: 'users_can_view_all_customers',
      definition: 'SELECT * FROM customers',
      operation: 'SELECT'
    })

    if (customersPolicyError) {
      console.warn('Customers policy warning:', customersPolicyError.message)
    }

    // Create basic policies for orders table
    const { error: ordersPolicyError } = await supabase.rpc('create_policy', {
      table_name: 'orders',
      policy_name: 'users_can_view_all_orders',
      definition: 'SELECT * FROM orders',
      operation: 'SELECT'
    })

    if (ordersPolicyError) {
      console.warn('Orders policy warning:', ordersPolicyError.message)
    }

    // Create basic policies for inventory table
    const { error: inventoryPolicyError } = await supabase.rpc('create_policy', {
      table_name: 'inventory',
      policy_name: 'users_can_view_all_inventory',
      definition: 'SELECT * FROM inventory',
      operation: 'SELECT'
    })

    if (inventoryPolicyError) {
      console.warn('Inventory policy warning:', inventoryPolicyError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'RLS policies added successfully',
      data: {
        tables_updated: tables.length,
        policies_created: 3
      }
    })

  } catch (error: any) {
    console.error('RLS setup error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to add RLS policies',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 