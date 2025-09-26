import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/InventoryService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') as '30days' | '90days' | '1year' || '90days';
    
    const forecast = await inventoryService.calculateForecast(timeframe);
    
    return NextResponse.json({
      success: true,
      data: forecast,
      message: `Inventory forecast for ${timeframe} retrieved successfully`
    });
  } catch (error) {
    console.error('Error in inventory forecast API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to retrieve inventory forecast'
      },
      { status: 500 }
    );
  }
} 