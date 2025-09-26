import { NextRequest, NextResponse } from 'next/server';
import { ProductionBatchesService } from '@/lib/services/ProductionBatchesService';

const productionService = new ProductionBatchesService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const batchId = searchParams.get('batchId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const schedules = await productionService.getSchedule(batchId || undefined, startDate || undefined, endDate || undefined);
    
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching production schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const schedule = await productionService.scheduleProduction({
      batch_id: body.batch_id,
      schedule_date: body.schedule_date,
      shift: body.shift || 'day',
      start_time: body.start_time,
      end_time: body.end_time,
      total_hours: body.total_hours,
      capacity_utilization: body.capacity_utilization || 0,
      notes: body.notes
    });
    
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating production schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create production schedule' },
      { status: 500 }
    );
  }
} 