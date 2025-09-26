import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PartnerService } from '@/lib/services/PartnerService'

export async function GET(request: NextRequest) {
  try {
    // Create partner service instance
    const partnerService = new PartnerService()

    // Get analytics
    const analytics = await partnerService.getAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error: any) {
    console.error('Partner analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 