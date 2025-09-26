import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/InventoryService';

export async function GET(request: NextRequest) {
  try {
    const optimization = await inventoryService.getOptimizationRecommendations();
    
    return NextResponse.json({
      success: true,
      data: optimization,
      message: 'Inventory optimization recommendations retrieved successfully'
    });
  } catch (error) {
    console.error('Error in inventory optimization API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to retrieve inventory optimization recommendations'
      },
      { status: 500 }
    );
  }
} 