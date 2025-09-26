import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    const type = await materialsService.updateMaterialType(id, {
      category_id: body.category_id,
      name: body.name,
      description: body.description,
      unit_of_measure: body.unit_of_measure,
      density: body.density,
      melting_point: body.melting_point
    });
    
    return NextResponse.json(type);
  } catch (error) {
    console.error('Error updating material type:', error);
    return NextResponse.json(
      { error: 'Failed to update material type' },
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
    await materialsService.deleteMaterialType(id);
    
    return NextResponse.json({ message: 'Material type deleted successfully' });
  } catch (error) {
    console.error('Error deleting material type:', error);
    return NextResponse.json(
      { error: 'Failed to delete material type' },
      { status: 500 }
    );
  }
} 