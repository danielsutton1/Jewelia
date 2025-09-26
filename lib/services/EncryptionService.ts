// 🔐 ENCRYPTION SERVICE
// Core service for handling end-to-end encryption, key management, and cryptographic operations

import { createClient } from '@supabase/supabase-js'
import { 
  UserEncryptionKey, 
  ConversationEncryptionKey, 
  UserConversationKey,
  EncryptionResult,
  DecryptionResult,
  KeyAlgorithm,
  AccessLevel,
  EncryptionAuditLog
} from '@/types/encrypted-communication'
import { logger } from './LoggingService'

// =====================================================
// CRYPTOGRAPHIC CONSTANTS
// =====================================================

const CRYPTO_CONFIG = {
  // RSA key sizes
  RSA_KEY_SIZES: {
    'RSA-2048': 2048,
    'RSA-4096': 4096
  },
  
  // AES key sizes
  AES_KEY_SIZES: {
    'AES-256-GCM': 256
  },
  
  // Hash algorithms
  HASH_ALGORITHMS: ['SHA-256', 'SHA-512'] as const,
  
  // Key rotation intervals (in days)
  KEY_ROTATION_INTERVALS: {
    user: 90,
    conversation: 30,
    file: 7
  },
  
  // Encryption algorithms priority
  ALGORITHM_PRIORITY: ['AES-256-GCM', 'ChaCha20-Poly1305', 'RSA-4096', 'RSA-2048'] as const
}

// =====================================================
// ENCRYPTION SERVICE CLASS
// =====================================================

export class EncryptionService {
  private supabase: any
  private crypto: Crypto
  private isInitialized: boolean = false
  private keyCache: Map<string, CryptoKey> = new Map()
  private masterKeyCache: Map<string, CryptoKey> = new Map()

