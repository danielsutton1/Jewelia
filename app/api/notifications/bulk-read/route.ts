import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const BulkReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
})

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Validate input
    const validatedData = BulkReadSchema.parse(body)
    // Bulk update notifications
    const { data: updated, error } = await supabase
      .from('notifications')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .in('id', validatedData.ids)
      .eq('user_id', user.id)
      .select()
    if (error) {
      console.error('Bulk mark as read error:', error)
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data: updated, message: 'Notifications marked as read' })
  } catch (error: any) {
    console.error('Bulk mark as read error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 