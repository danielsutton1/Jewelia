import { NextRequest, NextResponse } from 'next/server';
import { assetTrackingService } from '@/lib/services/AssetTrackingService';

export async function GET(request: NextRequest) {
  try {
    const analytics = await assetTrackingService.getAssetTrackingAnalytics();

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error getting asset tracking analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get analytics'
        }
      },
      { status: 500 }
    );
  }
} 