import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '../../../../lib/services/ProductsService';

const productsService = new ProductsService();

export async function GET(request: NextRequest) {
  try {
    const lowStockAlerts = await productsService.getLowStockAlerts();

    return NextResponse.json(lowStockAlerts);
  } catch (error) {
    console.error('Error in GET /api/products/low-stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock alerts' },
      { status: 500 }
    );
  }
} 