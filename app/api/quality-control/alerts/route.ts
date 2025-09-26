import { NextRequest, NextResponse } from 'next/server'
import { QualityControlService } from '@/lib/services/QualityControlService'

const qualityControlService = new QualityControlService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: any = {}
    if (searchParams.get('type')) filters.type = searchParams.get('type')
    if (searchParams.get('severity')) filters.severity = searchParams.get('severity')
    if (searchParams.get('is_active') !== null) filters.is_active = searchParams.get('is_active') === 'true'

    const alerts = await qualityControlService.getQualityAlerts(filters)

    return NextResponse.json({
      success: true,
      data: alerts
    })

  } catch (error: any) {
    console.error('Error fetching quality alerts:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.type || !body.severity || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'Type, severity, title, and message are required' },
        { status: 400 }
      )
    }

    const alert = await qualityControlService.createQualityAlert(body)

    return NextResponse.json({
      success: true,
      data: alert
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating quality alert:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 