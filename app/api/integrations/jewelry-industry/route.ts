import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'
import { z } from 'zod'

// Jewelry industry specific integration schemas
const JewelryIntegrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum([
    'design_software',      // CAD software like Rhino, Matrix, etc.
    'inventory_management', // Jewelry inventory systems
    'accounting',          // Jewelry-specific accounting
    'ecommerce',           // Jewelry ecommerce platforms
    'supplier_management', // Gem and material suppliers
    'quality_assurance',   // Quality control systems
    'production_tracking', // Manufacturing tracking
    'customer_management', // Jewelry CRM systems
    'pricing_tools',       // Jewelry pricing calculators
    'certification'        // Gem certification systems
  ]),
  provider: z.string().min(1, 'Provider is required'),
  version: z.string().optional(),
  apiVersion: z.string().optional(),
  features: z.array(z.string()).optional(),
  supportedFormats: z.array(z.string()).optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(false),
  syncInterval: z.number().min(60).max(86400).default(3600),
  config: z.record(z.any()).optional(),
  metadata: z.object({
    industryStandards: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    supportedCurrencies: z.array(z.string()).optional(),
    supportedLanguages: z.array(z.string()).optional(),
    integrationLevel: z.enum(['basic', 'standard', 'premium', 'enterprise']).default('standard')
  }).optional()
})

const UpdateJewelryIntegrationSchema = JewelryIntegrationSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const provider = searchParams.get('provider')
    const isActive = searchParams.get('isActive')
    const integrationLevel = searchParams.get('integrationLevel')

    // Get jewelry industry integrations
    const integrations = await integrationService.getJewelryIndustryIntegrations()
    
    // Apply filters
    let filteredIntegrations = integrations
    
    if (type) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.type === type)
    }
    
    if (provider) {
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.provider.toLowerCase().includes(provider.toLowerCase())
      )
    }
    
    if (isActive !== null) {
      const active = isActive === 'true'
      filteredIntegrations = filteredIntegrations.filter(integration => integration.isActive === active)
    }

    if (integrationLevel) {
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.metadata?.integrationLevel === integrationLevel
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredIntegrations,
      count: filteredIntegrations.length,
      filters: {
        type,
        provider,
        isActive,
        integrationLevel
      }
    })
  } catch (error) {
    console.error('Error fetching jewelry industry integrations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch jewelry industry integrations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = JewelryIntegrationSchema.parse(body)

    const integration = await integrationService.createJewelryIndustryIntegration(validatedData)

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Jewelry industry integration created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating jewelry industry integration:', error)
    
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
        error: 'Failed to create jewelry industry integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
