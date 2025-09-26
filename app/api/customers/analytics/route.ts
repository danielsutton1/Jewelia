import { NextRequest, NextResponse } from 'next/server';
import { customersService } from '@/lib/services/CustomersService';

export async function GET(request: NextRequest) {
  try {
    const analytics = await customersService.getAdvancedAnalytics();
    
    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Customer analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in customer analytics API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to retrieve customer analytics'
      },
      { status: 500 }
    );
  }
} 