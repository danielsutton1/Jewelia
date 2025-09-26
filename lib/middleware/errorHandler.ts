// 🔧 CLEAN ERROR HANDLER - NO DUPLICATES
// This fixes the "Duplicate export" error

import { NextRequest, NextResponse } from 'next/server'

// =====================================================
// ERROR TYPES
// =====================================================

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExternalServiceError'
  }
}

// =====================================================
// ERROR HANDLER
// =====================================================

export function handleApiError(error: any, request?: NextRequest): NextResponse {
  console.error('API Error:', error)

  // Default error response
  let statusCode = 500
  let errorCode = 'UNKNOWN_ERROR'
  let message = 'An unexpected error occurred'
  let details: any = {}

  // Handle specific error types
  if (error instanceof AuthenticationError) {
    statusCode = 401
    errorCode = 'AUTHENTICATION_ERROR'
    message = error.message
  } else if (error instanceof ValidationError) {
    statusCode = 400
    errorCode = 'VALIDATION_ERROR'
    message = error.message
  } else if (error instanceof AuthorizationError) {
    statusCode = 403
    errorCode = 'AUTHORIZATION_ERROR'
    message = error.message
  } else if (error instanceof NotFoundError) {
    statusCode = 404
    errorCode = 'NOT_FOUND_ERROR'
    message = error.message
  } else if (error instanceof DatabaseError) {
    statusCode = 500
    errorCode = 'DATABASE_ERROR'
    message = error.message
  } else if (error instanceof ExternalServiceError) {
    statusCode = 502
    errorCode = 'EXTERNAL_SERVICE_ERROR'
    message = error.message
  } else {
    // Handle generic errors
    if (error.message) {
      message = error.message
    }
    if (error.code) {
      errorCode = error.code
    }
    if (error.statusCode) {
      statusCode = error.statusCode
    }
  }

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode,
      details: {
        originalError: error.message || 'Unknown error',
        ...details
      },
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  }

  // Log error details
  console.error('Error Response:', {
    statusCode,
    errorCode,
    message,
    timestamp: errorResponse.timestamp,
    requestId: errorResponse.requestId,
    url: request?.url || 'Unknown URL',
    method: request?.method || 'Unknown Method'
  })

  return NextResponse.json(errorResponse, { status: statusCode })
}

// =====================================================
// MIDDLEWARE WRAPPER
// =====================================================

export function withErrorHandling(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error, request)
    }
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
