import { NextRequest, NextResponse } from 'next/server';
import { customersService } from '@/lib/services/CustomersService';

export async function GET(request: NextRequest) {
  try {
    const lifecycle = await customersService.getCustomerLifecycle();
    
    return NextResponse.json({
      success: true,
      data: lifecycle,
      message: 'Customer lifecycle analysis retrieved successfully'
    });
  } catch (error) {
    console.error('Error in customer lifecycle API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to retrieve customer lifecycle analysis'
      },
      { status: 500 }
    );
  }
} 