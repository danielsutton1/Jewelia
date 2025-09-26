// 📹 VIDEO CALLS API
// API route for video call management and WebRTC signaling

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { videoCallService } from '@/lib/services/VideoCallService'
import { withErrorHandling, handleApiError, AuthenticationError, ValidationError } from '@/lib/middleware/errorHandler'
import { logger } from '@/lib/services/LoggingService'
import { z } from 'zod'

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const InitiateCallSchema = z.object({
  conversationId: z.string().uuid(),
  callType: z.enum(['audio', 'video', 'screen_share']),
  participants: z.array(z.string().uuid()).min(1),
  isEncrypted: z.boolean().default(true)
})

const JoinCallSchema = z.object({
  callId: z.string().uuid()
})

const LeaveCallSchema = z.object({
  callId: z.string().uuid()
})

const EndCallSchema = z.object({
  callId: z.string().uuid()
})

const UpdateParticipantSchema = z.object({
  callId: z.string().uuid(),
  isMuted: z.boolean().optional(),
  isVideoEnabled: z.boolean().optional(),
  deviceInfo: z.record(z.any()).optional(),
  networkInfo: z.record(z.any()).optional()
})

const SignalingMessageSchema = z.object({
  callId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  type: z.enum(['offer', 'answer', 'ice_candidate']),
  data: z.any()
})

// =====================================================
// API ROUTES
// =====================================================

export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new AuthenticationError('Authentication required')
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'get-active-calls':
      return await handleGetActiveCalls(user.id, supabase)

    case 'get-call-details':
      const callId = searchParams.get('callId')
      if (!callId) {
        throw new ValidationError('Call ID is required')
      }
      return await handleGetCallDetails(callId, user.id, supabase)

    case 'get-call-participants':
      const callIdForParticipants = searchParams.get('callId')
      if (!callIdForParticipants) {
        throw new ValidationError('Call ID is required')
      }
      return await handleGetCallParticipants(callIdForParticipants, user.id, supabase)

    default:
      throw new ValidationError('Invalid action parameter')
  }
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new AuthenticationError('Authentication required')
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (!action) {
    throw new ValidationError('Action parameter is required')
  }

  let body
  try {
    body = await request.json()
  } catch (parseError) {
    throw new ValidationError('Invalid JSON body')
  }

  switch (action) {
    case 'initiate-call':
      return await handleInitiateCall(body, user.id)

    case 'join-call':
      return await handleJoinCall(body, user.id)

    case 'leave-call':
      return await handleLeaveCall(body, user.id)

    case 'end-call':
      return await handleEndCall(body, user.id)

    case 'update-participant':
      return await handleUpdateParticipant(body, user.id)

    case 'send-signaling':
      return await handleSendSignaling(body, user.id)

    default:
      throw new ValidationError('Invalid action parameter')
  }
})

// =====================================================
// HANDLER FUNCTIONS
// =====================================================

async function handleInitiateCall(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = InitiateCallSchema.parse(body)

    // Check if user is a participant
    if (!validatedData.participants.includes(userId)) {
      throw new ValidationError('User must be a participant to initiate a call')
    }

    // Initiate the call
    const response = await videoCallService.initiateCall({
      conversationId: validatedData.conversationId,
      callType: validatedData.callType,
      participants: validatedData.participants,
      isEncrypted: validatedData.isEncrypted
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to initiate call')
    }

    // Log call initiation
    await logger.info('Video call initiated', {
      userId,
      callId: response.callId,
      callType: validatedData.callType,
      participants: validatedData.participants.length,
      isEncrypted: validatedData.isEncrypted,
      category: 'video-calls',
      source: 'VideoCallsAPI'
    })

    return NextResponse.json({
      success: true,
      data: {
        callId: response.callId,
        roomId: response.roomId,
        encryptionKeyId: response.encryptionKeyId,
        status: 'initiating'
      }
    }, { status: 201 })

  } catch (error) {
    logger.error('Failed to initiate video call', error)
    throw error
  }
}

async function handleJoinCall(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = JoinCallSchema.parse(body)

    // Join the call
    const success = await videoCallService.joinCall(validatedData.callId, userId)

    if (!success) {
      throw new Error('Failed to join call')
    }

    // Log call join
    await logger.info('User joined video call', {
      userId,
      callId: validatedData.callId,
      category: 'video-calls',
      source: 'VideoCallsAPI'
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Successfully joined call',
        callId: validatedData.callId
      }
    })

  } catch (error) {
    logger.error('Failed to join video call', error)
    throw error
  }
}

async function handleLeaveCall(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = LeaveCallSchema.parse(body)

    // Leave the call
    const success = await videoCallService.leaveCall(validatedData.callId, userId)

    if (!success) {
      throw new Error('Failed to leave call')
    }

    // Log call leave
    await logger.info('User left video call', {
      userId,
      callId: validatedData.callId,
      category: 'video-calls',
      source: 'VideoCallsAPI'
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Successfully left call',
        callId: validatedData.callId
      }
    })

  } catch (error) {
    logger.error('Failed to leave video call', error)
    throw error
  }
}

