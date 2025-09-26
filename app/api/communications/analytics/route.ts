import { NextRequest, NextResponse } from 'next/server'
import { CommunicationService } from '@/lib/services/CommunicationService'

const communicationService = new CommunicationService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: any = {}
    if (searchParams.get('start_date')) filters.start_date = searchParams.get('start_date')
    if (searchParams.get('end_date')) filters.end_date = searchParams.get('end_date')
    if (searchParams.get('user_id')) filters.user_id = searchParams.get('user_id')
    if (searchParams.get('type')) filters.type = searchParams.get('type')

    const analytics = await communicationService.getCommunicationAnalytics(filters)

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error: any) {
    console.error('Error fetching communication analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 