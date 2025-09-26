import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '../../../../../lib/services/ProductsService';

const productsService = new ProductsService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (body.stock === undefined || typeof body.stock !== 'number') {
      return NextResponse.json(
        { error: 'Stock level is required and must be a number' },
        { status: 400 }
      );
    }

    const product = await productsService.updateStock(id, body.stock);

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error in PUT /api/products/[id]/stock:', error);
    
    if (error.message.includes('Product not found')) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('Stock cannot be negative')) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
} 