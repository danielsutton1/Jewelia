import { NextRequest, NextResponse } from 'next/server'
import { apiKeyService } from '@/lib/services/ApiKeyService'
import { z } from 'zod'

const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  permissions: z.record(z.array(z.string())).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const apiKeys = await apiKeyService.getApiKeys()
    const stats = await apiKeyService.getApiKeyStats()

    return NextResponse.json({
      success: true,
      data: apiKeys,
      stats,
      count: apiKeys.length
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch API keys',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateApiKeySchema.parse(body)

    // Parse expiresAt if provided
    const apiKeyData = {
      ...validatedData,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      createdBy: 'system' // In a real app, this would be the authenticated user ID
    }

    const { apiKey, fullKey } = await apiKeyService.createApiKey(apiKeyData)

    return NextResponse.json({
      success: true,
      data: {
        ...apiKey,
        fullKey // Only returned on creation
      },
      message: 'API key created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating API key:', error)
    
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
        error: 'Failed to create API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 