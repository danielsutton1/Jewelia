import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test accounts_receivable table
    const { data: arData, error: arError } = await supabase
      .from('accounts_receivable')
      .select('*')
      .limit(5)

    if (arError) {
      console.error('AR Error:', arError)
      return NextResponse.json({ error: arError.message }, { status: 500 })
    }

    // Test accounts_payable table
    const { data: apData, error: apError } = await supabase
      .from('accounts_payable')
      .select('*')
      .limit(5)

    if (apError) {
      console.error('AP Error:', apError)
      return NextResponse.json({ error: apError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      accounts_receivable: {
        count: arData?.length || 0,
        sample: arData?.[0] || null,
        columns: arData?.[0] ? Object.keys(arData[0]) : []
      },
      accounts_payable: {
        count: apData?.length || 0,
        sample: apData?.[0] || null,
        columns: apData?.[0] ? Object.keys(apData[0]) : []
      }
    })
  } catch (error: any) {
    console.error('Test finance error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 