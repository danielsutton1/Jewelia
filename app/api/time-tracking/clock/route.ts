import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../lib/services/TimeTrackingService';
import { TimeClockAction } from '../../../../types/time-tracking';

const timeTrackingService = new TimeTrackingService();

export async function POST(request: NextRequest) {
  try {
    const body: TimeClockAction = await request.json();

    // Validate required fields
    if (!body.employee_id || !body.action) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and action are required' },
        { status: 400 }
      );
    }

    let result;

    switch (body.action) {
      case 'clock_in':
        result = await timeTrackingService.clockIn(
          body.employee_id,
          body.location,
          body.device_id,
          body.notes
        );
        break;
      case 'clock_out':
        result = await timeTrackingService.clockOut(
          body.employee_id,
          body.location,
          body.device_id,
          body.notes
        );
        break;
      case 'break_start':
        result = await timeTrackingService.startBreak(
          body.employee_id,
          'lunch', // Default break type
          body.notes
        );
        break;
      case 'break_end':
        result = await timeTrackingService.endBreak(
          body.employee_id,
          body.notes
        );
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in time clock action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process time clock action' },
      { status: 500 }
    );
  }
} 