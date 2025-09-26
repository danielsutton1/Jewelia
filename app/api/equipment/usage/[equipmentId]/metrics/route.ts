import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../../../lib/services/EquipmentManagementService';

const equipmentService = new EquipmentManagementService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const resolvedParams = await params;
    
    // Parse query parameters
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const metrics = await equipmentService.getUtilizationMetrics(
      resolvedParams.equipmentId,
      start_date,
      end_date
    );

    return NextResponse.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error in equipment metrics GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch utilization metrics' },
      { status: 500 }
    );
  }
} 