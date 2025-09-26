import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../lib/services/TimeTrackingService';
import { CreateWorkSessionRequest, WorkSessionFilters } from '../../../../types/time-tracking';

const timeTrackingService = new TimeTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const employee_id = searchParams.get('employee_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;
    const has_overtime = searchParams.get('has_overtime') === 'true';

    const filters: WorkSessionFilters = {
      employee_id,
      status,
      start_date,
      end_date,
      has_overtime
    };

    const result = await timeTrackingService.getWorkSessions(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('Error in work sessions GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkSessionRequest = await request.json();

    // Validate required fields
    if (!body.employee_id || !body.start_time) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and start time are required' },
        { status: 400 }
      );
    }

    const session = await timeTrackingService.createWorkSession(body);

    return NextResponse.json({
      success: true,
      data: session
    }, { status: 201 });
  } catch (error) {
    console.error('Error in work sessions POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create work session' },
      { status: 500 }
    );
  }
} 