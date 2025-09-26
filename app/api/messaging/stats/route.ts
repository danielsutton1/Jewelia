import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { UnifiedMessagingService } from '@/lib/services/UnifiedMessagingService'

const messagingService = new UnifiedMessagingService()

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id') || undefined
    const partnerId = searchParams.get('partner_id') || undefined

    const stats = await messagingService.getMessagingStats(user.id, organizationId, partnerId)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching messaging stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messaging stats' },
      { status: 500 }
    )
  }
} 