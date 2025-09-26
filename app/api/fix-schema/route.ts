import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Fixing database schema...')
    
    const results = []
    
    // Test adding each column individually
    const columns = [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT UNIQUE' },
      { name: 'phone', type: 'TEXT' },
      { name: 'address', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' }
    ]
    
    for (const column of columns) {
      try {
        // Try to select the column to see if it exists
        const { data, error } = await supabase
          .from('customers')
          .select(column.name)
          .limit(1)
        
        if (error && error.message.includes('does not exist')) {
          results.push({
            column: column.name,
            status: 'missing',
            error: error.message
          })
        } else {
          results.push({
            column: column.name,
            status: 'exists',
            error: null
          })
        }
      } catch (e: any) {
        results.push({
          column: column.name,
          status: 'error',
          error: e.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Schema check completed',
      results: results
    })

  } catch (error: any) {
    console.error('Fix schema error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 