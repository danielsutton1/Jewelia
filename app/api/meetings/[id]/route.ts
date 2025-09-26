import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MeetingService } from '@/lib/services/MeetingService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Get meeting by ID
    const meeting = await meetingService.get(id)

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: meeting
    })

  } catch (error: any) {
    console.error('Get meeting error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Update meeting
    const result = await meetingService.update(id, body)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Update meeting error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Delete meeting
    await meetingService.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Meeting deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete meeting error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 