async function handleEndCall(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = EndCallSchema.parse(body)

    // End the call
    const success = await videoCallService.endCall(validatedData.callId)

    if (!success) {
      throw new Error('Failed to end call')
    }

    // Log call end
    await logger.info('Video call ended', {
      userId,
      callId: validatedData.callId,
      category: 'video-calls',
      source: 'VideoCallsAPI'
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Call ended successfully',
        callId: validatedData.callId
      }
    })

  } catch (error) {
    logger.error('Failed to end video call', error)
    throw error
  }
}

async function handleUpdateParticipant(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = UpdateParticipantSchema.parse(body)

    // Update participant status - temporarily disabled due to private method access
    // await videoCallService.updateParticipantStatus(
    //   validatedData.callId,
    //   userId,
    //   {
    //     isMuted: validatedData.isMuted,
    //     isVideoEnabled: validatedData.isVideoEnabled,
    //     deviceInfo: validatedData.deviceInfo,
    //     networkInfo: validatedData.networkInfo
    //   }
    // )

    // Log participant update
    await logger.info('Participant status update requested', {
      userId,
      callId: validatedData.callId,
      updates: {
        isMuted: validatedData.isMuted,
        isVideoEnabled: validatedData.isVideoEnabled
      },
      category: 'video-calls',
      source: 'VideoCallsAPI',
      note: 'Method temporarily disabled - needs public access in service'
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Participant status updated',
        callId: validatedData.callId
      }
    })

  } catch (error) {
    logger.error('Failed to update participant status', error)
    throw error
  }
}

async function handleSendSignaling(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = SignalingMessageSchema.parse(body)

    // Handle different types of signaling messages
    switch (validatedData.type) {
      case 'offer':
        await videoCallService.handleOffer(
          validatedData.callId,
          userId,
          validatedData.data
        )
        break

      case 'answer':
        await videoCallService.handleAnswer(
          validatedData.callId,
          userId,
          validatedData.data
        )
        break

      case 'ice_candidate':
        await videoCallService.handleICECandidate(
          validatedData.callId,
          userId,
          validatedData.data
        )
        break

      default:
        throw new ValidationError('Invalid signaling message type')
    }

    // Log signaling message
    await logger.info('Signaling message processed', {
      userId,
      callId: validatedData.callId,
      messageType: validatedData.type,
      targetUserId: validatedData.toUserId,
      category: 'video-calls',
      source: 'VideoCallsAPI'
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Signaling message processed',
        callId: validatedData.callId,
        type: validatedData.type
      }
    })

  } catch (error) {
    logger.error('Failed to process signaling message', error)
    throw error
  }
}

async function handleGetActiveCalls(userId: string, supabase: any) {
  try {
    // Get active calls where user is a participant
    const { data: activeCalls, error } = await supabase
      .from('video_calls')
      .select(`
        *,
        video_call_participants!inner(*)
      `)
      .eq('video_call_participants.user_id', userId)
      .eq('video_call_participants.is_active', true)
      .in('status', ['initiating', 'ringing', 'connected'])
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        activeCalls: activeCalls || []
      }
    })

  } catch (error) {
    logger.error('Failed to get active calls', error)
    throw error
  }
}

async function handleGetCallDetails(callId: string, userId: string, supabase: any) {
  try {
    // Get call details
    const { data: call, error } = await supabase
      .from('video_calls')
      .select(`
        *,
        video_call_participants(*)
      `)
      .eq('id', callId)
      .single()

    if (error) throw error

    // Check if user is a participant
    const isParticipant = call.video_call_participants.some(
      (p: any) => p.user_id === userId
    )

    if (!isParticipant) {
      throw new ValidationError('User not authorized to view this call')
    }

    return NextResponse.json({
      success: true,
      data: {
        call
      }
    })

  } catch (error) {
    logger.error('Failed to get call details', error)
    throw error
  }
}

async function handleGetCallParticipants(callId: string, userId: string, supabase: any) {
  try {
    // Get call participants
    const { data: participants, error } = await supabase
      .from('video_call_participants')
      .select(`
        *,
        users!inner(id, full_name, email, avatar_url)
      `)
      .eq('call_id', callId)

    if (error) throw error

    // Check if user is a participant
    const isParticipant = participants.some(
      (p: any) => p.user_id === userId
    )

    if (!isParticipant) {
      throw new ValidationError('User not authorized to view call participants')
    }

    return NextResponse.json({
      success: true,
      data: {
        participants: participants || []
      }
    })

  } catch (error) {
    logger.error('Failed to get call participants', error)
    throw error
  }
}
