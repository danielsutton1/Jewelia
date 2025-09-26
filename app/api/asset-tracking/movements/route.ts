import { NextRequest, NextResponse } from 'next/server';
import { assetTrackingService } from '@/lib/services/AssetTrackingService';
import { CreateMovementRequest, MovementFilters } from '@/types/asset-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: MovementFilters = {};
    const inventoryItemId = searchParams.get('inventory_item_id');
    const fromLocationId = searchParams.get('from_location_id');
    const toLocationId = searchParams.get('to_location_id');
    const movementType = searchParams.get('movement_type');
    const movedBy = searchParams.get('moved_by');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const isOverdue = searchParams.get('is_overdue');

    if (inventoryItemId) filters.inventory_item_id = inventoryItemId;
    if (fromLocationId) filters.from_location_id = fromLocationId;
    if (toLocationId) filters.to_location_id = toLocationId;
    if (movementType) filters.movement_type = movementType as any;
    if (movedBy) filters.moved_by = movedBy;
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    if (isOverdue !== null) filters.is_overdue = isOverdue === 'true';

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await assetTrackingService.listMovements(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: result.total_pages
      },
      filters
    });

  } catch (error) {
    console.error('Error listing movements:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MOVEMENT_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list movements'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMovementRequest = await request.json();

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

    if (!body.movement_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_MOVEMENT_TYPE',
            message: 'Movement type is required'
          }
        },
        { status: 400 }
      );
    }

    const movement = await assetTrackingService.createMovement(body);

    return NextResponse.json({
      success: true,
      data: movement
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating movement:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MOVEMENT_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create movement'
        }
      },
      { status: 500 }
    );
  }
} 