import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PartnerService } from '@/lib/services/PartnerService'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Create partner service instance
    const partnerService = new PartnerService()

    // Update request status
    const result = await partnerService.updateRequestStatus(id, body.status)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Update request status error:', error)
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
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Delete request
    const { error } = await supabase
      .from('partner_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting request:', error)
      return NextResponse.json(
        { error: 'Failed to delete request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete request error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 