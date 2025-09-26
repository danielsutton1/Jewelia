import { NextRequest, NextResponse } from 'next/server';
import { ProductionBatchesService } from '@/lib/services/ProductionBatchesService';

const productionService = new ProductionBatchesService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workOrder = await productionService.getWorkOrder(id);
    
    return NextResponse.json(workOrder);
  } catch (error) {
    console.error('Error fetching work order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    const workOrder = await productionService.updateWorkOrder(id, {
      batch_id: body.batch_id,
      batch_item_id: body.batch_item_id,
      work_order_number: body.work_order_number,
      title: body.title,
      description: body.description,
      instructions: body.instructions,
      status: body.status,
      priority: body.priority,
      estimated_hours: body.estimated_hours,
      actual_hours: body.actual_hours,
      assigned_to: body.assigned_to,
      due_date: body.due_date,
      started_at: body.started_at,
      completed_at: body.completed_at,
      quality_requirements: body.quality_requirements,
      materials_required: body.materials_required,
      equipment_required: body.equipment_required
    });
    
    return NextResponse.json(workOrder);
  } catch (error) {
    console.error('Error updating work order:', error);
    return NextResponse.json(
      { error: 'Failed to update work order' },
      { status: 500 }
    );
  }
}

// Work Order Steps endpoints
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    const step = await productionService.addWorkOrderStep({
      work_order_id: id,
      step_number: body.step_number,
      step_name: body.step_name,
      description: body.description,
      instructions: body.instructions,
      estimated_duration_minutes: body.estimated_duration_minutes || 0,
      actual_duration_minutes: body.actual_duration_minutes || 0,
      status: body.status || 'pending',
      equipment_id: body.equipment_id,
      materials_required: body.materials_required,
      quality_checkpoints: body.quality_checkpoints,
      dependencies: body.dependencies,
      started_at: body.started_at,
      completed_at: body.completed_at,
      notes: body.notes
    });
    
    return NextResponse.json(step, { status: 201 });
  } catch (error) {
    console.error('Error adding work order step:', error);
    return NextResponse.json(
      { error: 'Failed to add work order step' },
      { status: 500 }
    );
  }
} 