import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '../../../../lib/services/TimeTrackingService';

const timeTrackingService = new TimeTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    let data;

    switch (type) {
      case 'overview':
        data = await timeTrackingService.getTimeTrackingAnalytics();
        break;
      case 'labor_cost':
        if (!start_date || !end_date) {
          return NextResponse.json(
            { success: false, error: 'Start date and end date are required for labor cost analysis' },
            { status: 400 }
          );
        }
        data = await timeTrackingService.getLaborCostAnalysis(start_date, end_date);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in time tracking analytics GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 