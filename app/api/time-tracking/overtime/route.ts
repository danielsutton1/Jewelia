import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../lib/services/TimeTrackingService';
import { CreateOvertimeRecordRequest, OvertimeFilters } from '../../../../types/time-tracking';

const timeTrackingService = new TimeTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const employee_id = searchParams.get('employee_id') || undefined;
    const is_approved = searchParams.get('is_approved') === 'true';
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;

    const filters: OvertimeFilters = {
      employee_id,
      is_approved,
      start_date,
      end_date
    };

    const overtimeRecords = await timeTrackingService.getOvertimeRecords(filters);

    return NextResponse.json({
      success: true,
      data: overtimeRecords
    });
  } catch (error) {
    console.error('Error in overtime records GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overtime records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOvertimeRecordRequest = await request.json();

    // Validate required fields
    if (!body.employee_id || !body.date) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and date are required' },
        { status: 400 }
      );
    }

    const overtimeRecord = await timeTrackingService.createOvertimeRecord(body);

    return NextResponse.json({
      success: true,
      data: overtimeRecord
    }, { status: 201 });
  } catch (error) {
    console.error('Error in overtime records POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create overtime record' },
      { status: 500 }
    );
  }
} 