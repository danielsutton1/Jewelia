import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET() {
  try {
    const analytics = await qualityControlService.getQualityAnalytics();
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching quality analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality analytics' },
      { status: 500 }
    );
  }
} 