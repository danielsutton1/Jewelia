import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'
import { z } from 'zod'

// Marketplace integration schemas
const MarketplaceIntegrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  developer: z.string().min(1, 'Developer name is required'),
  developerEmail: z.string().email('Valid email is required'),
  category: z.enum([
    'design_tools',
    'inventory_management',
    'accounting_finance',
    'ecommerce_sales',
    'supplier_management',
    'quality_control',
    'production_management',
    'customer_management',
    'pricing_calculators',
    'certification_systems',
    'analytics_reporting',
    'communication_tools',
    'project_management',
    'time_tracking',
    'other'
  ]),
  pricing: z.object({
    model: z.enum(['free', 'one_time', 'subscription', 'usage_based']),
    amount: z.number().min(0).optional(),
    currency: z.string().default('USD'),
    billingCycle: z.string().optional(), // monthly, yearly, etc.
    freeTier: z.object({
      requestsPerMonth: z.number().optional(),
      features: z.array(z.string()).optional()
    }).optional()
  }),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  requirements: z.array(z.string()).optional(),
  documentation: z.string().url('Valid documentation URL is required'),
  supportEmail: z.string().email('Valid support email is required'),
  supportUrl: z.string().url('Valid support URL is required'),
  version: z.string().min(1, 'Version is required'),
  minApiVersion: z.string().optional(),
  maxApiVersion: z.string().optional(),
  isPublished: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).default(0),
  downloadCount: z.number().min(0).default(0),
  tags: z.array(z.string()).optional(),
  screenshots: z.array(z.string().url()).optional(),
  demoUrl: z.string().url().optional(),
  changelog: z.array(z.object({
    version: z.string(),
    date: z.string(),
    changes: z.array(z.string())
  })).optional()
})

const UpdateMarketplaceIntegrationSchema = MarketplaceIntegrationSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const developer = searchParams.get('developer')
    const isPublished = searchParams.get('isPublished')
    const isVerified = searchParams.get('isVerified')
    const pricingModel = searchParams.get('pricingModel')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'rating'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get marketplace integrations
    const integrations = await integrationService.getMarketplaceIntegrations()
    
    // Apply filters
    let filteredIntegrations = integrations
    
    if (category) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.category === category)
    }
    
    if (developer) {
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.developer.toLowerCase().includes(developer.toLowerCase())
      )
    }
    
    if (isPublished !== null) {
      const published = isPublished === 'true'
      filteredIntegrations = filteredIntegrations.filter(integration => integration.isPublished === published)
    }

    if (isVerified !== null) {
      const verified = isVerified === 'true'
      filteredIntegrations = filteredIntegrations.filter(integration => integration.isVerified === verified)
    }

    if (pricingModel) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.pricing.model === pricingModel)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.name.toLowerCase().includes(searchLower) ||
        integration.description.toLowerCase().includes(searchLower) ||
        integration.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply sorting
    filteredIntegrations.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a]
      let bValue = b[sortBy as keyof typeof b]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedIntegrations = filteredIntegrations.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedIntegrations,
      pagination: {
        page,
        limit,
        total: filteredIntegrations.length,
        totalPages: Math.ceil(filteredIntegrations.length / limit),
        hasNext: endIndex < filteredIntegrations.length,
        hasPrev: page > 1
      },
      filters: {
        category,
        developer,
        isPublished,
        isVerified,
        pricingModel,
        search,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    console.error('Error fetching marketplace integrations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch marketplace integrations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = MarketplaceIntegrationSchema.parse(body)

    const integration = await integrationService.createMarketplaceIntegration(validatedData)

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Marketplace integration created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating marketplace integration:', error)
    
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
        error: 'Failed to create marketplace integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
