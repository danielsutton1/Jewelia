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
    if (searchParams.get('certificate_type')) filters.certificate_type = searchParams.get('certificate_type');
    if (searchParams.get('order_id')) filters.order_id = searchParams.get('order_id');
    if (searchParams.get('batch_id')) filters.batch_id = searchParams.get('batch_id');
    if (searchParams.get('issued_by')) filters.issued_by = searchParams.get('issued_by');
    if (searchParams.get('is_valid') !== null) filters.is_valid = searchParams.get('is_valid') === 'true';
    if (searchParams.get('date_from')) filters.date_from = searchParams.get('date_from');
    if (searchParams.get('date_to')) filters.date_to = searchParams.get('date_to');

    const result = await qualityControlService.getQualityCertificates(filters, page, limit);
    return NextResponse.json({ 
      success: true, 
      data: result.certificates,
      pagination: {
        page,
        limit,
        total: result.total,
        total_pages: result.total_pages
      }
    });
  } catch (error) {
    console.error('Error fetching quality certificates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality certificates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const certificate = await qualityControlService.createQualityCertificate(body);
    return NextResponse.json({ success: true, data: certificate });
  } catch (error) {
    console.error('Error creating quality certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quality certificate' },
      { status: 500 }
    );
  }
} 