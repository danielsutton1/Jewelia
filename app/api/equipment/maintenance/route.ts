import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../lib/services/EquipmentManagementService';
import { CreateMaintenanceRequest } from '../../../../types/equipment';

const equipmentService = new EquipmentManagementService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const equipment_id = searchParams.get('equipment_id') || undefined;
    const maintenance_type = searchParams.get('maintenance_type') || undefined;
    const status = searchParams.get('status') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;

    const filters = {
      equipment_id,
      maintenance_type,
      status,
      start_date,
      end_date
    };

    const maintenance = await equipmentService.getMaintenanceHistory(equipment_id, filters);

    return NextResponse.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error in equipment maintenance GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMaintenanceRequest = await request.json();

    // Validate required fields
    if (!body.equipment_id || !body.maintenance_type || !body.scheduled_date) {
      return NextResponse.json(
        { success: false, error: 'Equipment ID, maintenance type, and scheduled date are required' },
        { status: 400 }
      );
    }

    const maintenance = await equipmentService.scheduleMaintenance(body);

    return NextResponse.json({
      success: true,
      data: maintenance
    }, { status: 201 });
  } catch (error) {
    console.error('Error in equipment maintenance POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule maintenance' },
      { status: 500 }
    );
  }
} 