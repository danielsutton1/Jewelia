import { NextRequest, NextResponse } from 'next/server';
import { ProductionBatchesService } from '@/lib/services/ProductionBatchesService';

const productionService = new ProductionBatchesService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const batchId = searchParams.get('batchId');
    const workOrderId = searchParams.get('workOrderId');

    let progressData;
    if (workOrderId) {
      progressData = await productionService.getWorkOrderProgress(workOrderId);
    } else if (batchId) {
      progressData = await productionService.getBatchProgress(batchId);
    } else {
      return NextResponse.json(
        { error: 'Either batchId or workOrderId is required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const progress = await productionService.recordProgress({
      batch_id: body.batch_id,
      work_order_id: body.work_order_id,
      step_id: body.step_id,
      progress_type: body.progress_type,
      status: body.status,
      description: body.description,
      hours_logged: body.hours_logged || 0,
      cost_incurred: body.cost_incurred || 0,
      quality_score: body.quality_score,
      issues_reported: body.issues_reported,
      resolution_notes: body.resolution_notes,
      recorded_by: body.recorded_by,
      recorded_at: body.recorded_at || new Date().toISOString()
    });
    
    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    console.error('Error recording progress:', error);
    return NextResponse.json(
      { error: 'Failed to record progress' },
      { status: 500 }
    );
  }
} 