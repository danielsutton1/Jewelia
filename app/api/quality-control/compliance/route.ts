import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET() {
  try {
    const compliance = await qualityControlService.getQualityCompliance();
    return NextResponse.json({ success: true, data: compliance });
  } catch (error) {
    console.error('Error fetching quality compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality compliance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const compliance = await qualityControlService.createQualityCompliance(body);
    return NextResponse.json({ success: true, data: compliance });
  } catch (error) {
    console.error('Error creating quality compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quality compliance' },
      { status: 500 }
    );
  }
} 