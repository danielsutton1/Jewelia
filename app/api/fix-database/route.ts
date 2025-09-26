import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Fixing database schema...')
    
    // Since we can't execute raw SQL directly, let's try to work around this
    // by creating a new table with the correct schema and migrating data
    
    const results = []
    
    // First, let's check what columns currently exist
    const { data: currentData, error: currentError } = await supabase
      .from('customers')
      .select('*')
      .limit(1)
    
    if (currentError) {
      results.push({
        step: 'check_current_schema',
        success: false,
        error: currentError.message
      })
    } else {
      results.push({
        step: 'check_current_schema',
        success: true,
        columns: Object.keys(currentData?.[0] || {}),
        error: null
      })
    }

    // Try to add columns by attempting to insert with the new schema
    // This will fail but might trigger schema updates
    try {
      const { data: testInsert, error: insertError } = await supabase
        .from('customers')
        .insert([{
          full_name: 'Test Customer',
          email: 'test@example.com',
          phone: '+1-555-0000',
          address: 'Test Address',
          notes: 'Test Notes'
        }])
        .select()
      
      if (insertError) {
        results.push({
          step: 'test_insert_with_new_schema',
          success: false,
          error: insertError.message
        })
      } else {
        results.push({
          step: 'test_insert_with_new_schema',
          success: true,
          error: null
        })
        
        // Clean up test data
        if (testInsert?.[0]?.id) {
          await supabase.from('customers').delete().eq('id', testInsert[0].id)
        }
      }
    } catch (e: any) {
      results.push({
        step: 'test_insert_with_new_schema',
        success: false,
        error: e.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema analysis completed',
      results: results
    })

  } catch (error: any) {
    console.error('Fix database error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 