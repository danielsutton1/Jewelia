import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../../lib/services/TimeTrackingService';

const timeTrackingService = new TimeTrackingService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const resolvedParams = await params;
    const status = await timeTrackingService.getTimeClockStatus(resolvedParams.employeeId);

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting time clock status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get time clock status' },
      { status: 500 }
    );
  }
} 