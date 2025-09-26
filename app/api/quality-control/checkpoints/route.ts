import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET() {
  try {
    const checkpoints = await qualityControlService.getQualityCheckpoints();
    return NextResponse.json({ success: true, data: checkpoints });
  } catch (error) {
    console.error('Error fetching quality checkpoints:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality checkpoints' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const checkpoint = await qualityControlService.createQualityCheckpoint(body);
    return NextResponse.json({ success: true, data: checkpoint });
  } catch (error) {
    console.error('Error creating quality checkpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quality checkpoint' },
      { status: 500 }
    );
  }
} 