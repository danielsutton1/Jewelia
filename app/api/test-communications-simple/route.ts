import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create a direct client without RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test basic table access
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .limit(5)

    if (error) {
      return NextResponse.json({
        error: 'Table access failed',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('Simple test error:', error)
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
} 