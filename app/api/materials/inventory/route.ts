import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      categoryId: searchParams.get('categoryId') || undefined,
      typeId: searchParams.get('typeId') || undefined,
      supplierId: searchParams.get('supplierId') || undefined,
      lowStock: searchParams.get('lowStock') === 'true',
      outOfStock: searchParams.get('outOfStock') === 'true',
      active: searchParams.get('active') === 'true' ? true : 
              searchParams.get('active') === 'false' ? false : undefined
    };

    const materials = await materialsService.listMaterials(filters);
    
    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const material = await materialsService.createMaterial({
      type_id: body.type_id,
      supplier_id: body.supplier_id,
      name: body.name,
      sku: body.sku,
      description: body.description,
      specifications: body.specifications,
      current_stock: body.current_stock || 0,
      minimum_stock: body.minimum_stock || 0,
      maximum_stock: body.maximum_stock,
      reorder_point: body.reorder_point,
      unit_cost: body.unit_cost || 0,
      location: body.location,
      is_active: body.is_active !== undefined ? body.is_active : true
    });
    
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    );
  }
} 