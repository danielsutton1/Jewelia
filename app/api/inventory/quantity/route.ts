import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/InventoryService';

const inventoryService = new InventoryService();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantityChange, reason } = body;
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    if (typeof quantityChange !== 'number') {
      return NextResponse.json({ error: 'Quantity change must be a number' }, { status: 400 });
    }

    const data = await inventoryService.updateQuantity(itemId, quantityChange, reason);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('PUT /api/inventory/quantity error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
} 