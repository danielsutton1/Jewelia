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
        { error: 'Action item ID is required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Update action item
    const result = await meetingService.updateActionItem(id, body)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Update action item error:', error)
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
        { error: 'Action item ID is required' },
        { status: 400 }
      )
    }

    // Delete action item
    const { error } = await supabase
      .from('meeting_action_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting action item:', error)
      return NextResponse.json(
        { error: 'Failed to delete action item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Action item deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete action item error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 