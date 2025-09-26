import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';
import { ApiErrorHandler } from '../utils/api-error-handler';

export interface ApiContext {
  userId?: string;
  sessionId?: string;
  requestId: string;
  startTime: number;
}

export function withApiMonitoring(handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const path = request.nextUrl.pathname;
    const method = request.method;

    // Extract user information from request headers or cookies
    const userId = request.headers.get('x-user-id') || 
                   request.cookies.get('user-id')?.value ||
                   undefined;

    const sessionId = request.headers.get('x-session-id') || 
                      request.cookies.get('session-id')?.value ||
                      undefined;

    const context: ApiContext = {
      userId,
      sessionId,
      requestId,
      startTime
    };

    // Log API request
    logger.info(`API Request: ${method} ${path}`, {
      method,
      path,
      userId,
      sessionId,
      requestId
    });

    try {
      // Execute the handler
      const response = await handler(request, context);

      // Calculate request/response sizes
      const requestSize = request.headers.get('content-length') ? 
        parseInt(request.headers.get('content-length')!) : 0;
      
      const responseSize = response.headers.get('content-length') ? 
        parseInt(response.headers.get('content-length')!) : 0;

      // Log API response
      const duration = Date.now() - startTime;
      logger.info(`API Response: ${method} ${path} - ${response.status}`, {
        method,
        path,
        statusCode: response.status,
        duration,
        userId,
        sessionId,
        requestId,
        requestSize,
        responseSize
      });

      // Add monitoring headers
      response.headers.set('x-request-id', requestId);
      response.headers.set('x-response-time', `${duration}ms`);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error
      logger.error(`API Error: ${method} ${path}`, error as Error, {
        userId,
        sessionId,
        requestId,
        path,
        method,
        duration
      });

      // Return standardized error response
      return ApiErrorHandler.handleGenericError(error, path, method, userId);
    }
  };
}

// Database operation wrapper with monitoring
export function withDatabaseMonitoring<T>(
  operation: () => Promise<T>,
  table: string,
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  userId?: string
): Promise<T> {
  const startTime = Date.now();
  
  return operation()
    .then((result) => {
      const duration = Date.now() - startTime;
      logger.info(`Database: ${operation.name || 'database_operation'} on ${table}`, {
        operation: operation.name || 'database_operation',
        table,
        duration,
        userId,
        rowCount: Array.isArray(result) ? result.length : 1
      });
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      logger.error(`Database Error: ${operation.name || 'database_operation'} on ${table}`, error, {
        table,
        queryType,
        userId,
        duration
      });
      throw error;
    });
}

// Supabase query wrapper with monitoring
export function withSupabaseMonitoring<T>(
  query: any,
  table: string,
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  userId?: string
): Promise<{ data: T | null; error: any; count?: number }> {
  const startTime = Date.now();
  
  return query
    .then((result: any) => {
      const duration = Date.now() - startTime;
      
      if (result.error) {
        logger.error(`Supabase Error: ${queryType} on ${table}`, new Error(result.error.message), {
          table,
          queryType,
          userId,
          duration,
          error: result.error
        });
      } else {
        logger.info(`Database: ${queryType} on ${table}`, {
          operation: queryType,
          table,
          duration,
          userId,
          rowCount: Array.isArray(result.data) ? result.data.length : 1
        });
      }
      
      return result;
    });
}

// Rate limiting middleware
export function withRateLimiting(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: NextRequest) => string;
  }
) {
  const { windowMs, maxRequests, keyGenerator } = options;
  const requests = new Map<string, { count: number; resetTime: number }>();

  return withApiMonitoring(async (request: NextRequest, context: ApiContext) => {
    const key = keyGenerator ? keyGenerator(request) : context.userId || 'anonymous';
    const now = Date.now();
    
    const userRequests = requests.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
    } else if (userRequests.count >= maxRequests) {
      logger.warn(`Rate limit exceeded`, {
        key,
        count: userRequests.count,
        maxRequests,
        windowMs,
        userId: context.userId
      });
      
      return ApiErrorHandler.handleRateLimitError(request.nextUrl.pathname, request.method, context.userId);
    } else {
      userRequests.count++;
    }

    return handler(request, context);
  });
}

// Authentication middleware
export function withAuthentication(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>
) {
  return withApiMonitoring(async (request: NextRequest, context: ApiContext) => {
    // Check for authentication token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      logger.warn(`Missing authentication token`, {
        path: request.nextUrl.pathname,
        method: request.method,
        userId: context.userId
      });
      
      return ApiErrorHandler.handleAuthenticationError(
        'Authentication token required',
        request.nextUrl.pathname,
        request.method
      );
    }

    // Here you would validate the token
    // For now, we'll just check if it exists
    if (!context.userId) {
      logger.warn(`Invalid authentication token`, {
        path: request.nextUrl.pathname,
        method: request.method
      });
      
      return ApiErrorHandler.handleAuthenticationError(
        'Invalid authentication token',
        request.nextUrl.pathname,
        request.method
      );
    }

    return handler(request, context);
  });
}

// Authorization middleware
export function withAuthorization(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  requiredRole?: string
) {
  return withAuthentication(async (request: NextRequest, context: ApiContext) => {
    if (requiredRole) {
      // Here you would check if the user has the required role
      // For now, we'll just log the authorization check
      logger.info(`Authorization check`, {
        requiredRole,
        path: request.nextUrl.pathname,
        method: request.method,
        userId: context.userId
      });
    }

    return handler(request, context);
  });
} 