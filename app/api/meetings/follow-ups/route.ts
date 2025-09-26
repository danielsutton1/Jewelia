import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MeetingService } from '@/lib/services/MeetingService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.meetingId || !body.type || !body.title || !body.assignedTo || !body.dueDate) {
      return NextResponse.json(
        { error: 'Meeting ID, type, title, assigned to, and due date are required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Create follow-up
    const result = await meetingService.createFollowUp(body.meetingId, {
      title: body.title,
      description: body.description || '',
      due_date: body.dueDate,
      priority: body.priority || 'medium'
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create follow-up error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get('meetingId')

    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Get follow-ups
    const followUps = await meetingService.getFollowUps(meetingId)

    return NextResponse.json({
      success: true,
      data: followUps
    })

  } catch (error: any) {
    console.error('Get follow-ups error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 