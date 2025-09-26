import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/InventoryService';

export async function GET(request: NextRequest) {
  try {
    const analytics = await inventoryService.getAdvancedAnalytics();
    
    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Inventory analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in inventory analytics API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to retrieve inventory analytics'
      },
      { status: 500 }
    );
  }
} 