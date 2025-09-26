import { NextRequest, NextResponse } from 'next/server';
import { customersService } from '@/lib/services/CustomersService';

export async function GET(request: NextRequest) {
  try {
    const segments = await customersService.getCustomerSegments();
    
    return NextResponse.json({
      success: true,
      data: segments,
      message: 'Customer segments retrieved successfully'
    });
  } catch (error) {
    console.error('Error in customer segments API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to retrieve customer segments'
      },
      { status: 500 }
    );
  }
} 