import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const syncResult = await integrationService.syncData(id)

    return NextResponse.json({
      success: true,
      data: syncResult,
      message: syncResult.message
    })
  } catch (error) {
    console.error('Error syncing integration:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const healthCheck = await integrationService.checkIntegrationHealth(id)

    return NextResponse.json({
      success: true,
      data: healthCheck
    })
  } catch (error) {
    console.error('Error checking integration health:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check integration health',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 