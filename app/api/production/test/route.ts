import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/production/test - Test endpoint to see actual data
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('products_in_production_pipeline')
      .select('*')
      .limit(3)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Raw production data for debugging'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 