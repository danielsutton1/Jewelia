// 🔐 ENCRYPTED COMMUNICATION SYSTEM TYPES
// Comprehensive type definitions for the encrypted messaging and video calling system

// =====================================================
// ENCRYPTION KEY TYPES
// =====================================================

export type KeyAlgorithm = 'RSA-2048' | 'RSA-4096' | 'AES-256-GCM' | 'ChaCha20-Poly1305';
export type AccessLevel = 'read' | 'write' | 'full' | 'admin';
export type EncryptionStatus = 'encrypted' | 'decrypted' | 'failed' | 'pending';

export interface UserEncryptionKey {
  id: string;
  user_id: string;
  
  // Key pair for asymmetric encryption
  public_key: string;
  encrypted_private_key: string; // Encrypted with user's master key
  
  // Master key for encrypting private keys
  master_key_hash: string;
  master_key_salt: string;
  
  // Key metadata
  key_version: number;
  key_algorithm: KeyAlgorithm;
  key_created_at: string;
  key_expires_at?: string;
  
  // Security metadata
  last_rotated_at: string;
  rotation_interval_days: number;
  
  created_at: string;
  updated_at: string;
}

export interface ConversationEncryptionKey {
  id: string;
  conversation_id: string;
  
  // Encrypted symmetric key for the conversation
  encrypted_symmetric_key: string;
  key_algorithm: KeyAlgorithm;
  
  // Key metadata
  key_version: number;
  key_created_at: string;
  key_expires_at?: string;
  
