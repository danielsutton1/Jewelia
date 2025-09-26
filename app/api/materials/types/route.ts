import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const types = await materialsService.listMaterialTypes(categoryId || undefined);
    
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching material types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const type = await materialsService.createMaterialType({
      category_id: body.category_id,
      name: body.name,
      description: body.description,
      unit_of_measure: body.unit_of_measure,
      density: body.density,
      melting_point: body.melting_point
    });
    
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error('Error creating material type:', error);
    return NextResponse.json(
      { error: 'Failed to create material type' },
      { status: 500 }
    );
  }
} 