import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../lib/services/EquipmentManagementService';
import { CreateAvailabilityRequest } from '../../../../types/equipment';

const equipmentService = new EquipmentManagementService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const equipment_id = searchParams.get('equipment_id');
    const date = searchParams.get('date');
    const shift = searchParams.get('shift') || undefined;

    if (!equipment_id || !date) {
      return NextResponse.json(
        { success: false, error: 'Equipment ID and date are required' },
        { status: 400 }
      );
    }

    const availability = await equipmentService.checkAvailability(equipment_id, date, shift);

    return NextResponse.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error in equipment availability GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAvailabilityRequest = await request.json();

    // Validate required fields
    if (!body.equipment_id || !body.date) {
      return NextResponse.json(
        { success: false, error: 'Equipment ID and date are required' },
        { status: 400 }
      );
    }

    const availability = await equipmentService.scheduleEquipment(body);

    return NextResponse.json({
      success: true,
      data: availability
    }, { status: 201 });
  } catch (error) {
    console.error('Error in equipment availability POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule equipment' },
      { status: 500 }
    );
  }
} 