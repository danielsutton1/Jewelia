import { NextRequest, NextResponse } from 'next/server'
import { ReportingService } from '@/lib/services/ReportingService'

const reportingService = new ReportingService()

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

    const report = await reportingService.generateReport({
      reportType: body.reportType,
      dateRange: body.dateRange,
      filters: body.filters || {},
      format: body.format || 'json',
      includeCharts: body.includeCharts || false
    })

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report generated successfully.'
    })

  } catch (error: any) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 