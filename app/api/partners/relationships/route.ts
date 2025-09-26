import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PartnerService } from '@/lib/services/PartnerService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.partnerId || !body.relatedPartnerId || !body.relationshipType) {
      return NextResponse.json(
        { error: 'Partner ID, related partner ID, and relationship type are required' },
        { status: 400 }
      )
    }

    // Create partner service instance
    const partnerService = new PartnerService()

    // Create relationship
    const result = await partnerService.createRelationship({
      partnerId: body.partnerId,
      relatedPartnerId: body.relatedPartnerId,
      relationshipType: body.relationshipType,
      strength: body.strength || 'moderate',
      notes: body.notes || ''
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create relationship error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId') || user.id

    // Create partner service instance
    const partnerService = new PartnerService()

    // Get relationships
    const relationships = await partnerService.getRelationships(partnerId)

    return NextResponse.json({
      success: true,
      data: relationships
    })

  } catch (error: any) {
    console.error('Get relationships error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 