import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/InventoryService';

const inventoryService = new InventoryService();

export async function GET(request: NextRequest) {
  try {
    const data = await inventoryService.getStatistics();
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/inventory/statistics error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
} 