  // Access control
  created_by?: string;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface UserConversationKey {
  id: string;
  user_id: string;
  conversation_key_id: string;
  
  // User's encrypted access to the conversation key
  encrypted_access_key: string;
  
  // Access metadata
  access_granted_at: string;
  access_expires_at?: string;
  access_level: AccessLevel;
  
  // Security
  is_revoked: boolean;
  revoked_at?: string;
  revoked_by?: string;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// ENCRYPTED MESSAGE TYPES
// =====================================================

export interface EncryptedMessageMetadata {
  id: string;
  message_id: string;
  
  // Encryption details
  encryption_algorithm: KeyAlgorithm;
  key_id?: string;
  
  // Security metadata
  content_hash: string;
  signature: string;
  signature_algorithm: string;
  signed_by?: string;
  
  // Verification
  is_verified: boolean;
  verification_timestamp?: string;
  
  created_at: string;
  updated_at: string;
}

export interface EncryptedMessage extends Omit<EncryptedMessageMetadata, 'id' | 'message_id'> {
  // Message content (encrypted)
  encrypted_content: string;
  content_hash: string;
  signature: string;
  iv: string; // Initialization vector for AES
  
  // Encryption status
  encryption_version: number;
  is_encrypted: boolean;
  
  // Verification
  is_verified: boolean;
  verification_timestamp?: string;
}

// =====================================================
// ENCRYPTED FILE SHARING TYPES
// =====================================================

export interface EncryptedFile {
  id: string;
  original_file_id: string;
  
  // File encryption
  encrypted_file_url: string;
  encrypted_file_size: number;
  encryption_algorithm: KeyAlgorithm;
  
  // Key management
  encryption_key_id?: string;
  file_iv: string; // Initialization vector
  
  // File metadata (encrypted)
  encrypted_metadata?: string;
  metadata_iv?: string;
  
  // Security
  file_hash: string;
  signature?: string;
  
  // Access control
  access_expires_at?: string;
  max_downloads?: number;
  current_downloads: number;
  
  created_at: string;
  updated_at: string;
}

export interface FileAccessLog {
  id: string;
  file_id: string;
  user_id?: string;
  
  // Access details
  access_type: 'download' | 'view' | 'share' | 'delete';
  access_timestamp: string;
  ip_address?: string;
  user_agent?: string;
  
  // Security context
  session_id?: string;
  is_authorized: boolean;
  
  created_at: string;
}

// =====================================================
// VIDEO CALL TYPES
// =====================================================

export type CallType = 'audio' | 'video' | 'screen_share';
export type CallStatus = 'initiating' | 'ringing' | 'connected' | 'ended' | 'failed';

export interface VideoCall {
  id: string;
  conversation_id: string;
  
  // Call details
  call_type: CallType;
  status: CallStatus;
  
  // Participants
  initiator_id?: string;
  participants: string[];
  
  // Call metadata
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  
  // Technical details
  room_id: string;
  recording_url?: string;
  recording_encrypted: boolean;
  
  // Security
  is_encrypted: boolean;
  encryption_key_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface VideoCallParticipant {
  id: string;
  call_id: string;
  user_id: string;
  
  // Participation details
  joined_at: string;
  left_at?: string;
  duration_seconds?: number;
  
  // Technical details
  device_info: Record<string, any>;
  network_info: Record<string, any>;
  quality_metrics: Record<string, any>;
  
  // Status
  is_active: boolean;
  is_muted: boolean;
  is_video_enabled: boolean;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// GROUP CONVERSATION TYPES
// =====================================================

export type GroupRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface GroupConversation {
  id: string;
  thread_id: string;
  
  // Group details
  group_name: string;
  group_description?: string;
  group_avatar_url?: string;
  
  // Group settings
  is_public: boolean;
  allow_invites: boolean;
  require_approval: boolean;
  max_members: number;
  
  // Encryption
  encryption_enabled: boolean;
  encryption_key_id?: string;
  
  // Metadata
  created_by?: string;
  tags: string[];
  
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  
  // Member details
  role: GroupRole;
  joined_at: string;
  
  // Permissions
  can_invite: boolean;
  can_remove_members: boolean;
  can_edit_group: boolean;
  can_delete_messages: boolean;
  
  // Status
  is_active: boolean;
  is_muted: boolean;
  notification_preferences: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// RETENTION POLICY TYPES
// =====================================================

export interface RetentionPolicy {
  id: string;
  organization_id: string;
  
  // Policy details
  policy_name: string;
  policy_description?: string;
  
  // Retention rules
  message_retention_days: number; // Default: 7 years
  file_retention_days: number; // Default: 5 years
  call_recording_retention_days: number; // Default: 3 years
  
  // Deletion behavior
  auto_delete_enabled: boolean;
  archive_before_delete: boolean;
  notify_before_deletion: boolean;
  deletion_notice_days: number;
  
  // Compliance
  compliance_requirements: string[];
  legal_hold_enabled: boolean;
  
  // Status
  is_active: boolean;
  created_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ArchivedMessage {
  id: string;
  original_message_id?: string;
  
  // Archival details
  archived_at: string;
  archived_by?: string;
  archive_reason: string;
  
  // Original message data (encrypted if needed)
  message_data: Record<string, any>;
  encryption_key_id?: string;
  
  // Metadata
  thread_id?: string;
  conversation_id?: string;
  retention_policy_id?: string;
  
  created_at: string;
}

// =====================================================
// ENHANCED NOTIFICATION TYPES
// =====================================================

export interface EncryptedNotificationPreferences {
  id: string;
  user_id: string;
  
  // Preferences (encrypted)
  encrypted_preferences: string;
  preferences_iv: string;
  
  // Notification types
  message_notifications: boolean;
  call_notifications: boolean;
  file_notifications: boolean;
  group_notifications: boolean;
  
  // Delivery methods
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  
  // Timing preferences
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// SECURITY AUDIT TYPES
// =====================================================

export type EncryptionActionType = 
  | 'key_generated' 
  | 'key_rotated' 
  | 'key_revoked' 
  | 'message_encrypted' 
  | 'message_decrypted' 
  | 'file_encrypted' 
  | 'file_decrypted';

export type EncryptionTargetType = 'message' | 'file' | 'conversation' | 'user' | 'group';

export interface EncryptionAuditLog {
  id: string;
  user_id?: string;
  
  // Action details
  action_type: EncryptionActionType;
  target_type?: EncryptionTargetType;
  target_id?: string;
  
  // Security context
  encryption_algorithm?: KeyAlgorithm;
  key_version?: number;
  success: boolean;
  error_message?: string;
  
  // Metadata
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  
  created_at: string;
}

// =====================================================
// ENCRYPTION SERVICE TYPES
// =====================================================

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  keyId: string;
  algorithm: KeyAlgorithm;
  signature: string;
  contentHash: string;
}

export interface DecryptionResult {
  decryptedData: string;
  isVerified: boolean;
  keyId: string;
  algorithm: KeyAlgorithm;
  signature: string;
  contentHash: string;
}

export interface KeyExchangeRequest {
  userId: string;
  publicKey: string;
  algorithm: KeyAlgorithm;
  expiresAt?: string;
}

export interface KeyExchangeResponse {
  success: boolean;
  conversationKeyId?: string;
  encryptedSymmetricKey?: string;
  error?: string;
}

// =====================================================
// VIDEO CALL SERVICE TYPES
// =====================================================

export interface VideoCallRequest {
  conversationId: string;
  callType: CallType;
  participants: string[];
  isEncrypted: boolean;
}

export interface VideoCallResponse {
  success: boolean;
  callId?: string;
  roomId?: string;
  encryptionKeyId?: string;
  error?: string;
}

export interface VideoCallParticipantUpdate {
  callId: string;
  userId: string;
  isActive: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  deviceInfo?: Record<string, any>;
  networkInfo?: Record<string, any>;
  qualityMetrics?: Record<string, any>;
}

// =====================================================
// GROUP CONVERSATION SERVICE TYPES
// =====================================================

export interface CreateGroupRequest {
  threadId: string;
  groupName: string;
  groupDescription?: string;
  groupAvatarUrl?: string;
  isPublic: boolean;
  allowInvites: boolean;
  requireApproval: boolean;
  maxMembers: number;
  encryptionEnabled: boolean;
  tags?: string[];
}

export interface GroupInviteRequest {
  groupId: string;
  userId: string;
  invitedBy: string;
  role: GroupRole;
  message?: string;
}

export interface GroupMemberUpdate {
  groupId: string;
  userId: string;
  role?: GroupRole;
  permissions?: {
    canInvite?: boolean;
    canRemoveMembers?: boolean;
    canEditGroup?: boolean;
    canDeleteMessages?: boolean;
  };
  isActive?: boolean;
  isMuted?: boolean;
}

// =====================================================
// RETENTION SERVICE TYPES
// =====================================================

export interface RetentionPolicyRequest {
  organizationId: string;
  policyName: string;
  policyDescription?: string;
  messageRetentionDays: number;
  fileRetentionDays: number;
  callRecordingRetentionDays: number;
  autoDeleteEnabled: boolean;
  archiveBeforeDelete: boolean;
  notifyBeforeDeletion: boolean;
  deletionNoticeDays: number;
  complianceRequirements?: string[];
  legalHoldEnabled: boolean;
}

export interface RetentionAction {
  type: 'archive' | 'delete' | 'notify';
  targetId: string;
  targetType: 'message' | 'file' | 'call_recording';
  reason: string;
  scheduledAt: string;
  executedAt?: string;
  success?: boolean;
  error?: string;
}

// =====================================================
// NOTIFICATION SERVICE TYPES
// =====================================================

export interface EncryptedNotificationRequest {
  userId: string;
  type: 'message' | 'call' | 'file' | 'group';
  title: string;
  body: string;
  data: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deliveryMethods: ('email' | 'push' | 'sms' | 'in_app')[];
  encryptionRequired: boolean;
}

export interface NotificationDeliveryResult {
  success: boolean;
  deliveryMethod: string;
  deliveredAt?: string;
  error?: string;
}

// =====================================================
// SECURITY CONTEXT TYPES
// =====================================================

export interface SecurityContext {
  userId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  encryptionLevel: 'none' | 'standard' | 'high' | 'military';
  complianceLevel: 'basic' | 'gdpr' | 'hipaa' | 'sox';
}

export interface ComplianceCheck {
  userId: string;
  action: string;
  dataType: string;
  encryptionRequired: boolean;
  retentionRequired: boolean;
  auditRequired: boolean;
  complianceLevel: string;
  passed: boolean;
  violations: string[];
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface EncryptionStats {
  totalMessages: number;
  encryptedMessages: number;
  encryptionRate: number;
  keyRotationCount: number;
  lastKeyRotation: string;
  securityScore: number;
}

export interface SecurityReport {
  userId: string;
  reportDate: string;
  encryptionStats: EncryptionStats;
  complianceStatus: ComplianceCheck[];
  auditLogs: EncryptionAuditLog[];
  recommendations: string[];
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface EncryptedCommunicationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  encryptionInfo?: {
    algorithm: KeyAlgorithm;
    keyVersion: number;
    isEncrypted: boolean;
    signatureVerified: boolean;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    encryptionLevel: string;
  };
}

export interface PaginatedEncryptedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  encryptionInfo?: {
    algorithm: KeyAlgorithm;
    keyVersion: number;
    isEncrypted: boolean;
  };
}
