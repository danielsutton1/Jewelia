import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkpoint = await qualityControlService.getQualityCheckpointById(id);
    return NextResponse.json({ success: true, data: checkpoint });
  } catch (error) {
    console.error('Error fetching quality checkpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality checkpoint' },
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
    const checkpoint = await qualityControlService.updateQualityCheckpoint(id, body);
    return NextResponse.json({ success: true, data: checkpoint });
  } catch (error) {
    console.error('Error updating quality checkpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quality checkpoint' },
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
    await qualityControlService.deleteQualityCheckpoint(id);
    return NextResponse.json({ success: true, message: 'Quality checkpoint deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality checkpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quality checkpoint' },
      { status: 500 }
    );
  }
} 