import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../lib/services/EquipmentManagementService';

const equipmentService = new EquipmentManagementService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    let data;

    switch (type) {
      case 'overview':
        data = await equipmentService.getEquipmentAnalytics();
        break;
      case 'maintenance':
        data = await equipmentService.getMaintenanceStats();
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
    console.error('Error in equipment analytics GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 