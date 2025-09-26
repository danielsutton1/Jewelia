import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Parse filters
    const filters: any = {};
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('inspector_id')) filters.inspector_id = searchParams.get('inspector_id');
    if (searchParams.get('batch_id')) filters.batch_id = searchParams.get('batch_id');
    if (searchParams.get('order_id')) filters.order_id = searchParams.get('order_id');
    if (searchParams.get('checkpoint_id')) filters.checkpoint_id = searchParams.get('checkpoint_id');
    if (searchParams.get('date_from')) filters.date_from = searchParams.get('date_from');
    if (searchParams.get('date_to')) filters.date_to = searchParams.get('date_to');
    if (searchParams.get('score_min')) filters.score_min = parseFloat(searchParams.get('score_min') || '0');
    if (searchParams.get('score_max')) filters.score_max = parseFloat(searchParams.get('score_max') || '100');

    const result = await qualityControlService.getQualityInspections(filters, page, limit);
    return NextResponse.json({ 
      success: true, 
      data: result.inspections,
      pagination: {
        page,
        limit,
        total: result.total,
        total_pages: result.total_pages
      }
    });
  } catch (error) {
    console.error('Error fetching quality inspections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality inspections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inspection = await qualityControlService.createQualityInspection(body);
    return NextResponse.json({ success: true, data: inspection });
  } catch (error) {
    console.error('Error creating quality inspection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quality inspection' },
      { status: 500 }
    );
  }
} 