import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '../../../../lib/services/ProductsService';

const productsService = new ProductsService();

export async function GET(request: NextRequest) {
  try {
    const categories = await productsService.getCategories();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in GET /api/products/categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 