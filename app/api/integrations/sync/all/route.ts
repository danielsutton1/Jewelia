import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '@/lib/services/IntegrationService'

export async function POST(request: NextRequest) {
  try {
    const syncResult = await integrationService.syncAllActiveIntegrations()

    return NextResponse.json({
      success: true,
      data: syncResult,
      message: `Synced ${syncResult.successful} out of ${syncResult.total} integrations`
    })
  } catch (error) {
    console.error('Error syncing all integrations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync all integrations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 