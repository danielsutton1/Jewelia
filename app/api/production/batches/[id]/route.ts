import { NextRequest, NextResponse } from 'next/server';
import { ProductionBatchesService } from '@/lib/services/ProductionBatchesService';

const productionService = new ProductionBatchesService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batch = await productionService.getBatch(id);
    
    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error fetching production batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production batch' },
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
    
    const batch = await productionService.updateBatch(id, {
      name: body.name,
      description: body.description,
      status: body.status,
      priority: body.priority,
      estimated_start_date: body.estimated_start_date,
      estimated_completion_date: body.estimated_completion_date,
      actual_start_date: body.actual_start_date,
      actual_completion_date: body.actual_completion_date,
      total_estimated_hours: body.total_estimated_hours,
      total_actual_hours: body.total_actual_hours,
      total_estimated_cost: body.total_estimated_cost,
      total_actual_cost: body.total_actual_cost,
      notes: body.notes,
      assigned_to: body.assigned_to
    });
    
    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error updating production batch:', error);
    return NextResponse.json(
      { error: 'Failed to update production batch' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await productionService.deleteBatch(id);
    
    return NextResponse.json({ message: 'Production batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting production batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete production batch' },
      { status: 500 }
    );
  }
} 