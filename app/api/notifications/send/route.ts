import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SendNotificationSchema = z.object({
  user_ids: z.array(z.string().uuid()),
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.string().default('info'),
  metadata: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const validatedData = SendNotificationSchema.parse(body)

    // Prepare notification records
    const notifications = validatedData.user_ids.map(user_id => ({
      user_id,
      title: validatedData.title,
      body: validatedData.body,
      type: validatedData.type,
      metadata: validatedData.metadata || {},
      priority: validatedData.priority,
      status: 'unread',
      sent_by: user.id,
      sent_at: new Date().toISOString(),
    }))

    // Insert notifications
    const { data: inserted, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) {
      console.error('Notification send error:', error)
      return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: inserted, message: 'Notifications sent' })
  } catch (error: any) {
    console.error('Send notification error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 