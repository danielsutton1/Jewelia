import { NextRequest, NextResponse } from 'next/server'
import { CommunicationService } from '@/lib/services/CommunicationService'

const communicationService = new CommunicationService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.thread_id || !body.sender_id || !body.content) {
      return NextResponse.json(
        { error: 'Thread ID, sender ID, and content are required' },
        { status: 400 }
      )
    }

    const message = await communicationService.sendMessage(body, body.sender_id)

    return NextResponse.json({
      success: true,
      data: message
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 