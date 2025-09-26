import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// import { sendEmailNotification, createNotification } from '@/lib/notifications'
import { getEmailTemplate } from '@/lib/emailTemplates'

// TODO: Store your Google API credentials securely (env vars or secret manager)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is not set')
}
if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Helper to get Google access token using refresh token
async function getGoogleAccessToken() {
  const params = new URLSearchParams()
  params.append('client_id', GOOGLE_CLIENT_ID || '')
  params.append('client_secret', GOOGLE_CLIENT_SECRET || '')
  params.append('refresh_token', GOOGLE_REFRESH_TOKEN || '')
  params.append('grant_type', 'refresh_token')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || 'Failed to get Google access token')
  return data.access_token
}

// Helper to get user email from user ID
async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch user email:', error)
    return null
  }

  return data?.email
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic, start_time, duration, attendees = [], organizer_id } = body
    if (!topic || !start_time || !duration || !organizer_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const accessToken = await getGoogleAccessToken()
    // Calculate end time
    const start = new Date(start_time)
    const end = new Date(start.getTime() + duration * 60000)
    // Build event object
    const eventObj = {
      summary: topic,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees: attendees.map((email: string) => ({ email })),
      conferenceData: { createRequest: { requestId: `${Date.now()}` } },
    }
    // Create event with Meet link
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events?conferenceDataVersion=1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventObj),
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || 'Google Calendar API error' }, { status: 500 })
    }
    // Extract Meet link
    const join_url = data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri

    // Get organizer's email
    const organizerEmail = await getUserEmail(organizer_id)
    if (!organizerEmail) {
      return NextResponse.json({ error: 'Failed to get organizer email' }, { status: 500 })
    }

    // Send email notifications to attendees
    if (attendees.length > 0) {
      // Use email template utility
      const { subject, html } = getEmailTemplate('meeting', {
        topic,
        start: start.toLocaleString(),
        duration,
        joinUrl: join_url,
      })
      // await sendEmailNotification(
      //   attendees,
      //   subject,
      //   html
      // )
      // Create in-app notifications
      for (const attendeeId of attendees) {
        // await createNotification(attendeeId, {
        //   type: 'meeting',
        //   title: 'New Meeting Invitation',
        //   message: `You have been invited to "${topic}"`,
        //   data: {
        //     meetingId: data.id,
        //     joinUrl: join_url,
        //     startTime: start_time,
        //     duration,
        //   },
        // })
      }
    }

    return NextResponse.json({ join_url, event_id: data.id })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: String(error?.message || error) }, { status: 500 })
  }
}

// TODO: Implement OAuth/token exchange for production use
// TODO: Add error handling/logging
// TODO: Secure credentials and validate user permissions
// TODO: Use Google Calendar API to create event and return real Meet link 