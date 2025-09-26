import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const standard = await qualityControlService.getQualityStandardById(id);
    return NextResponse.json({ success: true, data: standard });
  } catch (error) {
    console.error('Error fetching quality standard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality standard' },
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
    const standard = await qualityControlService.updateQualityStandard(id, body);
    return NextResponse.json({ success: true, data: standard });
  } catch (error) {
    console.error('Error updating quality standard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quality standard' },
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
    await qualityControlService.deleteQualityStandard(id);
    return NextResponse.json({ success: true, message: 'Quality standard deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality standard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quality standard' },
      { status: 500 }
    );
  }
} 