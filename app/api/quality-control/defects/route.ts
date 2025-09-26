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
    if (searchParams.get('severity')) filters.severity = searchParams.get('severity');
    if (searchParams.get('defect_type')) filters.defect_type = searchParams.get('defect_type');
    if (searchParams.get('supplier_id')) filters.supplier_id = searchParams.get('supplier_id');
    if (searchParams.get('assigned_to')) filters.assigned_to = searchParams.get('assigned_to');
    if (searchParams.get('date_from')) filters.date_from = searchParams.get('date_from');
    if (searchParams.get('date_to')) filters.date_to = searchParams.get('date_to');

    const result = await qualityControlService.getQualityDefects(filters, page, limit);
    return NextResponse.json({ 
      success: true, 
      data: result.defects,
      pagination: {
        page,
        limit,
        total: result.total,
        total_pages: result.total_pages
      }
    });
  } catch (error) {
    console.error('Error fetching quality defects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality defects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const defect = await qualityControlService.createQualityDefect(body);
    return NextResponse.json({ success: true, data: defect });
  } catch (error) {
    console.error('Error creating quality defect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quality defect' },
      { status: 500 }
    );
  }
} 