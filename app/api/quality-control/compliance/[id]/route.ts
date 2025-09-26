import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const compliance = await qualityControlService.getQualityComplianceById(id);
    return NextResponse.json({ success: true, data: compliance });
  } catch (error) {
    console.error('Error fetching quality compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality compliance' },
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
    const compliance = await qualityControlService.updateQualityCompliance(id, body);
    return NextResponse.json({ success: true, data: compliance });
  } catch (error) {
    console.error('Error updating quality compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quality compliance' },
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
    await qualityControlService.deleteQualityCompliance(id);
    return NextResponse.json({ success: true, message: 'Quality compliance deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quality compliance' },
      { status: 500 }
    );
  }
} 