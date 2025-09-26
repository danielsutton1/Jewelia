import { NextRequest, NextResponse } from 'next/server';
import { withApiMonitoring, ApiContext } from '../../../lib/middleware/api-monitoring-simple';
import { ApiErrorHandler, createSuccessResponse } from '../../../lib/utils/api-error-handler';
import { logger } from '../../../lib/utils/logger';

// Test handler to verify all improvements are working
async function testImprovementsHandler(request: NextRequest, context: ApiContext): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'success';

  logger.info('Testing improvements', {
    testType,
    userId: context.userId,
    requestId: context.requestId
  });

  try {
    switch (testType) {
      case 'success':
        // Test successful response
        logger.info('Success test completed', {
          testType,
          userId: context.userId
        });
        
        return createSuccessResponse({
          message: 'All improvements working correctly!',
          testType,
          timestamp: new Date().toISOString(),
          features: [
            'Standardized Error Handling',
            'Comprehensive Logging',
            'Performance Monitoring',
            'Middleware System'
          ]
        }, 'Test completed successfully');

      case 'validation-error':
        // Test validation error handling
        const validationErrors = [
          'Email is required',
          'Full name is required'
        ];
        
        return ApiErrorHandler.handleValidationError(
          validationErrors,
          request.nextUrl.pathname,
          request.method,
          context.userId
        );

      case 'database-error':
        // Test database error handling
        const dbError = {
          code: 'PGRST204',
          message: 'Could not find the column in the schema cache',
          details: 'Test database error'
        };
        
        return ApiErrorHandler.handleDatabaseError(
          dbError,
          'test_operation',
          request.nextUrl.pathname,
          request.method,
          context.userId
        );

      case 'authentication-error':
        // Test authentication error handling
        return ApiErrorHandler.handleAuthenticationError(
          'Test authentication error',
          request.nextUrl.pathname,
          request.method
        );

      case 'authorization-error':
        // Test authorization error handling
        return ApiErrorHandler.handleAuthorizationError(
          'Test authorization error',
          request.nextUrl.pathname,
          request.method,
          context.userId
        );

      case 'rate-limit-error':
        // Test rate limiting error handling
        return ApiErrorHandler.handleRateLimitError(
          request.nextUrl.pathname,
          request.method,
          context.userId
        );

      case 'not-found-error':
        // Test not found error handling
        return ApiErrorHandler.handleNotFoundError(
          'Test Resource',
          request.nextUrl.pathname,
          request.method,
          context.userId
        );

      case 'generic-error':
        // Test generic error handling
        const testError = new Error('Test generic error');
        return ApiErrorHandler.handleGenericError(
          testError,
          request.nextUrl.pathname,
          request.method,
          context.userId
        );

      case 'performance-test':
        // Test performance monitoring
        const startTime = Date.now();
        
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const duration = Date.now() - startTime;
        
        logger.info('Performance test completed', {
          duration,
          testType,
          userId: context.userId
        });
        
        return createSuccessResponse({
          message: 'Performance test completed',
          duration: `${duration}ms`,
          testType
        }, 'Performance monitoring working');

      default:
        return createSuccessResponse({
          message: 'Unknown test type',
          availableTests: [
            'success',
            'validation-error',
            'database-error',
            'authentication-error',
            'authorization-error',
            'rate-limit-error',
            'not-found-error',
            'generic-error',
            'performance-test'
          ]
        }, 'Available test types listed');
    }

  } catch (error) {
    logger.error('Unexpected error in test improvements', error as Error, {
      testType,
      userId: context.userId
    });

    return ApiErrorHandler.handleGenericError(
      error,
      request.nextUrl.pathname,
      request.method,
      context.userId
    );
  }
}

// Export the test handler with monitoring
export const GET = withApiMonitoring(testImprovementsHandler); 