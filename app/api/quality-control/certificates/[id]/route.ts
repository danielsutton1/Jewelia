import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certificate = await qualityControlService.getQualityCertificateById(id);
    return NextResponse.json({ success: true, data: certificate });
  } catch (error) {
    console.error('Error fetching quality certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality certificate' },
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
    const certificate = await qualityControlService.updateQualityCertificate(id, body);
    return NextResponse.json({ success: true, data: certificate });
  } catch (error) {
    console.error('Error updating quality certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quality certificate' },
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
    await qualityControlService.deleteQualityCertificate(id);
    return NextResponse.json({ success: true, message: 'Quality certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quality certificate' },
      { status: 500 }
    );
  }
} 