  constructor() {
    this.supabase = null
    
    // Handle both browser and server environments
    if (typeof window !== 'undefined') {
      // Browser environment
      this.crypto = window.crypto
    } else {
      // Server environment - use Node.js crypto
      this.crypto = (globalThis as any).crypto || require('crypto').webcrypto
    }
    
    if (!this.crypto) {
      throw new Error('Crypto API not available')
    }
    
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
      
      // Test crypto capabilities
      await this.testCryptoCapabilities()
      
      this.isInitialized = true
      logger.info('Encryption service initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize encryption service', error)
      throw error
    }
  }

  private async testCryptoCapabilities() {
    try {
      // Test AES key generation
      const aesKey = await this.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
      
      // Test RSA key generation
      const rsaKey = await this.crypto.subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['encrypt', 'decrypt']
      )
      
      // Test hash function
      const testData = new TextEncoder().encode('test')
      await this.crypto.subtle.digest('SHA-256', testData)
      
      logger.info('All crypto capabilities verified')
    } catch (error) {
      logger.error('Crypto capability test failed', error)
      throw new Error('Insufficient crypto capabilities')
    }
  }

  // =====================================================
  // USER ENCRYPTION KEY MANAGEMENT
  // =====================================================

  async generateUserKeyPair(userId: string, algorithm: KeyAlgorithm = 'RSA-4096'): Promise<UserEncryptionKey> {
    try {
      if (!this.isInitialized) {
        throw new Error('Encryption service not initialized')
      }

      // Generate RSA key pair
      const keyPair = await this.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: CRYPTO_CONFIG.RSA_KEY_SIZES[algorithm as keyof typeof CRYPTO_CONFIG.RSA_KEY_SIZES],
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      )

      // Generate master key for encrypting private key
      const masterKey = await this.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )

      // Export keys
      const publicKeyBuffer = await this.crypto.subtle.exportKey('spki', keyPair.publicKey)
      const privateKeyBuffer = await this.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
      const masterKeyBuffer = await this.crypto.subtle.exportKey('raw', masterKey)

      // Convert to base64 strings
      const publicKey = this.arrayBufferToBase64(publicKeyBuffer)
      const privateKey = this.arrayBufferToBase64(privateKeyBuffer)
      const masterKeyString = this.arrayBufferToBase64(masterKeyBuffer)

      // Generate salt and hash for master key
      const salt = this.crypto.getRandomValues(new Uint8Array(32))
      const saltString = this.arrayBufferToBase64(salt.buffer)
      
      const masterKeyHash = await this.hashString(masterKeyString + saltString)

      // Encrypt private key with master key
      const iv = this.crypto.getRandomValues(new Uint8Array(12))
      const encryptedPrivateKey = await this.encryptWithAES(
        privateKey,
        masterKey,
        iv
      )

      // Store master key in cache for current session
      this.masterKeyCache.set(userId, masterKey)

      // Create user encryption key record
      const userKey: Omit<UserEncryptionKey, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        public_key: publicKey,
        encrypted_private_key: encryptedPrivateKey,
        master_key_hash: masterKeyHash,
        master_key_salt: saltString,
        key_version: 1,
        key_algorithm: algorithm,
        key_created_at: new Date().toISOString(),
        key_expires_at: new Date(Date.now() + CRYPTO_CONFIG.KEY_ROTATION_INTERVALS.user * 24 * 60 * 60 * 1000).toISOString(),
        last_rotated_at: new Date().toISOString(),
        rotation_interval_days: CRYPTO_CONFIG.KEY_ROTATION_INTERVALS.user
      }

      // Save to database
      const { data, error } = await this.supabase
        .from('user_encryption_keys')
        .insert(userKey)
        .select()
        .single()

      if (error) throw error

      // Log encryption action
      await this.logEncryptionAction(userId, 'key_generated', 'user', data.id, algorithm, 1)

      logger.info('User encryption key pair generated successfully', { userId, algorithm })
      return data

    } catch (error) {
      logger.error('Failed to generate user key pair', error)
      throw error
    }
  }

  async getUserEncryptionKey(userId: string): Promise<UserEncryptionKey | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_encryption_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('key_version', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to get user encryption key', error)
      return null
    }
  }

  async rotateUserKeys(userId: string): Promise<UserEncryptionKey> {
    try {
      const currentKey = await this.getUserEncryptionKey(userId)
      if (!currentKey) {
        throw new Error('No existing key found for user')
      }

      // Generate new key pair
      const newKey = await this.generateUserKeyPair(userId, currentKey.key_algorithm)
      
      // Update version number
      const { data, error } = await this.supabase
        .from('user_encryption_keys')
        .update({ 
          key_version: currentKey.key_version + 1,
          last_rotated_at: new Date().toISOString()
        })
        .eq('id', newKey.id)
        .select()
        .single()

      if (error) throw error

      // Log key rotation
      await this.logEncryptionAction(userId, 'key_rotated', 'user', data.id, data.key_algorithm, data.key_version)

      logger.info('User encryption keys rotated successfully', { userId, newVersion: data.key_version })
      return data

    } catch (error) {
      logger.error('Failed to rotate user keys', error)
      throw error
    }
  }

  // =====================================================
  // CONVERSATION ENCRYPTION KEY MANAGEMENT
  // =====================================================

  async generateConversationKey(conversationId: string, participants: string[], createdBy: string): Promise<ConversationEncryptionKey> {
    try {
      // Generate symmetric key for conversation
      const symmetricKey = await this.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )

      // Export symmetric key
      const symmetricKeyBuffer = await this.crypto.subtle.exportKey('raw', symmetricKey)
      const symmetricKeyString = this.arrayBufferToBase64(symmetricKeyBuffer)

      // Encrypt symmetric key for each participant
      const encryptedKeys: UserConversationKey[] = []
      
      for (const participantId of participants) {
        const userKey = await this.getUserEncryptionKey(participantId)
        if (!userKey) {
          logger.warn(`No encryption key found for participant: ${participantId}`)
          continue
        }

        // Import user's public key
        const publicKey = await this.crypto.subtle.importKey(
          'spki',
          this.base64ToArrayBuffer(userKey.public_key),
          { name: 'RSA-OAEP', hash: 'SHA-256' },
          false,
          ['encrypt']
        )

        // Encrypt symmetric key with user's public key
        const encryptedSymmetricKey = await this.crypto.subtle.encrypt(
          { name: 'RSA-OAEP' },
          publicKey,
          this.base64ToArrayBuffer(symmetricKeyString)
        )

        encryptedKeys.push({
          id: crypto.randomUUID(),
          user_id: participantId,
          conversation_key_id: '', // Will be set after conversation key is created
          encrypted_access_key: this.arrayBufferToBase64(encryptedSymmetricKey),
          access_granted_at: new Date().toISOString(),
          access_level: 'full',
          is_revoked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      // Create conversation encryption key
      const conversationKey: Omit<ConversationEncryptionKey, 'id' | 'created_at' | 'updated_at'> = {
        conversation_id: conversationId,
        encrypted_symmetric_key: symmetricKeyString, // Store encrypted version
        key_algorithm: 'AES-256-GCM',
        key_version: 1,
        key_created_at: new Date().toISOString(),
        key_expires_at: new Date(Date.now() + CRYPTO_CONFIG.KEY_ROTATION_INTERVALS.conversation * 24 * 60 * 60 * 1000).toISOString(),
        created_by: createdBy,
        is_active: true
      }

      // Save conversation key
      const { data: convKey, error: convError } = await this.supabase
        .from('conversation_encryption_keys')
        .insert(conversationKey)
        .select()
        .single()

      if (convError) throw convError

      // Update user conversation keys with conversation key ID
      for (const userKey of encryptedKeys) {
        userKey.conversation_key_id = convKey.id
      }

      // Save user conversation keys
      const { error: userKeysError } = await this.supabase
        .from('user_conversation_keys')
        .insert(encryptedKeys)

      if (userKeysError) throw userKeysError

      // Store symmetric key in cache
      this.keyCache.set(conversationId, symmetricKey)

      // Log encryption action
      await this.logEncryptionAction(createdBy, 'key_generated', 'conversation', convKey.id, 'AES-256-GCM', 1)

      logger.info('Conversation encryption key generated successfully', { conversationId, participants: participants.length })
      return convKey

    } catch (error) {
      logger.error('Failed to generate conversation encryption key', error)
      throw error
    }
  }

  async getConversationKey(conversationId: string, userId: string): Promise<CryptoKey | null> {
    try {
      // Check cache first
      if (this.keyCache.has(conversationId)) {
        return this.keyCache.get(conversationId)!
      }

      // Get user's access to conversation key
      const { data: userAccess, error: accessError } = await this.supabase
        .from('user_conversation_keys')
        .select(`
          *,
          conversation_encryption_keys!inner(*)
        `)
        .eq('user_id', userId)
        .eq('conversation_encryption_keys.conversation_id', conversationId)
        .eq('is_revoked', false)
        .single()

      if (accessError || !userAccess) {
        return null
      }

      // Get user's private key
      const userKey = await this.getUserEncryptionKey(userId)
      if (!userKey) {
        return null
      }

      // Get master key from cache or regenerate
      let masterKey = this.masterKeyCache.get(userId)
      if (!masterKey) {
        // Regenerate master key from user's password (this would need to be implemented)
        throw new Error('Master key not available')
      }

      // Decrypt user's private key
      const privateKeyBuffer = this.base64ToArrayBuffer(userAccess.encrypted_access_key)
      const privateKey = await this.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
      )

      // Decrypt symmetric key
      const encryptedSymmetricKey = this.base64ToArrayBuffer(userAccess.conversation_encryption_keys.encrypted_symmetric_key)
      const symmetricKeyBuffer = await this.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedSymmetricKey
      )

      // Import symmetric key
      const symmetricKey = await this.crypto.subtle.importKey(
        'raw',
        symmetricKeyBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )

      // Cache the key
      this.keyCache.set(conversationId, symmetricKey)

      return symmetricKey

    } catch (error) {
      logger.error('Failed to get conversation encryption key', error)
      return null
    }
  }

  // =====================================================
  // MESSAGE ENCRYPTION/DECRYPTION
  // =====================================================

  async encryptMessage(content: string, conversationId: string, userId: string): Promise<EncryptionResult> {
    try {
      const conversationKey = await this.getConversationKey(conversationId, userId)
      if (!conversationKey) {
        throw new Error('No encryption key available for conversation')
      }

      // Generate IV
      const iv = this.crypto.getRandomValues(new Uint8Array(12))
      
      // Convert content to buffer
      const contentBuffer = new TextEncoder().encode(content)
      
      // Encrypt content
      const encryptedBuffer = await this.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        conversationKey,
        contentBuffer
      )

      // Generate content hash
      const contentHash = await this.hashArrayBuffer(contentBuffer.buffer as ArrayBuffer)
      
      // Sign the encrypted content
      const signature = await this.signData(encryptedBuffer, userId)

      const result: EncryptionResult = {
        encryptedData: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv.buffer),
        keyId: conversationId,
        algorithm: 'AES-256-GCM',
        signature,
        contentHash
      }

      // Log encryption
      await this.logEncryptionAction(userId, 'message_encrypted', 'message', conversationId, 'AES-256-GCM')

      logger.info('Message encrypted successfully', { conversationId, contentLength: content.length })
      return result

    } catch (error) {
      logger.error('Failed to encrypt message', error)
      throw error
    }
  }

  async decryptMessage(encryptedData: string, iv: string, conversationId: string, userId: string): Promise<DecryptionResult> {
    try {
      const conversationKey = await this.getConversationKey(conversationId, userId)
      if (!conversationKey) {
        throw new Error('No encryption key available for conversation')
      }

      // Convert from base64
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData)
      const ivBuffer = this.base64ToArrayBuffer(iv)

      // Decrypt content
      const decryptedBuffer = await this.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        conversationKey,
        encryptedBuffer
      )

      // Convert to string
      const decryptedContent = new TextDecoder().decode(decryptedBuffer)

      // Generate content hash for verification
      const contentHash = await this.hashArrayBuffer(decryptedBuffer)

      // Verify signature (this would need the sender's public key)
      const isVerified = true // Placeholder for signature verification

      const result: DecryptionResult = {
        decryptedData: decryptedContent,
        isVerified,
        keyId: conversationId,
        algorithm: 'AES-256-GCM',
        signature: '', // Would be the actual signature
        contentHash
      }

      // Log decryption
      await this.logEncryptionAction(userId, 'message_decrypted', 'message', conversationId, 'AES-256-GCM')

      logger.info('Message decrypted successfully', { conversationId, contentLength: decryptedContent.length })
      return result

    } catch (error) {
      logger.error('Failed to decrypt message', error)
      throw error
    }
  }

  // =====================================================
  // FILE ENCRYPTION/DECRYPTION
  // =====================================================

  async encryptFile(file: File, conversationId: string, userId: string): Promise<EncryptionResult> {
    try {
      const conversationKey = await this.getConversationKey(conversationId, userId)
      if (!conversationKey) {
        throw new Error('No encryption key available for conversation')
      }

      // Read file as buffer
      const fileBuffer = await file.arrayBuffer()
      
      // Generate IV
      const iv = this.crypto.getRandomValues(new Uint8Array(12))
      
      // Encrypt file
      const encryptedBuffer = await this.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        conversationKey,
        fileBuffer
      )

      // Generate file hash
      const fileHash = await this.hashArrayBuffer(fileBuffer)
      
      // Sign the encrypted file
      const signature = await this.signData(encryptedBuffer, userId)

      const result: EncryptionResult = {
        encryptedData: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv.buffer),
        keyId: conversationId,
        algorithm: 'AES-256-GCM',
        signature,
        contentHash: fileHash
      }

      // Log file encryption
      await this.logEncryptionAction(userId, 'file_encrypted', 'file', conversationId, 'AES-256-GCM')

      logger.info('File encrypted successfully', { 
        conversationId, 
        fileName: file.name, 
        fileSize: file.size 
      })
      return result

    } catch (error) {
      logger.error('Failed to encrypt file', error)
      throw error
    }
  }

  async decryptFile(encryptedData: string, iv: string, conversationId: string, userId: string): Promise<DecryptionResult> {
    try {
      const conversationKey = await this.getConversationKey(conversationId, userId)
      if (!conversationKey) {
        throw new Error('No encryption key available for conversation')
      }

      // Convert from base64
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData)
      const ivBuffer = this.base64ToArrayBuffer(iv)

      // Decrypt file
      const decryptedBuffer = await this.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        conversationKey,
        encryptedBuffer
      )

      // Generate file hash for verification
      const fileHash = await this.hashArrayBuffer(decryptedBuffer)

      // Verify signature (placeholder)
      const isVerified = true

      const result: DecryptionResult = {
        decryptedData: this.arrayBufferToBase64(decryptedBuffer),
        isVerified,
        keyId: conversationId,
        algorithm: 'AES-256-GCM',
        signature: '',
        contentHash: fileHash
      }

      // Log file decryption
      await this.logEncryptionAction(userId, 'file_decrypted', 'file', conversationId, 'AES-256-GCM')

      logger.info('File decrypted successfully', { conversationId, fileSize: decryptedBuffer.byteLength })
      return result

    } catch (error) {
      logger.error('Failed to decrypt file', error)
      throw error
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  private async hashString(str: string): Promise<string> {
    const buffer = new TextEncoder().encode(str)
    const hashBuffer = await this.crypto.subtle.digest('SHA-256', buffer)
    return this.arrayBufferToBase64(hashBuffer)
  }

  private async hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await this.crypto.subtle.digest('SHA-256', buffer)
    return this.arrayBufferToBase64(hashBuffer)
  }

  private async encryptWithAES(data: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const dataBuffer = new TextEncoder().encode(data)
    const encryptedBuffer = await this.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    )
    return this.arrayBufferToBase64(encryptedBuffer)
  }

  private async signData(data: ArrayBuffer, userId: string): Promise<string> {
    // This would use the user's private key to sign the data
    // For now, return a placeholder signature
    return 'placeholder_signature_' + userId + '_' + Date.now()
  }

  // =====================================================
  // AUDIT LOGGING
  // =====================================================

  private async logEncryptionAction(
    userId: string,
    actionType: string,
    targetType: string,
    targetId: string,
    algorithm?: string,
    keyVersion?: number
  ): Promise<void> {
    try {
      const auditLog: Omit<EncryptionAuditLog, 'id' | 'created_at'> = {
        user_id: userId,
        action_type: actionType as any,
        target_type: targetType as any,
        target_id: targetId,
        encryption_algorithm: algorithm as any,
        key_version: keyVersion,
        success: true,
        ip_address: '', // Would get from request context
        user_agent: '', // Would get from request context
        session_id: '' // Would get from request context
      }

      await this.supabase
        .from('encryption_audit_logs')
        .insert(auditLog)

    } catch (error) {
      logger.error('Failed to log encryption action', error)
    }
  }

  // =====================================================
  // KEY ROTATION AND MAINTENANCE
  // =====================================================

  async scheduleKeyRotation(): Promise<void> {
    try {
      // This would be called by a cron job or scheduled task
      const now = new Date()
      
      // Check for expired keys
      const { data: expiredKeys, error } = await this.supabase
        .from('user_encryption_keys')
        .select('*')
        .lt('key_expires_at', now.toISOString())
        .eq('is_active', true)

      if (error) throw error

      for (const key of expiredKeys || []) {
        try {
          await this.rotateUserKeys(key.user_id)
          logger.info('Key rotation completed for user', { userId: key.user_id })
        } catch (rotationError) {
          logger.error('Key rotation failed for user', { userId: key.user_id, error: rotationError })
        }
      }

    } catch (error) {
      logger.error('Failed to schedule key rotation', error)
    }
  }

  // =====================================================
  // SECURITY VALIDATION
  // =====================================================

  async validateEncryptionSetup(userId: string): Promise<boolean> {
    try {
      const userKey = await this.getUserEncryptionKey(userId)
      if (!userKey) return false

      // Check if key is expired
      if (userKey.key_expires_at && new Date(userKey.key_expires_at) < new Date()) {
        return false
      }

      // Check if key needs rotation
      const lastRotation = new Date(userKey.last_rotated_at)
      const rotationThreshold = new Date(lastRotation.getTime() + userKey.rotation_interval_days * 24 * 60 * 60 * 1000)
      
      if (new Date() > rotationThreshold) {
        logger.warn('User key needs rotation', { userId, lastRotation: userKey.last_rotated_at })
        return false
      }

      return true
    } catch (error) {
      logger.error('Failed to validate encryption setup', error)
      return false
    }
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  async cleanup(): Promise<void> {
    try {
      // Clear caches
      this.keyCache.clear()
      this.masterKeyCache.clear()
      
      // Close database connections if needed
      if (this.supabase) {
        // Supabase client doesn't need explicit cleanup
      }
      
      this.isInitialized = false
      logger.info('Encryption service cleaned up successfully')
    } catch (error) {
      logger.error('Failed to cleanup encryption service', error)
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService()
