import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../../../lib/services/TimeTrackingService';

const timeTrackingService = new TimeTrackingService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { approved_by } = body;
    const { id } = await params;

    if (!approved_by) {
      return NextResponse.json(
        { success: false, error: 'Approver ID is required' },
        { status: 400 }
      );
    }

    const overtimeRecord = await timeTrackingService.approveOvertime(id, approved_by);

    return NextResponse.json({
      success: true,
      data: overtimeRecord
    });
  } catch (error) {
    console.error('Error in overtime approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve overtime' },
      { status: 500 }
    );
  }
} 