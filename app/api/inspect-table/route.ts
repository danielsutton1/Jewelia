import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get('table') || 'customers'
    
    // Get table info using a simple query to see the structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      })
    }
    
    // Try to get column info by looking at the data structure
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []
    
    return NextResponse.json({
      success: true,
      table: tableName,
      columns: columns,
      sampleData: data,
      error: null
    })
    
  } catch (error: any) {
    console.error('Table inspection error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
