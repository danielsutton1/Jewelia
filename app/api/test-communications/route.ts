import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Test 1: Check if table exists and has data
    const { data: basicData, error: basicError } = await supabase
      .from('communications')
      .select('*')
      .limit(5)

    if (basicError) {
      return NextResponse.json({
        error: 'Basic table access failed',
        details: basicError
      }, { status: 500 })
    }

    // Test 2: Check foreign key relationships
    const { data: joinData, error: joinError } = await supabase
      .from('communications')
      .select(`
        id,
        sender_id,
        recipient_id,
        subject,
        content,
        type,
        status,
        created_at
      `)
      .limit(5)

    if (joinError) {
      return NextResponse.json({
        error: 'Join query failed',
        details: joinError,
        basicData
      }, { status: 500 })
    }

    // Test 3: Check if we can access auth.users (this might be the issue)
    let usersData = null;
    let usersError = null;
    try {
      const { data: users, error: uError } = await supabase
        .from('auth.users')
        .select('id, email')
        .limit(3)
      usersData = users;
      usersError = uError;
    } catch (e) {
      usersError = e;
    }

    return NextResponse.json({
      success: true,
      basicData,
      joinData,
      usersData: usersError ? { error: usersError } : usersData,
      tableExists: true,
      recordCount: basicData?.length || 0
    })

  } catch (error: any) {
    console.error('Test communications error:', error)
    return NextResponse.json({
      error: error.message || 'Internal server error',
      stack: error.stack
    }, { status: 500 })
  }
} 