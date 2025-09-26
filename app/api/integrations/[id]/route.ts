import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'
import { z } from 'zod'

const UpdateIntegrationSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.enum(['accounting', 'ecommerce', 'email', 'payment', 'shipping', 'calendar']).optional(),
  provider: z.string().min(1, 'Provider is required').optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  syncInterval: z.number().min(60).max(86400).optional(),
  config: z.record(z.any()).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const integration = await integrationService.getIntegration(id)
    
    if (!integration) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Integration not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: integration
    })
  } catch (error) {
    console.error('Error fetching integration:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params;
    const validatedData = UpdateIntegrationSchema.parse(body)

    const integration = await integrationService.updateIntegration(id, validatedData)

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Integration updated successfully'
    })
  } catch (error) {
    console.error('Error updating integration:', error)
    
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
        error: 'Failed to update integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await integrationService.deleteIntegration(id)

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting integration:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 