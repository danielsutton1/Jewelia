import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = await materialsService.getMaterial(id);
    
    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    const material = await materialsService.updateMaterial(id, {
      type_id: body.type_id,
      supplier_id: body.supplier_id,
      name: body.name,
      sku: body.sku,
      description: body.description,
      specifications: body.specifications,
      current_stock: body.current_stock,
      minimum_stock: body.minimum_stock,
      maximum_stock: body.maximum_stock,
      reorder_point: body.reorder_point,
      unit_cost: body.unit_cost,
      location: body.location,
      is_active: body.is_active
    });
    
    return NextResponse.json(material);
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { error: 'Failed to update material' },
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
    await materialsService.deleteMaterial(id);
    
    return NextResponse.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    );
  }
} 