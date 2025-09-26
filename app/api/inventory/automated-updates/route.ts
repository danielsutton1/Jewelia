import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/InventoryService';

export async function POST(request: NextRequest) {
  try {
    const result = await inventoryService.processAutomatedUpdates();
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Processed ${result.updated} inventory updates and sent ${result.notifications} notifications`
    });
  } catch (error) {
    console.error('Error in inventory automated updates API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to process automated inventory updates'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return a summary of what automated updates would do
    const result = await inventoryService.processAutomatedUpdates();
    
    return NextResponse.json({
      success: true,
      data: {
        pending_updates: result.updated,
        pending_notifications: result.notifications,
        actions: result.actions
      },
      message: 'Automated inventory updates summary retrieved successfully'
    });
  } catch (error) {
    console.error('Error in inventory automated updates summary API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to retrieve automated updates summary'
      },
      { status: 500 }
    );
  }
} 