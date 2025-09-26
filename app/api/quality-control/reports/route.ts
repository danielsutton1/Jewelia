import { NextRequest, NextResponse } from 'next/server'
import { QualityControlService } from '@/lib/services/QualityControlService'

const qualityControlService = new QualityControlService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.type || !body.period_start || !body.period_end) {
      return NextResponse.json(
        { error: 'Type, period_start, and period_end are required' },
        { status: 400 }
      )
    }

    const report = await qualityControlService.generateQualityReport(
      body.type,
      body.period_start,
      body.period_end
    )

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Quality report generation started. Check status for completion.'
    }, { status: 202 })

  } catch (error: any) {
    console.error('Error generating quality report:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 