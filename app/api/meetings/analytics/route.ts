import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MeetingService } from '@/lib/services/MeetingService'

export async function GET(request: NextRequest) {
  try {
    // Create meeting service instance
    const meetingService = new MeetingService()

    // Get analytics
    const analytics = await meetingService.getAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error: any) {
    console.error('Meeting analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 