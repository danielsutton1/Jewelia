import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MeetingService } from '@/lib/services/MeetingService'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Update follow-up
    const result = await meetingService.updateFollowUp(id, body)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Update follow-up error:', error)
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
    const supabase = await createSupabaseServerClient()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 }
      )
    }

    // Delete follow-up
    const { error } = await supabase
      .from('meeting_follow_ups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting follow-up:', error)
      return NextResponse.json(
        { error: 'Failed to delete follow-up' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Follow-up deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete follow-up error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 