import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/services/AnalyticsService'
import { z } from 'zod'

// API Analytics schemas
const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  apiKey: z.string().optional(),
  endpoint: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  statusCode: z.number().min(100).max(599).optional(),
  userId: z.string().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month', 'endpoint', 'apiKey', 'statusCode']).default('day'),
  limit: z.number().min(1).max(1000).default(100)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryParams: any = {}
    for (const [key, value] of searchParams.entries()) {
      if (key === 'limit' || key === 'statusCode') {
        queryParams[key] = parseInt(value)
      } else {
        queryParams[key] = value
      }
    }
    
    const validatedQuery = AnalyticsQuerySchema.parse(queryParams)

    // Get API usage analytics
    const analytics = await analyticsService.getApiUsageAnalytics(validatedQuery)

    return NextResponse.json({
      success: true,
      data: analytics,
      query: validatedQuery
    })
  } catch (error) {
    console.error('Error fetching API usage analytics:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch API usage analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log API request for analytics
    const logData = {
      timestamp: new Date().toISOString(),
      endpoint: body.endpoint,
      method: body.method,
      apiKey: body.apiKey,
      userId: body.userId,
      statusCode: body.statusCode,
      responseTime: body.responseTime,
      requestSize: body.requestSize,
      responseSize: body.responseSize,
      userAgent: body.userAgent,
      ipAddress: body.ipAddress,
      metadata: body.metadata || {}
    }

    await analyticsService.logApiRequest(logData)

    return NextResponse.json({
      success: true,
      message: 'API request logged successfully'
    })
  } catch (error) {
    console.error('Error logging API request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log API request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
