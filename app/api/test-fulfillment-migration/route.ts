import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface TableResult {
  exists: boolean
  error?: string
  count?: number
}

interface Results {
  [key: string]: TableResult
}

export async function GET(request: NextRequest) {
  try {
    // Test if fulfillment tables exist
    const tables = [
      'fulfillment_orders',
      'fulfillment_items', 
      'shipping_packages',
      'shipping_rates',
      'fulfillment_status_history',
      'warehouse_locations'
    ]

    const results: Results = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          results[table] = { exists: false, error: error.message }
        } else {
          results[table] = { exists: true, count: data?.length || 0 }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        results[table] = { exists: false, error: errorMessage }
      }
    }

    // Test fulfillment functions
    let fulfillmentNumber = null
    let packageNumber = null

    try {
      const { data: fnData, error: fnError } = await supabase
        .rpc('generate_fulfillment_number')
      
      if (!fnError) {
        fulfillmentNumber = fnData
      }
    } catch (err) {
      // Function might not exist yet
    }

    return NextResponse.json({
      success: true,
      message: 'Fulfillment migration test results',
      tables: results,
      functions: {
        generate_fulfillment_number: fulfillmentNumber ? 'working' : 'not available'
      },
      migration_status: Object.values(results).every((r: TableResult) => r.exists) ? 'complete' : 'pending'
    })
  } catch (error: any) {
    console.error('Error in test-fulfillment-migration:', error)
    return NextResponse.json({ 
      error: error.message,
      migration_status: 'error'
    }, { status: 500 })
  }
} 