import { NextRequest, NextResponse } from 'next/server'
import { CommunicationService } from '@/lib/services/CommunicationService'

const communicationService = new CommunicationService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: any = {}
    if (searchParams.get('partner_id')) filters.partner_id = searchParams.get('partner_id')
    if (searchParams.get('order_id')) filters.order_id = searchParams.get('order_id')
    if (searchParams.get('status')) filters.status = searchParams.get('status')?.split(',')
    if (searchParams.get('type')) filters.type = searchParams.get('type')?.split(',')
    if (searchParams.get('assigned_to')) filters.assigned_to = searchParams.get('assigned_to')

    const threads = await communicationService.getThreads(filters)

    return NextResponse.json({
      success: true,
      data: threads
    })

  } catch (error: any) {
    console.error('Error fetching communication threads:', error)
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
    if (!body.subject || !body.type) {
      return NextResponse.json(
        { error: 'Subject and type are required' },
        { status: 400 }
      )
    }

    const thread = await communicationService.createThread(body)

    return NextResponse.json({
      success: true,
      data: thread
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating communication thread:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 