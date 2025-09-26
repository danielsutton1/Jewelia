import { NextRequest, NextResponse } from 'next/server'
import { apiKeyService } from '@/lib/services/ApiKeyService'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { newApiKey, fullKey } = await apiKeyService.rotateApiKey(id)

    return NextResponse.json({
      success: true,
      data: {
        oldKeyId: id,
        newKey: {
          ...newApiKey,
          fullKey // Only returned on rotation
        }
      },
      message: 'API key rotated successfully'
    })
  } catch (error) {
    console.error('Error rotating API key:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to rotate API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 