import { NextRequest, NextResponse } from 'next/server';
import { ordersService } from '@/lib/services/OrdersService';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const result = await ordersService.processAutomatedStatusUpdates();
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Processed ${result.updated} order updates${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`
    });
  } catch (error) {
    console.error('Error in automated updates API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return current status of orders that might need updates
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id, status, order_date')
      .in('status', ['pending', 'confirmed', 'processing'])
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        pendingUpdates: pendingOrders?.length || 0,
        orders: pendingOrders || []
      }
    });
  } catch (error) {
    console.error('Error in automated updates status API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 