import { NextRequest, NextResponse } from 'next/server';
import { ordersService } from '@/lib/services/OrdersService';

export async function GET(request: NextRequest) {
  try {
    const analytics = await ordersService.getAdvancedAnalytics();
    
    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error in orders analytics API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 