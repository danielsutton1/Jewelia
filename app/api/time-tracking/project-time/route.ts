import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../lib/services/TimeTrackingService';
import { CreateProjectTimeAllocationRequest, ProjectTimeFilters } from '../../../../types/time-tracking';

const timeTrackingService = new TimeTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const employee_id = searchParams.get('employee_id') || undefined;
    const batch_id = searchParams.get('batch_id') || undefined;
    const work_order_id = searchParams.get('work_order_id') || undefined;
    const activity_type = searchParams.get('activity_type') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;
    const is_billable = searchParams.get('is_billable') === 'true';

    const filters: ProjectTimeFilters = {
      employee_id,
      batch_id,
      work_order_id,
      activity_type,
      start_date,
      end_date,
      is_billable
    };

    const allocations = await timeTrackingService.getProjectTimeAllocations(filters);

    return NextResponse.json({
      success: true,
      data: allocations
    });
  } catch (error) {
    console.error('Error in project time allocations GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project time allocations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectTimeAllocationRequest = await request.json();

    // Validate required fields
    if (!body.employee_id || !body.start_time) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and start time are required' },
        { status: 400 }
      );
    }

    const allocation = await timeTrackingService.allocateProjectTime(body);

    return NextResponse.json({
      success: true,
      data: allocation
    }, { status: 201 });
  } catch (error) {
    console.error('Error in project time allocations POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to allocate project time' },
      { status: 500 }
    );
  }
} 