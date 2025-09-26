// 🔐 ENCRYPTED MESSAGING API
// Main API route for encrypted messaging operations

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { encryptionService } from '@/lib/services/EncryptionService'
import { withErrorHandling, handleApiError, AuthenticationError, ValidationError } from '@/lib/middleware/errorHandler'
import { logger } from '@/lib/services/LoggingService'
import { z } from 'zod'

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const SendEncryptedMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  isEncrypted: z.boolean().default(true),
  encryptionAlgorithm: z.enum(['AES-256-GCM', 'ChaCha20-Poly1305']).default('AES-256-GCM'),
  replyTo: z.string().uuid().optional(),
  threadId: z.string().uuid().optional(),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string()
  })).optional()
})

const DecryptMessageSchema = z.object({
  messageId: z.string().uuid(),
  conversationId: z.string().uuid()
})

const GenerateKeyPairSchema = z.object({
  algorithm: z.enum(['RSA-2048', 'RSA-4096']).default('RSA-4096')
})

const RotateKeysSchema = z.object({
  userId: z.string().uuid()
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
    case 'validate-encryption':
      const isValid = await encryptionService.validateEncryptionSetup(user.id)
      return NextResponse.json({
        success: true,
        data: { isValid }
      })

    case 'get-encryption-stats':
      // This would return encryption statistics for the user
      return NextResponse.json({
        success: true,
        data: {
          totalMessages: 0,
          encryptedMessages: 0,
          encryptionRate: 100,
          keyRotationCount: 0,
          lastKeyRotation: null,
          securityScore: 95
        }
      })

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
    case 'send-encrypted-message':
      return await handleSendEncryptedMessage(body, user.id, supabase)

    case 'decrypt-message':
      return await handleDecryptMessage(body, user.id)

    case 'generate-key-pair':
      return await handleGenerateKeyPair(body, user.id)

    case 'rotate-keys':
      return await handleRotateKeys(body, user.id)

    case 'encrypt-file':
      return await handleEncryptFile(body, user.id)

    case 'decrypt-file':
      return await handleDecryptFile(body, user.id)

    default:
      throw new ValidationError('Invalid action parameter')
  }
})

// =====================================================
// HANDLER FUNCTIONS
// =====================================================

