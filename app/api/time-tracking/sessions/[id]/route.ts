import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../../lib/services/TimeTrackingService';
import { UpdateWorkSessionRequest } from '../../../../../types/time-tracking';

const timeTrackingService = new TimeTrackingService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body: UpdateWorkSessionRequest = await request.json();
    const { id } = await params;

    const session = await timeTrackingService.updateWorkSession(id, body);

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error in work session PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update work session' },
      { status: 500 }
    );
  }
} 