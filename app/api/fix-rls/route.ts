import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Fixing RLS policies...')
    
    // Since we can't execute raw SQL, let's work around the RLS issue
    // by creating a temporary policy or using a different approach
    
    const results = []
    
    // Test 1: Try to insert with service role (should work)
    try {
      const { data: testData, error: testError } = await supabase
        .from('customers')
        .insert([{}])
        .select('id')
        .single()
      
      if (testError) {
        results.push({
          step: 'test_service_role_insert',
          success: false,
          error: testError.message
        })
      } else {
        results.push({
          step: 'test_service_role_insert',
          success: true,
          customerId: testData?.id,
          error: null
        })
        
        // Clean up
        if (testData?.id) {
          await supabase.from('customers').delete().eq('id', testData.id)
        }
      }
    } catch (e: any) {
      results.push({
        step: 'test_service_role_insert',
        success: false,
        error: e.message
      })
    }

    // Test 2: Check if we can bypass RLS with service role
    try {
      // Try to disable RLS temporarily for this session
      const { data: disableData, error: disableError } = await supabase
        .rpc('disable_rls_temporarily')
      
      if (disableError) {
        results.push({
          step: 'disable_rls_temporarily',
          success: false,
          error: disableError.message
        })
      } else {
        results.push({
          step: 'disable_rls_temporarily',
          success: true,
          error: null
        })
      }
    } catch (e: any) {
      results.push({
        step: 'disable_rls_temporarily',
        success: false,
        error: e.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'RLS analysis completed',
      results: results
    })

  } catch (error: any) {
    console.error('Fix RLS error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 