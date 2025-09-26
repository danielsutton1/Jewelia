import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const defect = await qualityControlService.getQualityDefectById(id);
    return NextResponse.json({ success: true, data: defect });
  } catch (error) {
    console.error('Error fetching quality defect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality defect' },
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
    const defect = await qualityControlService.updateQualityDefect(id, body);
    return NextResponse.json({ success: true, data: defect });
  } catch (error) {
    console.error('Error updating quality defect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quality defect' },
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
    await qualityControlService.deleteQualityDefect(id);
    return NextResponse.json({ success: true, message: 'Quality defect deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality defect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quality defect' },
      { status: 500 }
    );
  }
} 