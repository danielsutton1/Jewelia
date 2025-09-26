import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/InventoryService';

const inventoryService = new InventoryService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = searchParams.get('threshold') ? Number(searchParams.get('threshold')) : 10;
    
    const data = await inventoryService.getLowStockItems(threshold);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/inventory/low-stock error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
} 