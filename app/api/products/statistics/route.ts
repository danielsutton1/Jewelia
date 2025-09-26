import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '../../../../lib/services/ProductsService';

const productsService = new ProductsService();

export async function GET(request: NextRequest) {
  try {
    const statistics = await productsService.getProductStatistics();

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error in GET /api/products/statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    );
  }
} 