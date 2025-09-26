import { NextRequest, NextResponse } from 'next/server'
import { webhookService } from '@/lib/services/WebhookService'
import { z } from 'zod'

// Webhook testing schemas
const WebhookTestSchema = z.object({
  webhookUrl: z.string().url('Valid webhook URL is required'),
  method: z.enum(['POST', 'PUT', 'PATCH']).default('POST'),
  headers: z.record(z.string()).optional(),
  payload: z.any(),
  timeout: z.number().min(1000).max(30000).default(10000),
  retries: z.number().min(0).max(5).default(0),
  retryDelay: z.number().min(1000).max(10000).default(2000)
})

const WebhookTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.enum([
    'order_events',
    'customer_events',
    'inventory_events',
    'payment_events',
    'shipping_events',
    'custom_events'
  ]),
  template: z.object({
    method: z.enum(['POST', 'PUT', 'PATCH']),
    headers: z.record(z.string()),
    payload: z.any(),
    variables: z.array(z.object({
      name: z.string(),
      type: z.enum(['string', 'number', 'boolean', 'date', 'object']),
      description: z.string(),
      required: z.boolean().default(false),
      defaultValue: z.any().optional()
    })).optional()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = WebhookTestSchema.parse(body)

    // Test the webhook
    const testResult = await webhookService.testWebhook({
      ...validatedData,
      payload: validatedData.payload || {}
    })

    return NextResponse.json({
      success: true,
      data: testResult,
      message: 'Webhook test completed successfully'
    })
  } catch (error) {
    console.error('Error testing webhook:', error)
    
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
        error: 'Failed to test webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const name = searchParams.get('name')

    if (name) {
      // Get specific template
      const template = await webhookService.getWebhookTemplate(name)
      
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: template
      })
    } else {
      // Get all templates with optional category filter
      const templates = await webhookService.getWebhookTemplates(category || undefined)
      
      return NextResponse.json({
        success: true,
        data: templates,
        count: templates.length
      })
    }
  } catch (error) {
    console.error('Error fetching webhook templates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch webhook templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = WebhookTemplateSchema.parse(body)

    // Create or update webhook template
    const template = await webhookService.saveWebhookTemplate(validatedData)

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Webhook template saved successfully'
    })
  } catch (error) {
    console.error('Error saving webhook template:', error)
    
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
        error: 'Failed to save webhook template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Template name is required' },
        { status: 400 }
      )
    }

    // Delete webhook template
    await webhookService.deleteWebhookTemplate(name)

    return NextResponse.json({
      success: true,
      message: 'Webhook template deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting webhook template:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete webhook template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
