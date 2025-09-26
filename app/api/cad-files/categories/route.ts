import { NextRequest, NextResponse } from 'next/server';
import { cadFilesService } from '@/lib/services/CADFilesService';
import { CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters } from '@/types/cad-files';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: CategoryFilters = {};
    const search = searchParams.get('search');
    const parentCategoryId = searchParams.get('parent_category_id');
    const isActive = searchParams.get('is_active');
    const hasFiles = searchParams.get('has_files');

    if (search) filters.search = search;
    if (parentCategoryId) filters.parent_category_id = parentCategoryId;
    if (isActive !== null) filters.is_active = isActive === 'true';
    if (hasFiles !== null) filters.has_files = hasFiles === 'true';

    const categories = await cadFilesService.listCategories(filters);

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error listing categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CATEGORIES_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list categories'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryRequest = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CATEGORY_NAME',
            message: 'Category name is required'
          }
        },
        { status: 400 }
      );
    }

    // Create the category
    const category = await cadFilesService.createCategory(body);

    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CATEGORY_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create category'
        }
      },
      { status: 500 }
    );
  }
} 