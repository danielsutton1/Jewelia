import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../../lib/services/EquipmentManagementService';

const equipmentService = new EquipmentManagementService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const maintenance = await equipmentService.recordMaintenance(id, body);

    return NextResponse.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error in maintenance PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update maintenance record' },
      { status: 500 }
    );
  }
} 