import { NextRequest, NextResponse } from 'next/server';
import { customersService } from '@/lib/services/CustomersService';

export async function POST(request: NextRequest) {
  try {
    const result = await customersService.processAutomatedWorkflows();
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Processed ${result.processed} customer workflows and sent ${result.notifications} notifications`
    });
  } catch (error) {
    console.error('Error in customer automated workflows API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to process automated customer workflows'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await customersService.processAutomatedWorkflows();
    
    return NextResponse.json({
      success: true,
      data: {
        pending_workflows: result.processed,
        pending_notifications: result.notifications,
        actions: result.actions
      },
      message: 'Customer automated workflows summary retrieved successfully'
    });
  } catch (error) {
    console.error('Error in customer automated workflows summary API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to retrieve automated workflows summary'
      },
      { status: 500 }
    );
  }
} 