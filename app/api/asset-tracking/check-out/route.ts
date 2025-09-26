import { NextRequest, NextResponse } from 'next/server';
import { assetTrackingService } from '@/lib/services/AssetTrackingService';
import { CheckOutRequest } from '@/types/asset-tracking';

export async function POST(request: NextRequest) {
  try {
    const body: CheckOutRequest = await request.json();

    // Validate required fields
    if (!body.inventory_item_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_INVENTORY_ITEM_ID',
            message: 'Inventory item ID is required'
          }
        },
        { status: 400 }
      );
    }

    // At least one destination must be specified
    if (!body.to_location_id && (!body.assigned_to_type || !body.assigned_to_id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_DESTINATION',
            message: 'Either to_location_id or assigned_to_type/assigned_to_id must be specified'
          }
        },
        { status: 400 }
      );
    }

    const movement = await assetTrackingService.checkOutItem(body);

    return NextResponse.json({
      success: true,
      data: movement,
      message: 'Item checked out successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error checking out item:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECK_OUT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check out item'
        }
      },
      { status: 500 }
    );
  }
} 