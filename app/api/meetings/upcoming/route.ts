import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MeetingService } from '@/lib/services/MeetingService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Get upcoming meetings
    const meetings = await meetingService.getUpcomingMeetings(days)

    return NextResponse.json({
      success: true,
      data: meetings
    })

  } catch (error: any) {
    console.error('Get upcoming meetings error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 