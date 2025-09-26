import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { differenceInHours } from 'date-fns'
// import { sendEmailNotification, createNotification, generateICSFile } from '@/lib/notifications'
// import { getEmailTemplate } from '@/lib/emailTemplates'

// TODO: Store your Zoom OAuth credentials securely (env vars or secret manager)
// const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
// const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
// const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID
const ZOOM_REFRESH_TOKEN = process.env.ZOOM_REFRESH_TOKEN // For server-to-server OAuth

// Helper to get Zoom access token (using refresh token or OAuth flow)
async function getZoomAccessToken(): Promise<string> {
  // TODO: Implement proper OAuth flow
  // For now, return a placeholder token
  return process.env.ZOOM_ACCESS_TOKEN || 'placeholder_token'
}

// Helper to get user email from user ID
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user email:', error)
      return null
    }

    return data?.email
  } catch (error) {
    console.error('Error in getUserEmail:', error)
    return null
  }
}

// Generate ICS file for calendar invite
function generateICSFile(data: {
  title: string
  startTime: Date
  duration: number
  joinUrl: string
  organizer: string
  attendees: string[]
}): string {
  const endTime = new Date(data.startTime.getTime() + data.duration * 60000)
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jewelia CRM//Meeting//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@jewelia-crm.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${data.startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${data.title}`,
    `DESCRIPTION:Join Zoom Meeting: ${data.joinUrl}`,
    `ORGANIZER;CN=Organizer:mailto:${data.organizer}`,
    ...data.attendees.map(email => `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${email}`),
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  
  return icsContent
}

// Send email notification
async function sendEmailNotification(
  recipients: string[],
  subject: string,
  html: string,
  icsContent?: string
): Promise<void> {
  // This would integrate with your email service
  // For now, just log the email details
  console.log('Email notification:', {
    recipients,
    subject,
    html: html.substring(0, 100) + '...',
    hasICS: !!icsContent
  })
  
  // TODO: Implement actual email sending
  // await emailService.send({
  //   to: recipients,
  //   subject,
  //   html,
  //   attachments: icsContent ? [{ filename: 'meeting.ics', content: icsContent }] : []
  // })
}

// Create in-app notification
async function createNotification(
  userId: string,
  notification: {
    type: string
    title: string
    message: string
    data?: Record<string, any>
  }
): Promise<void> {
  // This would create a notification in your database
  // For now, just log the notification
  console.log('Creating notification:', {
    userId,
    ...notification
  })
  
  // TODO: Implement actual notification creation
  // await supabase.from('notifications').insert({
  //   user_id: userId,
  //   type: notification.type,
  //   title: notification.title,
  //   message: notification.message,
  //   data: notification.data
  // })
}

// Get email template
function getEmailTemplate(type: string, data: Record<string, any>): { subject: string; html: string } {
  if (type === 'meeting') {
    return {
      subject: `Meeting Invitation: ${data.topic}`,
      html: `
        <h2>Meeting Invitation</h2>
        <p><strong>Topic:</strong> ${data.topic}</p>
        <p><strong>Start Time:</strong> ${data.start}</p>
        <p><strong>Duration:</strong> ${data.duration} minutes</p>
        <p><strong>Join URL:</strong> <a href="${data.joinUrl}">${data.joinUrl}</a></p>
        <p>Please add this meeting to your calendar.</p>
      `
    }
  }
  
  return {
    subject: 'Notification',
    html: '<p>You have a new notification.</p>'
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic, start_time, duration, timezone, attendees = [], organizer_id } = body
    // Validate required fields
    if (!topic || !start_time || !duration || !organizer_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const accessToken = await getZoomAccessToken()

    // Create Zoom meeting
    const zoomRes = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        type: 2, // Scheduled meeting
        start_time,
        duration,
        timezone: timezone || 'UTC',
        settings: {
          join_before_host: true,
          approval_type: 0,
          registration_type: 1,
        },
      }),
    })
    const zoomData = await zoomRes.json()
    if (!zoomRes.ok) {
      return NextResponse.json({ error: zoomData.message || 'Zoom API error' }, { status: 500 })
    }

    // Get organizer's email
    const organizerEmail = await getUserEmail(organizer_id)
    if (!organizerEmail) {
      return NextResponse.json({ error: 'Failed to get organizer email' }, { status: 500 })
    }

    // Send email notifications to attendees
    if (attendees.length > 0) {
      // Generate .ics file for calendar invite
      const icsContent = generateICSFile({
        title: topic,
        startTime: new Date(start_time),
        duration,
        joinUrl: zoomData.join_url,
        organizer: organizerEmail,
        attendees,
      })

      // Send email with calendar invite
      const { subject, html } = getEmailTemplate('meeting', {
        topic,
        start: new Date(start_time).toLocaleString(),
        duration,
        joinUrl: zoomData.join_url,
      })
      await sendEmailNotification(
        attendees,
        subject,
        html,
        icsContent
      )

      // Create in-app notifications
      for (const attendeeId of attendees) {
        await createNotification(attendeeId, {
          type: 'meeting',
          title: 'New Meeting Invitation',
          message: `You have been invited to "${topic}"`,
          data: {
            meetingId: zoomData.id,
            joinUrl: zoomData.join_url,
            startTime: start_time,
            duration,
          },
        })
      }
    }

    // Return join_url and meeting info
    return NextResponse.json({ join_url: zoomData.join_url, meeting_id: zoomData.id, ...zoomData })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}

// TODO: Implement OAuth/token exchange for production use
// TODO: Add error handling/logging
// TODO: Secure credentials and validate user permissions 