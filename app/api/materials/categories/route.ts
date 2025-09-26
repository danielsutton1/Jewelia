import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    const categories = await materialsService.listCategories(parentId || undefined);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching material categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const category = await materialsService.createCategory({
      name: body.name,
      description: body.description,
      parent_category_id: body.parent_category_id
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating material category:', error);
    return NextResponse.json(
      { error: 'Failed to create material category' },
      { status: 500 }
    );
  }
} 