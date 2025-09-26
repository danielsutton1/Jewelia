import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'
import { z } from 'zod'

// Validation schemas
const CreateIntegrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['accounting', 'ecommerce', 'email', 'payment', 'shipping', 'calendar']),
  provider: z.string().min(1, 'Provider is required'),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(false),
  syncInterval: z.number().min(60).max(86400).default(3600),
  config: z.record(z.any()).optional()
})

const UpdateIntegrationSchema = CreateIntegrationSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    const integrations = await integrationService.getIntegrations()
    
    // Apply filters
    let filteredIntegrations = integrations
    
    if (type) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.type === type)
    }
    
    if (isActive !== null) {
      const active = isActive === 'true'
      filteredIntegrations = filteredIntegrations.filter(integration => integration.isActive === active)
    }

    return NextResponse.json({
      success: true,
      data: filteredIntegrations,
      count: filteredIntegrations.length
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch integrations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateIntegrationSchema.parse(body)

    const integration = await integrationService.createIntegration(validatedData)

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Integration created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating integration:', error)
    
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
        error: 'Failed to create integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 