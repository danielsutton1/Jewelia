import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../../../lib/services/TimeTrackingService';

const timeTrackingService = new TimeTrackingService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const resolvedParams = await params;
    const integration = await timeTrackingService.getProductionTimeIntegration(resolvedParams.batchId);

    return NextResponse.json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error in production time integration GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch production time integration' },
      { status: 500 }
    );
  }
} 