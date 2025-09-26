import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withErrorHandling, handleApiError, AuthenticationError, ValidationError } from '@/lib/middleware/errorHandler'
import { logger } from '@/lib/services/LoggingService'

export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) => {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // For testing purposes, use a demo user if no authentication
  const userId = user?.id || 'fdb2a122-d6ae-4e78-b277-3317e1a09132'

  const { messageId } = await params

  if (!messageId) {
    throw new ValidationError('Message ID is required')
  }

  // Log the request
  await logger.info('Marking message as read', {
    userId: userId,
    messageId
  })

  // Update the message to mark it as read
  const { data: message, error: updateError } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .eq('recipient_id', userId) // Ensure user can only mark their own messages as read
    .select()
    .single()

  if (updateError) {
    console.error('Error marking message as read:', updateError)
    throw new Error('Failed to mark message as read')
  }

  if (!message) {
    throw new Error('Message not found or access denied')
  }

  return NextResponse.json({
    success: true,
    data: message
  })
})
