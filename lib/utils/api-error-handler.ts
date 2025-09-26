import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  method?: string;
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export class ApiErrorHandler {
  private static logError(error: ApiError) {
    console.error('🚨 API Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
      path: error.path,
      method: error.method,
      userId: error.userId
    });
  }

  static createError(
    code: string,
    message: string,
    details?: any,
    path?: string,
    method?: string,
    userId?: string
  ): ApiError {
    const error: ApiError = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path,
      method,
      userId
    };

    this.logError(error);
    return error;
  }

  static handleDatabaseError(error: any, operation: string, path?: string, method?: string, userId?: string): NextResponse {
    let apiError: ApiError;

    if (error.code === 'PGRST202') {
      apiError = this.createError(
        'FUNCTION_NOT_FOUND',
        `Database function not found: ${error.message}`,
        { originalError: error, operation },
        path,
        method,
        userId
      );
    } else if (error.code === 'PGRST204') {
      apiError = this.createError(
        'COLUMN_NOT_FOUND',
        `Database column not found: ${error.message}`,
        { originalError: error, operation },
        path,
        method,
        userId
      );
    } else if (error.code === 'PGRST200') {
      apiError = this.createError(
        'RELATIONSHIP_NOT_FOUND',
        `Database relationship not found: ${error.message}`,
        { originalError: error, operation },
        path,
        method,
        userId
      );
    } else if (error.code === '23505') {
      apiError = this.createError(
        'DUPLICATE_ENTRY',
        'A record with this information already exists',
        { originalError: error, operation },
        path,
        method,
        userId
      );
    } else if (error.code === '23503') {
      apiError = this.createError(
        'FOREIGN_KEY_VIOLATION',
        'Referenced record does not exist',
        { originalError: error, operation },
        path,
        method,
        userId
      );
    } else {
      apiError = this.createError(
        'DATABASE_ERROR',
        'An unexpected database error occurred',
        { originalError: error, operation },
        path,
        method,
        userId
      );
    }

    return NextResponse.json(
      { success: false, error: apiError },
      { status: 500 }
    );
  }

  static handleValidationError(errors: any[], path?: string, method?: string, userId?: string): NextResponse {
    const apiError = this.createError(
      'VALIDATION_ERROR',
      'Request validation failed',
      { validationErrors: errors },
      path,
      method,
      userId
    );

    return NextResponse.json(
      { success: false, error: apiError },
      { status: 400 }
    );
  }

  static handleAuthenticationError(message: string = 'Authentication required', path?: string, method?: string): NextResponse {
    const apiError = this.createError(
      'UNAUTHENTICATED',
      message,
      undefined,
      path,
      method
    );

    return NextResponse.json(
      { success: false, error: apiError },
      { status: 401 }
    );
  }

  static handleAuthorizationError(message: string = 'Insufficient permissions', path?: string, method?: string, userId?: string): NextResponse {
    const apiError = this.createError(
      'UNAUTHORIZED',
      message,
      undefined,
      path,
      method,
      userId
    );

    return NextResponse.json(
      { success: false, error: apiError },
      { status: 403 }
    );
  }

  static handleNotFoundError(resource: string, path?: string, method?: string, userId?: string): NextResponse {
    const apiError = this.createError(
      'NOT_FOUND',
      `${resource} not found`,
      { resource },
      path,
      method,
      userId
    );

    return NextResponse.json(
      { success: false, error: apiError },
      { status: 404 }
    );
  }

  static handleRateLimitError(path?: string, method?: string, userId?: string): NextResponse {
    const apiError = this.createError(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests, please try again later',
      undefined,
      path,
      method,
      userId
    );

    return NextResponse.json(
      { success: false, error: apiError },
      { status: 429 }
    );
  }

  static handleGenericError(error: any, path?: string, method?: string, userId?: string): NextResponse {
    const apiError = this.createError(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      { originalError: error },
      path,
      method,
      userId
    );

    return NextResponse.json(
      { success: false, error: apiError },
      { status: 500 }
    );
  }

  static createSuccessResponse<T>(data: T, message?: string): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  }
}

// Convenience functions for common error patterns
export const handleSupabaseError = (error: any, operation: string, path?: string, method?: string, userId?: string) => {
  return ApiErrorHandler.handleDatabaseError(error, operation, path, method, userId);
};

export const handleValidationError = (errors: any[], path?: string, method?: string, userId?: string) => {
  return ApiErrorHandler.handleValidationError(errors, path, method, userId);
};

export const createSuccessResponse = <T>(data: T, message?: string) => {
  return ApiErrorHandler.createSuccessResponse(data, message);
}; 