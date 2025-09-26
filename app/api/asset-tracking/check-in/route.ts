import { NextRequest, NextResponse } from 'next/server';
import { assetTrackingService } from '@/lib/services/AssetTrackingService';
import { CheckInRequest } from '@/types/asset-tracking';

export async function POST(request: NextRequest) {
  try {
    const body: CheckInRequest = await request.json();

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

    if (!body.to_location_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TO_LOCATION_ID',
            message: 'To location ID is required'
          }
        },
        { status: 400 }
      );
    }

    const movement = await assetTrackingService.checkInItem(body);

    return NextResponse.json({
      success: true,
      data: movement,
      message: 'Item checked in successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error checking in item:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECK_IN_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check in item'
        }
      },
      { status: 500 }
    );
  }
} 