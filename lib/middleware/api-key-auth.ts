import { NextRequest, NextResponse } from 'next/server'
import { apiKeyService } from '@/lib/services/ApiKeyService'

export async function validateApiKey(request: NextRequest): Promise<{
  valid: boolean
  apiKey?: any
  permissions?: string[]
  error?: string
}> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        valid: false,
        error: 'Missing or invalid authorization header'
      }
    }

    const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
    const validation = await apiKeyService.validateApiKey(apiKey)

    if (!validation.valid) {
      return {
        valid: false,
        error: 'Invalid or expired API key'
      }
    }

    return {
      valid: true,
      apiKey: validation.apiKey,
      permissions: validation.permissions
    }
  } catch (error) {
    console.error('Error validating API key:', error)
    return {
      valid: false,
      error: 'Failed to validate API key'
    }
  }
}

export function requirePermission(requiredPermission: string) {
  return async (request: NextRequest): Promise<{
    valid: boolean
    apiKey?: any
    permissions?: string[]
    error?: string
  }> => {
    const validation = await validateApiKey(request)
    
    if (!validation.valid) {
      return validation
    }

    if (!validation.permissions || !apiKeyService.hasPermission(validation.permissions, requiredPermission)) {
      return {
        valid: false,
        error: `Insufficient permissions. Required: ${requiredPermission}`
      }
    }

    return validation
  }
}

export function createApiKeyMiddleware(requiredPermission?: string) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const validator = requiredPermission 
      ? requirePermission(requiredPermission)
      : validateApiKey

    const validation = await validator(request)

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          details: validation.error
        },
        { status: 401 }
      )
    }

    // Add API key info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-api-key-id', validation.apiKey?.id || '')
    requestHeaders.set('x-api-key-permissions', JSON.stringify(validation.permissions || []))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
} 