import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = await qualityControlService.getQualityInspectionById(id);
    return NextResponse.json({ success: true, data: inspection });
  } catch (error) {
    console.error('Error fetching quality inspection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality inspection' },
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
    const inspection = await qualityControlService.updateQualityInspection(id, body);
    return NextResponse.json({ success: true, data: inspection });
  } catch (error) {
    console.error('Error updating quality inspection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quality inspection' },
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
    await qualityControlService.deleteQualityInspection(id);
    return NextResponse.json({ success: true, message: 'Quality inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality inspection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quality inspection' },
      { status: 500 }
    );
  }
} 