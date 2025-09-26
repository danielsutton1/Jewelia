import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('Checking actual database schema...')
    
    // Try to get schema information using a different approach
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'customers' })
      .select()

    if (error) {
      console.error('Error getting schema:', error)
      
      // Fallback: try to describe the table structure by attempting different column combinations
      const testColumns = [
        'id',
        'full_name', 
        'email',
        'phone',
        'address',
        'notes',
        'created_at',
        'updated_at'
      ]
      
      const results: Record<string, { exists: boolean; error: string | null }> = {}
      
      for (const column of testColumns) {
        try {
          const { data: testData, error: testError } = await supabase
            .from('customers')
            .select(column)
            .limit(1)
          
          results[column] = {
            exists: !testError,
            error: testError?.message || null
          }
        } catch (e: any) {
          results[column] = {
            exists: false,
            error: e.message || 'Unknown error'
          }
        }
      }
      
      return NextResponse.json({
        success: false,
        error: error.message,
        columnTest: results
      })
    }

    return NextResponse.json({
      success: true,
      schema: data
    })

  } catch (error: any) {
    console.error('Check schema error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 