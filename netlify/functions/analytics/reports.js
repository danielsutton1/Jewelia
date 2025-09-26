
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Parse the request body
  const body = event.body ? JSON.parse(event.body) : {};
  
  // Convert Next.js API route to Netlify function
  try {
    // Extract the handler from the route file
    import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { analyticsReportsSchema, analyticsReportItemsSchema, dateRangeSchema, validateDateRange } from '@/lib/validations/analytics'

async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const reportType = searchParams.get('reportType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Validate date range
    validateDateRange(startDate, endDate)

    // Validate query parameters
    if (startDate || endDate) {
      dateRangeSchema.parse({ startDate, endDate })
    }

    let query = supabaseAdmin
      .from('analytics_reports')
      .select(`
        *,
        analytics_report_items (*)
      `)
      .order('created_at', { ascending: false })

    if (reportType) {
      query = query.eq('report_type', reportType)
    }
    if (startDate) {
      query = query.gte('date_range_start', startDate)
    }
    if (endDate) {
      query = query.lte('date_range_end', endDate)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { report, items } = body

    // Validate report data
    const validatedReport = analyticsReportsSchema.parse(report)

    // Validate report items
    const validatedItems = items.map((item: any) => analyticsReportItemsSchema.parse(item))

    // Start a transaction
    const { data: reportData, error: reportError } = await supabaseAdmin
      .from('analytics_reports')
      .insert([validatedReport])
      .select()
      .single()

    if (reportError) {
      return NextResponse.json({ success: false, error: reportError.message }, { status: 500 })
    }

    // Add report items
    const reportItems = validatedItems.map((item: any) => ({
      ...item,
      report_id: reportData.id
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('analytics_report_items')
      .insert(reportItems)

    if (itemsError) {
      return NextResponse.json({ success: false, error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: reportData })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
} 

    // Handle the request based on the HTTP method
    const method = event.httpMethod;
    let response;
    
    switch (method) {
      case 'GET':
        response = await GET({ req: event, supabase });
        break;
      case 'POST':
        response = await POST({ req: event, supabase });
        break;
      case 'PUT':
        response = await PUT({ req: event, supabase });
        break;
      case 'DELETE':
        response = await DELETE({ req: event, supabase });
        break;
      case 'PATCH':
        response = await PATCH({ req: event, supabase });
        break;
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
