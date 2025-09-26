import { NextRequest, NextResponse } from 'next/server';
import { ProductionBatchesService } from '@/lib/services/ProductionBatchesService';

const productionService = new ProductionBatchesService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      batchId: searchParams.get('batchId') || undefined,
      status: searchParams.get('status') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined
    };

    const workOrders = await productionService.listWorkOrders(filters);
    
    return NextResponse.json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate work order number if not provided
    if (!body.work_order_number) {
      body.work_order_number = await productionService.generateWorkOrderNumber();
    }
    
    const workOrder = await productionService.createWorkOrder({
      batch_id: body.batch_id,
      batch_item_id: body.batch_item_id,
      work_order_number: body.work_order_number,
      title: body.title,
      description: body.description,
      instructions: body.instructions,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      estimated_hours: body.estimated_hours || 0,
      actual_hours: body.actual_hours || 0,
      assigned_to: body.assigned_to,
      due_date: body.due_date,
      started_at: body.started_at,
      completed_at: body.completed_at,
      quality_requirements: body.quality_requirements,
      materials_required: body.materials_required,
      equipment_required: body.equipment_required
    });
    
    return NextResponse.json(workOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating work order:', error);
    return NextResponse.json(
      { error: 'Failed to create work order' },
      { status: 500 }
    );
  }
} 