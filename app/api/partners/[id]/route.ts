import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PartnerService } from '@/lib/services/PartnerService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Create partner service instance
    const partnerService = new PartnerService()

    // Get partner by ID
    const partner = await partnerService.getById(id)

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Get relationships and requests
    const relationships = await partnerService.getRelationships(id)
    const { data: requests } = await partnerService.getRequests({ partnerId: id })

    return NextResponse.json({
      success: true,
      data: {
        partner,
        relationships,
        requests
      }
    })

  } catch (error: any) {
    console.error('Get partner error:', error)
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
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Create partner service instance
    const partnerService = new PartnerService()

    // Update partner
    const result = await partnerService.update({
      id,
      ...body
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Update partner error:', error)
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
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Create partner service instance
    const partnerService = new PartnerService()

    // Delete partner
    await partnerService.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete partner error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 