import { NextRequest, NextResponse } from 'next/server';
import { ProductionBatchesService } from '@/lib/services/ProductionBatchesService';

const productionService = new ProductionBatchesService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      resourceType: searchParams.get('resourceType') || undefined,
      resourceId: searchParams.get('resourceId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    };

    const resources = await productionService.getResourceUsage(filters);
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resource usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource usage' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const allocation = await productionService.allocateResources({
      batch_id: body.batch_id,
      work_order_id: body.work_order_id,
      resource_type: body.resource_type,
      resource_id: body.resource_id,
      resource_name: body.resource_name,
      allocation_date: body.allocation_date,
      start_time: body.start_time,
      end_time: body.end_time,
      hours_allocated: body.hours_allocated || 0,
      hours_used: body.hours_used || 0,
      cost_per_hour: body.cost_per_hour || 0,
      total_cost: body.total_cost || 0,
      status: body.status || 'allocated',
      notes: body.notes
    });
    
    return NextResponse.json(allocation, { status: 201 });
  } catch (error) {
    console.error('Error allocating resources:', error);
    return NextResponse.json(
      { error: 'Failed to allocate resources' },
      { status: 500 }
    );
  }
} 