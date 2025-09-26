import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'
import { z } from 'zod'

// Custom integration builder schemas
const IntegrationBuilderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  template: z.enum([
    'webhook_receiver',
    'data_sync',
    'file_processor',
    'notification_sender',
    'data_transformer',
    'custom_endpoint',
    'scheduled_task',
    'event_trigger'
  ]),
  configuration: z.object({
    triggers: z.array(z.object({
      type: z.enum(['webhook', 'schedule', 'database_change', 'api_call']),
      config: z.record(z.any())
    })).optional(),
    actions: z.array(z.object({
      type: z.enum(['http_request', 'database_operation', 'file_operation', 'notification', 'data_transform']),
      config: z.record(z.any())
    })).min(1, 'At least one action is required'),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'regex']),
      value: z.any()
    })).optional(),
    dataMapping: z.record(z.string()).optional(),
    errorHandling: z.object({
      retryCount: z.number().min(0).max(10).default(3),
      retryDelay: z.number().min(1000).max(60000).default(5000),
      fallbackAction: z.string().optional()
    }).optional()
  }),
  isActive: z.boolean().default(false),
  schedule: z.object({
    enabled: z.boolean().default(false),
    cronExpression: z.string().optional(),
    timezone: z.string().default('UTC')
  }).optional(),
  permissions: z.array(z.string()).optional(),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional()
  }).optional()
})

const UpdateIntegrationBuilderSchema = IntegrationBuilderSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const template = searchParams.get('template')
    const isActive = searchParams.get('isActive')
    const category = searchParams.get('category')
    const author = searchParams.get('author')

    // Get custom integrations
    const integrations = await integrationService.getCustomIntegrations()
    
    // Apply filters
    let filteredIntegrations = integrations
    
    if (template) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.template === template)
    }
    
    if (isActive !== null) {
      const active = isActive === 'true'
      filteredIntegrations = filteredIntegrations.filter(integration => integration.isActive === active)
    }

    if (category) {
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.metadata?.category === category
      )
    }

    if (author) {
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.metadata?.author === author
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredIntegrations,
      count: filteredIntegrations.length,
      filters: {
        template,
        isActive,
        category,
        author
      }
    })
  } catch (error) {
    console.error('Error fetching custom integrations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch custom integrations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = IntegrationBuilderSchema.parse(body)

    // Generate integration code based on template and configuration
    const generatedCode = await integrationService.generateIntegrationCode(validatedData)
    
    // Create the custom integration
    const integration = await integrationService.createCustomIntegration({
      ...validatedData,
      generatedCode
    })

    return NextResponse.json({
      success: true,
      data: {
        ...integration,
        generatedCode
      },
      message: 'Custom integration created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating custom integration:', error)
    
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
        error: 'Failed to create custom integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Integration ID is required' },
        { status: 400 }
      )
    }

    const validatedUpdates = UpdateIntegrationBuilderSchema.parse(updates)
    
    let updatedIntegration: any;
    
    // Regenerate code if configuration changed
    if (validatedUpdates.configuration) {
      const integration = await integrationService.getCustomIntegration(id)
      if (integration) {
        const newConfig = { ...integration.configuration, ...validatedUpdates.configuration }
        const generatedCode = await integrationService.generateIntegrationCode({
          ...integration,
          configuration: newConfig
        })
        
        const updatesWithCode = {
          ...validatedUpdates,
          generatedCode
        }
        
        updatedIntegration = await integrationService.updateCustomIntegration(id, updatesWithCode)
      }
    } else {
      updatedIntegration = await integrationService.updateCustomIntegration(id, validatedUpdates)
    }

    return NextResponse.json({
      success: true,
      data: updatedIntegration,
      message: 'Custom integration updated successfully'
    })
  } catch (error) {
    console.error('Error updating custom integration:', error)
    
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
        error: 'Failed to update custom integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
