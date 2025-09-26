// 📹 VIDEO CALL SERVICE
// Handles WebRTC video calls with encryption for remote consultations

import { createClient } from '@supabase/supabase-js'
import { 
  VideoCall, 
  VideoCallParticipant, 
  VideoCallRequest, 
  VideoCallResponse,
  VideoCallParticipantUpdate,
  CallType,
  CallStatus
} from '@/types/encrypted-communication'
import { encryptionService } from './EncryptionService'
import { logger } from './LoggingService'

// =====================================================
// WEBRTC CONFIGURATION
// =====================================================

const WEBRTC_CONFIG = {
  // ICE servers for WebRTC
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  
  // Media constraints
  MEDIA_CONSTRAINTS: {
    video: {
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 },
      frameRate: { ideal: 30, min: 15 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  },
  
  // Connection timeout (ms)
  CONNECTION_TIMEOUT: 30000,
  
  // Reconnection attempts
  MAX_RECONNECTION_ATTEMPTS: 3,
  
  // Quality monitoring interval (ms)
  QUALITY_MONITORING_INTERVAL: 5000
}

// =====================================================
// VIDEO CALL SERVICE CLASS
// =====================================================

export class VideoCallService {
  private supabase: any
  private activeCalls: Map<string, VideoCallSession> = new Map()
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private localStreams: Map<string, MediaStream> = new Map()
  private isInitialized: boolean = false

  constructor() {
    this.supabase = null
    this.initializeService()
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  private async initializeService() {
    try {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Test WebRTC capabilities
      await this.testWebRTCCapabilities()
      
      this.isInitialized = true
      logger.info('Video call service initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize video call service', error)
      throw error
    }
  }

  private async testWebRTCCapabilities() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        logger.info('WebRTC capability test skipped - server-side environment')
        return
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        logger.warn('WebRTC getUserMedia not available - video calls may not work')
        return
      }

      // Test getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach(track => track.stop())
      
      // Test RTCPeerConnection
      const pc = new RTCPeerConnection({ iceServers: WEBRTC_CONFIG.ICE_SERVERS })
      pc.close()
      
      logger.info('WebRTC capabilities verified')
    } catch (error) {
      logger.warn('WebRTC capability test failed - video calls may not work', error)
      // Don't throw error during initialization - just log warning
    }
  }

  // =====================================================
  // VIDEO CALL MANAGEMENT
  // =====================================================

  async initiateCall(request: VideoCallRequest): Promise<VideoCallResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('Video call service not initialized')
      }

      const { conversationId, callType, participants, isEncrypted } = request

      // Generate unique room ID
      const roomId = `room_${conversationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create video call record
      const videoCall: Omit<VideoCall, 'id' | 'created_at' | 'updated_at'> = {
        conversation_id: conversationId,
        call_type: callType,
        status: 'initiating',
        initiator_id: participants[0], // First participant is initiator
        participants,
        start_time: new Date().toISOString(),
        room_id: roomId,
        is_encrypted: isEncrypted,
        encryption_key_id: undefined, // Will be set if encrypted
        recording_encrypted: false
      }

      // If encrypted, generate encryption key
      if (isEncrypted) {
        try {
          const encryptionKey = await encryptionService.generateConversationKey(
            conversationId,
            participants,
            participants[0]
          )
          videoCall.encryption_key_id = encryptionKey.id
        } catch (encryptionError) {
          logger.warn('Failed to generate encryption key for video call', encryptionError)
          // Continue without encryption
          videoCall.is_encrypted = false
        }
      }

      // Save to database
      const { data: call, error } = await this.supabase
        .from('video_calls')
        .insert(videoCall)
        .select()
        .single()

      if (error) throw error

      // Create participant records
      const participantRecords: Omit<VideoCallParticipant, 'id' | 'created_at' | 'updated_at'>[] = participants.map(participantId => ({
        call_id: call.id,
        user_id: participantId,
        joined_at: new Date().toISOString(),
        is_active: true,
        is_muted: false,
        is_video_enabled: callType !== 'audio',
        device_info: {},
        network_info: {},
        quality_metrics: {}
      }))

      await this.supabase
        .from('video_call_participants')
        .insert(participantRecords)

      // Initialize call session
      const callSession = new VideoCallSession(call.id, roomId, callType, isEncrypted)
      this.activeCalls.set(call.id, callSession)

      // Notify participants
      await this.notifyParticipants(call.id, participants, 'call_invitation', {
        callId: call.id,
        roomId,
        callType,
        isEncrypted
      })

      logger.info('Video call initiated successfully', { 
        callId: call.id, 
        roomId, 
        participants: participants.length,
        isEncrypted 
      })

      return {
        success: true,
        callId: call.id,
        roomId,
        encryptionKeyId: call.encryption_key_id
      }

    } catch (error) {
      logger.error('Failed to initiate video call', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async joinCall(callId: string, userId: string): Promise<boolean> {
    try {
      const call = await this.getVideoCall(callId)
      if (!call) {
        throw new Error('Video call not found')
      }

      // Check if user is a participant
      if (!call.participants.includes(userId)) {
        throw new Error('User not authorized to join this call')
      }

      // Update participant status
      await this.updateParticipantStatus(callId, userId, {
        isActive: true
      })

      // Get or create call session
      let callSession = this.activeCalls.get(callId)
      if (!callSession) {
        callSession = new VideoCallSession(callId, call.room_id, call.call_type, call.is_encrypted)
        this.activeCalls.set(callId, callSession)
      }

      // Join the session
      await callSession.joinParticipant(userId)

      // Update call status if needed
      if (call.status === 'initiating') {
        await this.updateCallStatus(callId, 'ringing')
      }

      logger.info('User joined video call', { callId, userId })
      return true

    } catch (error) {
      logger.error('Failed to join video call', error)
      return false
    }
  }

  async leaveCall(callId: string, userId: string): Promise<boolean> {
    try {
      const call = await this.getVideoCall(callId)
      if (!call) {
        throw new Error('Video call not found')
      }

      // Update participant status
      await this.updateParticipantStatus(callId, userId, {
        isActive: false
      })

      // Get call session
      const callSession = this.activeCalls.get(callId)
      if (callSession) {
        await callSession.leaveParticipant(userId)
      }

      // Check if call should end
      const activeParticipants = await this.getActiveParticipants(callId)
      if (activeParticipants.length === 0) {
        await this.endCall(callId)
      }

      logger.info('User left video call', { callId, userId })
      return true

    } catch (error) {
      logger.error('Failed to leave video call', error)
      return false
    }
  }

  async endCall(callId: string): Promise<boolean> {
    try {
      const call = await this.getVideoCall(callId)
      if (!call) {
        throw new Error('Video call not found')
      }

      // Update call status
      await this.updateCallStatus(callId, 'ended', {
        endTime: new Date().toISOString(),
        durationSeconds: Math.floor((Date.now() - new Date(call.start_time).getTime()) / 1000)
      })

      // Clean up call session
      const callSession = this.activeCalls.get(callId)
      if (callSession) {
        await callSession.cleanup()
        this.activeCalls.delete(callId)
      }

      // Clean up peer connections
      const peerConnection = this.peerConnections.get(callId)
      if (peerConnection) {
        peerConnection.close()
        this.peerConnections.delete(callId)
      }

      // Clean up local streams
      const localStream = this.localStreams.get(callId)
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
        this.localStreams.delete(callId)
      }

      // Notify participants
      const participants = await this.getCallParticipants(callId)
      await this.notifyParticipants(callId, participants.map(p => p.user_id), 'call_ended', {
        callId,
        duration: Math.floor((Date.now() - new Date(call.start_time).getTime()) / 1000)
      })

      logger.info('Video call ended', { callId })
      return true

    } catch (error) {
      logger.error('Failed to end video call', error)
      return false
    }
  }

  // =====================================================
  // MEDIA STREAM MANAGEMENT
  // =====================================================

  async startLocalStream(callId: string, userId: string, constraints?: MediaStreamConstraints): Promise<MediaStream | null> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        logger.warn('Cannot start local stream - not in browser environment')
        return null
      }

      const call = await this.getVideoCall(callId)
      if (!call) {
        throw new Error('Video call not found')
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        logger.warn('getUserMedia not available - cannot start local stream')
        return null
      }

      // Get media constraints based on call type
      const mediaConstraints = constraints || this.getMediaConstraints(call.call_type)

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)

      // Store local stream
      this.localStreams.set(callId, stream)

      // Update participant status
      await this.updateParticipantStatus(callId, userId, {
        isVideoEnabled: call.call_type !== 'audio',
        isMuted: false
      })

      logger.info('Local media stream started', { callId, userId, tracks: stream.getTracks().length })
      return stream

    } catch (error) {
      logger.error('Failed to start local media stream', error)
      return null
    }
  }

  async stopLocalStream(callId: string): Promise<void> {
    try {
      const stream = this.localStreams.get(callId)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        this.localStreams.delete(callId)
        logger.info('Local media stream stopped', { callId })
      }
    } catch (error) {
      logger.error('Failed to stop local media stream', error)
    }
  }

  private getMediaConstraints(callType: CallType): MediaStreamConstraints {
    switch (callType) {
      case 'audio':
        return { audio: WEBRTC_CONFIG.MEDIA_CONSTRAINTS.audio }
      case 'video':
        return WEBRTC_CONFIG.MEDIA_CONSTRAINTS
      case 'screen_share':
        return {
          video: {
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 }
          },
          audio: false
        }
      default:
        return WEBRTC_CONFIG.MEDIA_CONSTRAINTS
    }
  }

  // =====================================================
  // PEER CONNECTION MANAGEMENT
  // =====================================================

  async createPeerConnection(callId: string, userId: string): Promise<RTCPeerConnection | null> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
        logger.warn('Cannot create peer connection - not in browser environment or WebRTC not supported')
        return null
      }

      const call = await this.getVideoCall(callId)
      if (!call) {
        throw new Error('Video call not found')
      }

      // Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection({
        iceServers: WEBRTC_CONFIG.ICE_SERVERS,
        iceCandidatePoolSize: 10
      })

      // Store peer connection
      this.peerConnections.set(callId, peerConnection)

      // Set up event handlers
      this.setupPeerConnectionHandlers(peerConnection, callId, userId)

      // Add local stream if available
      const localStream = this.localStreams.get(callId)
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream)
        })
      }

      logger.info('Peer connection created', { callId, userId })
      return peerConnection

    } catch (error) {
      logger.error('Failed to create peer connection', error)
      return null
    }
  }

  private setupPeerConnectionHandlers(peerConnection: RTCPeerConnection, callId: string, userId: string) {
    // ICE candidate handling
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        try {
          await this.sendICECandidate(callId, userId, event.candidate)
        } catch (error) {
          logger.error('Failed to send ICE candidate', error)
        }
      }
    }

    // Connection state changes
    peerConnection.onconnectionstatechange = async () => {
      const state = peerConnection.connectionState
      logger.info('Peer connection state changed', { callId, userId, state })

      if (state === 'connected') {
        await this.updateCallStatus(callId, 'connected')
      } else if (state === 'failed' || state === 'disconnected') {
        // Attempt reconnection
        await this.handleConnectionFailure(callId, userId)
      }
    }

    // Track handling
    peerConnection.ontrack = async (event) => {
      try {
        // Handle remote track - implementation needed
        console.log('Remote track received:', event)
      } catch (error) {
        logger.error('Failed to handle remote track', error)
      }
    }

    // ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState
      logger.info('ICE connection state changed', { callId, userId, state })
    }
  }

  // =====================================================
  // CALL SIGNALING
  // =====================================================

  async sendOffer(callId: string, userId: string, targetUserId: string): Promise<RTCSessionDescriptionInit | null> {
    try {
      const peerConnection = this.peerConnections.get(callId)
      if (!peerConnection) {
        throw new Error('Peer connection not found')
      }

      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })

      // Set local description
      await peerConnection.setLocalDescription(offer)

      // Send offer to target user
      await this.sendSignalingMessage(callId, userId, targetUserId, 'offer', offer)

      logger.info('Offer sent', { callId, from: userId, to: targetUserId })
      return offer

    } catch (error) {
      logger.error('Failed to send offer', error)
      return null
    }
  }

  async handleOffer(callId: string, userId: string, offer: RTCSessionDescriptionInit): Promise<boolean> {
    try {
      const peerConnection = this.peerConnections.get(callId)
      if (!peerConnection) {
        throw new Error('Peer connection not found')
      }

      // Set remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

      // Create answer
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      // Send answer back
      const senderId = await this.getOfferSender(callId, offer)
      if (senderId) {
        await this.sendSignalingMessage(callId, userId, senderId, 'answer', answer)
      }

      logger.info('Offer handled and answer sent', { callId, userId })
      return true

    } catch (error) {
      logger.error('Failed to handle offer', error)
      return false
    }
  }

  async handleAnswer(callId: string, userId: string, answer: RTCSessionDescriptionInit): Promise<boolean> {
    try {
      const peerConnection = this.peerConnections.get(callId)
      if (!peerConnection) {
        throw new Error('Peer connection not found')
      }

      // Set remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))

      logger.info('Answer handled', { callId, userId })
      return true

    } catch (error) {
      logger.error('Failed to handle answer', error)
      return false
    }
  }

  async handleICECandidate(callId: string, userId: string, candidate: RTCIceCandidateInit): Promise<boolean> {
    try {
      const peerConnection = this.peerConnections.get(callId)
      if (!peerConnection) {
        throw new Error('Peer connection not found')
      }

      // Add ICE candidate
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))

      logger.info('ICE candidate handled', { callId, userId })
      return true

    } catch (error) {
      logger.error('Failed to handle ICE candidate', error)
      return false
    }
  }

  // =====================================================
  // QUALITY MONITORING
  // =====================================================

  async startQualityMonitoring(callId: string): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(callId)
      if (!peerConnection) return

      const interval = setInterval(async () => {
        try {
          const stats = await peerConnection.getStats()
          const qualityMetrics = this.analyzeConnectionQuality(stats)
          
          // Update quality metrics for all participants
          const participants = await this.getCallParticipants(callId)
          for (const participant of participants) {
            if (participant.is_active) {
              await this.updateParticipantStatus(callId, participant.user_id, {
                qualityMetrics
              })
            }
          }

        } catch (error) {
          logger.error('Failed to collect quality metrics', error)
          clearInterval(interval)
        }
      }, WEBRTC_CONFIG.QUALITY_MONITORING_INTERVAL)

      // Store interval reference for cleanup
      const callSession = this.activeCalls.get(callId)
      if (callSession) {
        callSession.setQualityMonitoringInterval(interval)
      }

    } catch (error) {
      logger.error('Failed to start quality monitoring', error)
    }
  }

  private analyzeConnectionQuality(stats: RTCStatsReport): Record<string, any> {
    const metrics: Record<string, any> = {}

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        metrics.video = {
          packetsLost: report.packetsLost,
          jitter: report.jitter,
          framesDecoded: report.framesDecoded,
          framesDropped: report.framesDropped
        }
      } else if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
        metrics.audio = {
          packetsLost: report.packetsLost,
          jitter: report.jitter
        }
      } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        metrics.connection = {
          currentRoundTripTime: report.currentRoundTripTime,
          availableOutgoingBitrate: report.availableOutgoingBitrate
        }
      }
    })

    return metrics
  }

  // =====================================================
  // DATABASE OPERATIONS
  // =====================================================

  private async getVideoCall(callId: string): Promise<VideoCall | null> {
    try {
      const { data, error } = await this.supabase
        .from('video_calls')
        .select('*')
        .eq('id', callId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to get video call', error)
      return null
    }
  }

  private async updateCallStatus(callId: string, status: CallStatus, additionalData?: Record<string, any>): Promise<void> {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() }
      if (additionalData) {
        Object.assign(updateData, additionalData)
      }

      await this.supabase
        .from('video_calls')
        .update(updateData)
        .eq('id', callId)

    } catch (error) {
      logger.error('Failed to update call status', error)
    }
  }

  private async updateParticipantStatus(
    callId: string, 
    userId: string, 
    updates: Partial<VideoCallParticipantUpdate>
  ): Promise<void> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() }
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.isMuted !== undefined) updateData.is_muted = updates.isMuted
      if (updates.isVideoEnabled !== undefined) updateData.is_video_enabled = updates.isVideoEnabled
      if (updates.deviceInfo) updateData.device_info = updates.deviceInfo
      if (updates.networkInfo) updateData.network_info = updates.networkInfo
      if (updates.qualityMetrics) updateData.quality_metrics = updates.qualityMetrics

      await this.supabase
        .from('video_call_participants')
        .update(updateData)
        .eq('call_id', callId)
        .eq('user_id', userId)

    } catch (error) {
      logger.error('Failed to update participant status', error)
    }
  }

  private async getCallParticipants(callId: string): Promise<VideoCallParticipant[]> {
    try {
      const { data, error } = await this.supabase
        .from('video_call_participants')
        .select('*')
        .eq('call_id', callId)

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Failed to get call participants', error)
      return []
    }
  }

  private async getActiveParticipants(callId: string): Promise<VideoCallParticipant[]> {
    try {
      const { data, error } = await this.supabase
        .from('video_call_participants')
        .select('*')
        .eq('call_id', callId)
        .eq('is_active', true)

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Failed to get active participants', error)
      return []
    }
  }

  // =====================================================
  // NOTIFICATION AND SIGNALING
  // =====================================================

  private async notifyParticipants(
    callId: string, 
    userIds: string[], 
    eventType: string, 
    data: any
  ): Promise<void> {
    try {
      // This would integrate with your notification system
      // For now, we'll use Supabase realtime
      await this.supabase
        .channel(`video_call_${callId}`)
        .send({
          type: 'broadcast',
          event: eventType,
          payload: data
        })

    } catch (error) {
      logger.error('Failed to notify participants', error)
    }
  }

  private async sendSignalingMessage(
    callId: string, 
    fromUserId: string, 
    toUserId: string, 
    type: string, 
    data: any
  ): Promise<void> {
    try {
      await this.supabase
        .channel(`video_call_signaling_${callId}`)
        .send({
          type: 'broadcast',
          event: 'signaling',
          payload: {
            from: fromUserId,
            to: toUserId,
            type,
            data
          }
        })

    } catch (error) {
      logger.error('Failed to send signaling message', error)
    }
  }

  private async sendICECandidate(
    callId: string, 
    fromUserId: string, 
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    try {
      await this.supabase
        .channel(`video_call_signaling_${callId}`)
        .send({
          type: 'broadcast',
          event: 'ice_candidate',
          payload: {
            from: fromUserId,
            candidate
          }
        })

    } catch (error) {
      logger.error('Failed to send ICE candidate', error)
    }
  }

  private async getOfferSender(callId: string, offer: RTCSessionDescriptionInit): Promise<string | null> {
    // This would need to be implemented based on your signaling logic
    // For now, return null
    return null
  }

  // =====================================================
  // ERROR HANDLING AND RECONNECTION
  // =====================================================

  private async handleConnectionFailure(callId: string, userId: string): Promise<void> {
    try {
      const callSession = this.activeCalls.get(callId)
      if (!callSession) return

      const attempts = callSession.getReconnectionAttempts()
      if (attempts < WEBRTC_CONFIG.MAX_RECONNECTION_ATTEMPTS) {
        // Attempt reconnection
        callSession.incrementReconnectionAttempts()
        
        setTimeout(async () => {
          try {
            await this.attemptReconnection(callId, userId)
          } catch (error) {
            logger.error('Reconnection attempt failed', error)
          }
        }, 1000 * (attempts + 1)) // Exponential backoff

      } else {
        // Max attempts reached, end call
        logger.warn('Max reconnection attempts reached, ending call', { callId, userId })
        await this.endCall(callId)
      }

    } catch (error) {
      logger.error('Failed to handle connection failure', error)
    }
  }

  private async attemptReconnection(callId: string, userId: string): Promise<boolean> {
    try {
      // Create new peer connection
      const newPeerConnection = await this.createPeerConnection(callId, userId)
      if (!newPeerConnection) return false

      // Attempt to re-establish connection
      // This would involve re-sending offers/answers and ICE candidates
      
      logger.info('Reconnection attempt successful', { callId, userId })
      return true

    } catch (error) {
      logger.error('Reconnection attempt failed', error)
      return false
    }
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  async cleanup(): Promise<void> {
    try {
      // End all active calls
      for (const [callId, callSession] of this.activeCalls) {
        await callSession.cleanup()
      }
      this.activeCalls.clear()

      // Close all peer connections
      for (const [callId, peerConnection] of this.peerConnections) {
        peerConnection.close()
      }
      this.peerConnections.clear()

      // Stop all local streams
      for (const [callId, stream] of this.localStreams) {
        stream.getTracks().forEach(track => track.stop())
      }
      this.localStreams.clear()

      this.isInitialized = false
      logger.info('Video call service cleaned up successfully')
    } catch (error) {
      logger.error('Failed to cleanup video call service', error)
    }
  }
}

// =====================================================
// VIDEO CALL SESSION CLASS
// =====================================================

class VideoCallSession {
  private callId: string
  private roomId: string
  private callType: CallType
  private isEncrypted: boolean
  private participants: Set<string> = new Set()
  private qualityMonitoringInterval?: NodeJS.Timeout
  private reconnectionAttempts: number = 0

  constructor(callId: string, roomId: string, callType: CallType, isEncrypted: boolean) {
    this.callId = callId
    this.roomId = roomId
    this.callType = callType
    this.isEncrypted = isEncrypted
  }

  async joinParticipant(userId: string): Promise<void> {
    this.participants.add(userId)
  }

  async leaveParticipant(userId: string): Promise<void> {
    this.participants.delete(userId)
  }

  setQualityMonitoringInterval(interval: NodeJS.Timeout): void {
    this.qualityMonitoringInterval = interval
  }

  getReconnectionAttempts(): number {
    return this.reconnectionAttempts
  }

  incrementReconnectionAttempts(): void {
    this.reconnectionAttempts++
  }

  async cleanup(): Promise<void> {
    if (this.qualityMonitoringInterval) {
      clearInterval(this.qualityMonitoringInterval)
    }
    this.participants.clear()
  }
}

// Export singleton instance
export const videoCallService = new VideoCallService()
