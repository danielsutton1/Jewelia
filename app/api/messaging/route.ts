import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { UnifiedMessagingService } from '@/lib/services/UnifiedMessagingService'
import { MessageSchema, MessageQuerySchema } from '@/lib/schemas/messaging'
import { withErrorHandling, handleApiError, AuthenticationError, ValidationError } from '@/lib/middleware/errorHandler'
import { logger } from '@/lib/services/LoggingService'

const messagingService = new UnifiedMessagingService()

export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // For testing purposes, use a demo user if no authentication
  const userId = user?.id || 'fdb2a122-d6ae-4e78-b277-3317e1a09132'

  const { searchParams } = new URL(request.url)
  const queryParams = Object.fromEntries(searchParams.entries())

  // Parse and validate query parameters
  let validatedParams
  try {
    validatedParams = MessageQuerySchema.parse({
      ...queryParams,
      unread_only: queryParams.unread_only === 'true',
      limit: parseInt(queryParams.limit || '50'),
      offset: parseInt(queryParams.offset || '0')
    })
  } catch (validationError) {
    throw new ValidationError('Invalid query parameters')
  }

  // Log the request
  await logger.info('Fetching messages', {
    userId: userId,
    params: validatedParams
  })

  const result = await messagingService.getMessages(validatedParams)

  return NextResponse.json({
    success: true,
    data: result.messages,
    pagination: result.pagination,
    total: result.total
  })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // For testing purposes, use a demo user if no authentication
  const userId = user?.id || 'fdb2a122-d6ae-4e78-b277-3317e1a09132'

  let body
  try {
    body = await request.json()
  } catch (parseError) {
    throw new ValidationError('Invalid JSON body')
  }

  let validatedData
  try {
    validatedData = MessageSchema.parse(body)
  } catch (validationError) {
    throw new ValidationError('Invalid message data')
  }

  // Log the message sending
  await logger.info('Sending message', {
    userId: userId,
    messageType: validatedData.type,
    recipientId: validatedData.recipient_id,
    hasContent: !!validatedData.content
  })

  const message = await messagingService.sendMessage(validatedData, userId)

  return NextResponse.json({
    success: true,
    data: message
  }, { status: 201 })
}) 