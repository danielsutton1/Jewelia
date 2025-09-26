import { NextRequest, NextResponse } from 'next/server';
import { EquipmentManagementService } from '../../../../lib/services/EquipmentManagementService';
import { CreateEquipmentRequest } from '../../../../types/equipment';

const equipmentService = new EquipmentManagementService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category_id = searchParams.get('category_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const location = searchParams.get('location') || undefined;
    const manufacturer = searchParams.get('manufacturer') || undefined;
    const search = searchParams.get('search') || undefined;
    const min_value = searchParams.get('min_value') ? parseFloat(searchParams.get('min_value')!) : undefined;
    const max_value = searchParams.get('max_value') ? parseFloat(searchParams.get('max_value')!) : undefined;
    const needs_maintenance = searchParams.get('needs_maintenance') === 'true';

    const filters = {
      category_id,
      status,
      condition,
      location,
      manufacturer,
      search,
      min_value,
      max_value,
      needs_maintenance
    };

    const result = await equipmentService.listEquipment(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('Error in equipment registry GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEquipmentRequest = await request.json();

    // Validate required fields
    if (!body.equipment_code || !body.name || !body.category_id) {
      return NextResponse.json(
        { success: false, error: 'Equipment code, name, and category are required' },
        { status: 400 }
      );
    }

    const equipment = await equipmentService.createEquipment(body);

    return NextResponse.json({
      success: true,
      data: equipment
    }, { status: 201 });
  } catch (error) {
    console.error('Error in equipment registry POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
} 