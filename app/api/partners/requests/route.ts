import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PartnerService } from '@/lib/services/PartnerService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.partnerId || !body.type || !body.title || !body.description || !body.terms || !body.startDate) {
      return NextResponse.json(
        { error: 'Partner ID, type, title, description, terms, and start date are required' },
        { status: 400 }
      )
    }

    // Create partner service instance
    const partnerService = new PartnerService()

    // Create request
    const result = await partnerService.createRequest({
      partnerId: body.partnerId,
      type: body.type,
      title: body.title,
      description: body.description,
      terms: body.terms,
      startDate: body.startDate,
      endDate: body.endDate,
      value: body.value,
      notes: body.notes || ''
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create request error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const partnerId = searchParams.get('partnerId') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    // Create partner service instance
    const partnerService = new PartnerService()

    // Get requests with filters
    const filters: any = {
      page,
      limit
    }

    if (partnerId) filters.partnerId = partnerId
    if (type) filters.type = type
    if (status) filters.status = status

    const result = await partnerService.getRequests(filters)

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })

  } catch (error: any) {
    console.error('Get requests error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 