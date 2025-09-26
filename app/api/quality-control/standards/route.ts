import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET() {
  try {
    const standards = await qualityControlService.getQualityStandards();
    return NextResponse.json({ success: true, data: standards });
  } catch (error) {
    console.error('Error fetching quality standards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality standards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const standard = await qualityControlService.createQualityStandard(body);
    return NextResponse.json({ success: true, data: standard });
  } catch (error) {
    console.error('Error creating quality standard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quality standard' },
      { status: 500 }
    );
  }
} 