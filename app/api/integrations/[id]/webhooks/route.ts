import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'
import { z } from 'zod'

const CreateWebhookEventSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  payload: z.record(z.any()),
  status: z.enum(['pending', 'processed', 'failed']).default('pending'),
  errorMessage: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const { id } = await params;

    const webhookEvents = await integrationService.getWebhookEvents(id)
    
    // Apply filters
    let filteredEvents = webhookEvents
    
    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status)
    }
    
    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedEvents,
      pagination: {
        total: filteredEvents.length,
        limit,
        offset,
        hasMore: offset + limit < filteredEvents.length
      }
    })
  } catch (error) {
    console.error('Error fetching webhook events:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch webhook events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params;
    const validatedData = CreateWebhookEventSchema.parse(body)

    const webhookEvent = await integrationService.createWebhookEvent({
      ...validatedData,
      integrationId: id
    })

    return NextResponse.json({
      success: true,
      data: webhookEvent,
      message: 'Webhook event created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating webhook event:', error)
    
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
        error: 'Failed to create webhook event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 