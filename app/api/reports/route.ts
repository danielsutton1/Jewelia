import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ReportingService } from '@/lib/services/ReportingService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.reportType || !body.dateRange) {
      return NextResponse.json(
        { error: 'Report type and date range are required' },
        { status: 400 }
      )
    }

    // Create reporting service instance
    const reportingService = new ReportingService()

    // Generate report
    const result = await reportingService.generateReport({
      reportType: body.reportType,
      dateRange: body.dateRange,
      filters: body.filters || {},
      format: body.format || 'json',
      includeCharts: body.includeCharts || false
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const reportType = searchParams.get('reportType') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const offset = (page - 1) * limit

    // Create reporting service instance
    const reportingService = new ReportingService()

    // Get report history
    const result = await reportingService.getReportHistory({
      reportType,
      dateFrom,
      dateTo,
      page,
      limit
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })

  } catch (error: any) {
    console.error('Get report history error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 