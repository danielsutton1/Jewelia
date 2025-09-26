import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const materialId = searchParams.get('materialId');
    const movementType = searchParams.get('movementType');

    const movements = await materialsService.getMovementHistory(
      materialId || undefined,
      movementType || undefined
    );
    
    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching material movements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material movements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const movement = await materialsService.recordMovement({
      material_id: body.material_id,
      movement_type: body.movement_type,
      quantity: body.quantity,
      from_location: body.from_location,
      to_location: body.to_location,
      reference_id: body.reference_id,
      reference_type: body.reference_type,
      notes: body.notes,
      created_by: body.created_by
    });
    
    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    console.error('Error recording material movement:', error);
    return NextResponse.json(
      { error: 'Failed to record material movement' },
      { status: 500 }
    );
  }
} 