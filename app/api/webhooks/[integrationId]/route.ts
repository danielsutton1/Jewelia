import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'
import { z } from 'zod'

const WebhookPayloadSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().optional(),
  signature: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ integrationId: string }> }
) {
  try {
    const body = await request.json()
    const validatedPayload = WebhookPayloadSchema.parse(body)

    const resolvedParams = await params;
    // Create webhook event
    const webhookEvent = await integrationService.createWebhookEvent({
      integrationId: resolvedParams.integrationId,
      eventType: validatedPayload.event,
      payload: validatedPayload.data,
      status: 'pending'
    })

    // Process the webhook based on event type
    try {
      await processWebhookEvent(webhookEvent.id!, validatedPayload)
      
      // Update status to processed
      await integrationService.updateWebhookEventStatus(webhookEvent.id!, 'processed')
      
      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully'
      })
    } catch (processError) {
      // Update status to failed
      await integrationService.updateWebhookEventStatus(
        webhookEvent.id!, 
        'failed', 
        processError instanceof Error ? processError.message : 'Unknown error'
      )
      
      throw processError
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid webhook payload',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function processWebhookEvent(webhookEventId: string, payload: any) {
  // Simulate webhook processing based on event type
  const eventType = payload.event
  
  switch (eventType) {
    case 'order.created':
      await processOrderCreated(payload.data)
      break
    case 'order.updated':
      await processOrderUpdated(payload.data)
      break
    case 'customer.created':
      await processCustomerCreated(payload.data)
      break
    case 'payment.succeeded':
      await processPaymentSucceeded(payload.data)
      break
    case 'inventory.updated':
      await processInventoryUpdated(payload.data)
      break
    default:
      console.log(`Unhandled webhook event type: ${eventType}`)
  }
}

async function processOrderCreated(data: any) {
  // Simulate order creation processing
  console.log('Processing order created:', data.order_id)
  // Here you would typically:
  // 1. Create or update order in local database
  // 2. Update inventory levels
  // 3. Send notifications
  // 4. Update analytics
}

async function processOrderUpdated(data: any) {
  // Simulate order update processing
  console.log('Processing order updated:', data.order_id)
  // Here you would typically:
  // 1. Update order status in local database
  // 2. Update related records
  // 3. Send status notifications
}

async function processCustomerCreated(data: any) {
  // Simulate customer creation processing
  console.log('Processing customer created:', data.customer_id)
  // Here you would typically:
  // 1. Create or update customer in local database
  // 2. Add to email lists
  // 3. Update analytics
}

async function processPaymentSucceeded(data: any) {
  // Simulate payment success processing
  console.log('Processing payment succeeded:', data.payment_id)
  // Here you would typically:
  // 1. Update order payment status
  // 2. Update financial records
  // 3. Send confirmation emails
  // 4. Update inventory
}

async function processInventoryUpdated(data: any) {
  // Simulate inventory update processing
  console.log('Processing inventory updated:', data.product_id)
  // Here you would typically:
  // 1. Update local inventory levels
  // 2. Check reorder points
  // 3. Update product availability
  // 4. Send low stock alerts
} 