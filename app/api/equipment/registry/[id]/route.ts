import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../../lib/services/EquipmentManagementService';
import { UpdateEquipmentRequest } from '../../../../../types/equipment';

const equipmentService = new EquipmentManagementService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipment = await equipmentService.getEquipment(id);

    return NextResponse.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error in equipment GET:', error);
    return NextResponse.json(
      { success: false, error: 'Equipment not found' },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body: UpdateEquipmentRequest = await request.json();
    const { id } = await params;

    const equipment = await equipmentService.updateEquipment(id, body);

    return NextResponse.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error in equipment PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await equipmentService.deleteEquipment(id);

    return NextResponse.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error in equipment DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
} 