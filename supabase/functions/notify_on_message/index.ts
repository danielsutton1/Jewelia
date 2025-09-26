import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_API_KEY')!
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')!

serve(async (req) => {
  try {
    const { message, user_id } = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError) {
      throw new Error(`Failed to fetch user: ${userError.message}`)
    }

    // Get notification preferences
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (prefError && prefError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch preferences: ${prefError.message}`)
    }

    const shouldSendPush = preferences?.push_notifications ?? true
    const shouldSendEmail = preferences?.email_notifications ?? true

    // Send push notification if enabled
    if (shouldSendPush && user.push_token) {
      const pushResponse = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_player_ids: [user.push_token],
          contents: { en: message.content },
          headings: { en: 'New Message' },
          data: { message_id: message.id, thread_id: message.thread_id },
        }),
      })

      if (!pushResponse.ok) {
        console.error('Failed to send push notification:', await pushResponse.text())
      }
    }

    // Send email notification if enabled
    if (shouldSendEmail && user.email) {
      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: user.email, name: user.full_name }],
              subject: 'New Message - Jewelia CRM',
            },
          ],
          from: { email: FROM_EMAIL, name: 'Jewelia CRM' },
          content: [
            {
              type: 'text/html',
              value: `
                <h2>New Message</h2>
                <p>You have received a new message:</p>
                <p><strong>${message.content}</strong></p>
                <p><a href="${Deno.env.get('APP_URL')}/dashboard/messages">View Message</a></p>
              `,
            },
          ],
        }),
      })

      if (!emailResponse.ok) {
        console.error('Failed to send email notification:', await emailResponse.text())
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Notification error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}) 