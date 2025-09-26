import { NextRequest, NextResponse } from 'next/server'
import { apiKeyService } from '@/lib/services/ApiKeyService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const apiKey = await apiKeyService.getApiKey(resolvedParams.id)
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: apiKey
    })
  } catch (error) {
    console.error('Error fetching API key:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch API key',
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
    const resolvedParams = await params
    const body = await request.json()
    const updates: any = {}

    if (body.name !== undefined) updates.name = body.name
    if (body.permissions !== undefined) updates.permissions = body.permissions
    if (body.isActive !== undefined) updates.isActive = body.isActive
    if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

    const apiKey = await apiKeyService.updateApiKey(resolvedParams.id, updates)

    return NextResponse.json({
      success: true,
      data: apiKey,
      message: 'API key updated successfully'
    })
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update API key',
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
    const resolvedParams = await params
    await apiKeyService.deleteApiKey(resolvedParams.id)

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 