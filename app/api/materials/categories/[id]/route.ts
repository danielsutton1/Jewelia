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
    
    const category = await materialsService.updateCategory(id, {
      name: body.name,
      description: body.description,
      parent_category_id: body.parent_category_id
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating material category:', error);
    return NextResponse.json(
      { error: 'Failed to update material category' },
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
    await materialsService.deleteCategory(id);
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting material category:', error);
    return NextResponse.json(
      { error: 'Failed to delete material category' },
      { status: 500 }
    );
  }
} 