import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MeetingService } from '@/lib/services/MeetingService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.meetingId || !body.title || !body.assignedTo || !body.dueDate) {
      return NextResponse.json(
        { error: 'Meeting ID, title, assigned to, and due date are required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Create action item
    const result = await meetingService.createActionItem(body.meetingId, {
      title: body.title,
      description: body.description || '',
      assigned_to: body.assignedTo,
      due_date: body.dueDate,
      priority: body.priority || 'medium'
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create action item error:', error)
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

    // Get action items
    const actionItems = await meetingService.getActionItems(meetingId)

    return NextResponse.json({
      success: true,
      data: actionItems
    })

  } catch (error: any) {
    console.error('Get action items error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 