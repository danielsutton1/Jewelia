import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../lib/services/EquipmentManagementService';
import { CreateUsageRequest } from '../../../../types/equipment';

const equipmentService = new EquipmentManagementService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const equipment_id = searchParams.get('equipment_id') || undefined;
    const batch_id = searchParams.get('batch_id') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;
    const operation_type = searchParams.get('operation_type') || undefined;

    const filters = {
      equipment_id,
      batch_id,
      start_date,
      end_date,
      operation_type
    };

    const usage = await equipmentService.getUsageHistory(equipment_id, filters);

    return NextResponse.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error in equipment usage GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUsageRequest = await request.json();

    // Validate required fields
    if (!body.equipment_id || !body.start_time) {
      return NextResponse.json(
        { success: false, error: 'Equipment ID and start time are required' },
        { status: 400 }
      );
    }

    const usage = await equipmentService.recordUsage(body);

    return NextResponse.json({
      success: true,
      data: usage
    }, { status: 201 });
  } catch (error) {
    console.error('Error in equipment usage POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record usage' },
      { status: 500 }
    );
  }
} 