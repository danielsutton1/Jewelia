import { NextRequest, NextResponse } from 'next/server'
import { ReportingService } from '@/lib/services/ReportingService'

const reportingService = new ReportingService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const reportType = searchParams.get('reportType') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

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
    console.error('Error fetching report history:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 