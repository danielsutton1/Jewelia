import { NextRequest, NextResponse } from 'next/server';
import { QualityControlService } from '../../../../lib/services/QualityControlService';

const qualityControlService = new QualityControlService();

export async function GET() {
  try {
    const dashboard = await qualityControlService.getQualityControlDashboard();
    return NextResponse.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('Error fetching quality control dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quality control dashboard' },
      { status: 500 }
    );
  }
} 