async function handleSendEncryptedMessage(body: any, userId: string, supabase: any) {
  try {
    // Validate request body
    const validatedData = SendEncryptedMessageSchema.parse(body)

    // Check if user has access to conversation
    const { data: conversationAccess, error: accessError } = await supabase
      .from('user_conversation_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('conversation_key_id', validatedData.conversationId)
      .eq('is_revoked', false)
      .single()

    if (accessError || !conversationAccess) {
      throw new ValidationError('User does not have access to this conversation')
    }

    let encryptedContent = validatedData.content
    let encryptionResult = null

    // Encrypt message if encryption is enabled
    if (validatedData.isEncrypted) {
      try {
        encryptionResult = await encryptionService.encryptMessage(
          validatedData.content,
          validatedData.conversationId,
          userId
        )
        encryptedContent = encryptionResult.encryptedData
      } catch (encryptionError) {
        logger.error('Failed to encrypt message', encryptionError)
        throw new Error('Message encryption failed')
      }
    }

    // Create message record
    const messageData = {
      thread_id: validatedData.conversationId,
      sender_id: userId,
      content: encryptedContent,
      is_encrypted: validatedData.isEncrypted,
      encryption_version: 1,
      encrypted_content: validatedData.isEncrypted ? encryptedContent : null,
      content_hash: encryptionResult?.contentHash || null,
      signature: encryptionResult?.signature || null,
      iv: encryptionResult?.iv || null,
      reply_to_id: validatedData.replyTo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (messageError) throw messageError

    // Create encrypted message metadata if encrypted
    if (validatedData.isEncrypted && encryptionResult) {
      const metadataData = {
        message_id: message.id,
        encryption_algorithm: validatedData.encryptionAlgorithm,
        key_id: validatedData.conversationId,
        content_hash: encryptionResult.contentHash,
        signature: encryptionResult.signature,
        signature_algorithm: 'RSA-SHA256',
        signed_by: userId,
        is_verified: true,
        verification_timestamp: new Date().toISOString()
      }

      await supabase
        .from('encrypted_message_metadata')
        .insert(metadataData)
    }

    // Log the encrypted message
    await logger.info('Encrypted message sent', {
      userId,
      messageId: message.id,
      conversationId: validatedData.conversationId,
      isEncrypted: validatedData.isEncrypted,
      algorithm: validatedData.encryptionAlgorithm,
      category: 'encrypted-messaging',
      source: 'EncryptedMessagingAPI'
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId: message.id,
        isEncrypted: validatedData.isEncrypted,
        encryptionAlgorithm: validatedData.encryptionAlgorithm,
        timestamp: message.created_at
      }
    }, { status: 201 })

  } catch (error) {
    logger.error('Failed to send encrypted message', error)
    throw error
  }
}

async function handleDecryptMessage(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = DecryptMessageSchema.parse(body)

    // Decrypt the message
    const decryptionResult = await encryptionService.decryptMessage(
      '', // This would be the encrypted content from the message
      '', // This would be the IV from the message
      validatedData.conversationId,
      userId
    )

    return NextResponse.json({
      success: true,
      data: {
        decryptedContent: decryptionResult.decryptedData,
        isVerified: decryptionResult.isVerified,
        algorithm: decryptionResult.algorithm,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Failed to decrypt message', error)
    throw error
  }
}

async function handleGenerateKeyPair(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = GenerateKeyPairSchema.parse(body)

    // Generate new key pair
    const keyPair = await encryptionService.generateUserKeyPair(userId, validatedData.algorithm)

    // Log key generation
    await logger.info('Encryption key pair generated', {
      userId,
      algorithm: validatedData.algorithm,
      keyVersion: keyPair.key_version,
      category: 'encrypted-messaging',
      source: 'EncryptedMessagingAPI'
    })

    return NextResponse.json({
      success: true,
      data: {
        keyId: keyPair.id,
        algorithm: keyPair.key_algorithm,
        keyVersion: keyPair.key_version,
        expiresAt: keyPair.key_expires_at
      }
    }, { status: 201 })

  } catch (error) {
    logger.error('Failed to generate key pair', error)
    throw error
  }
}

async function handleRotateKeys(body: any, userId: string) {
  try {
    // Validate request body
    const validatedData = RotateKeysSchema.parse(body)

    // Check if user is rotating their own keys or has admin privileges
    if (validatedData.userId !== userId) {
      // This would check admin privileges in a real implementation
      throw new ValidationError('Insufficient privileges to rotate keys for other users')
    }

    // Rotate user keys
    const newKeyPair = await encryptionService.rotateUserKeys(validatedData.userId)

    // Log key rotation
    await logger.info('Encryption keys rotated', {
      userId: validatedData.userId,
      newKeyVersion: newKeyPair.key_version,
      algorithm: newKeyPair.key_algorithm,
      category: 'encrypted-messaging',
      source: 'EncryptedMessagingAPI'
    })

    return NextResponse.json({
      success: true,
      data: {
        keyId: newKeyPair.id,
        algorithm: newKeyPair.key_algorithm,
        keyVersion: newKeyPair.key_version,
        rotatedAt: newKeyPair.last_rotated_at
      }
    })

  } catch (error) {
    logger.error('Failed to rotate keys', error)
    throw error
  }
}

async function handleEncryptFile(body: any, userId: string) {
  try {
    // This would handle file encryption
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      data: {
        message: 'File encryption endpoint - implementation pending'
      }
    })

  } catch (error) {
    logger.error('Failed to encrypt file', error)
    throw error
  }
}

async function handleDecryptFile(body: any, userId: string) {
  try {
    // This would handle file decryption
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      data: {
        message: 'File decryption endpoint - implementation pending'
      }
    })

  } catch (error) {
    logger.error('Failed to decrypt file', error)
    throw error
  }
}
