import { NextRequest, NextResponse } from 'next/server';
import { assetTrackingService } from '@/lib/services/AssetTrackingService';
import { CreateAssignmentRequest, AssignmentFilters } from '@/types/asset-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: AssignmentFilters = {};
    const inventoryItemId = searchParams.get('inventory_item_id');
    const assignedToType = searchParams.get('assigned_to_type');
    const assignedToId = searchParams.get('assigned_to_id');
    const status = searchParams.get('status');
    const assignedBy = searchParams.get('assigned_by');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const isOverdue = searchParams.get('is_overdue');

    if (inventoryItemId) filters.inventory_item_id = inventoryItemId;
    if (assignedToType) filters.assigned_to_type = assignedToType as any;
    if (assignedToId) filters.assigned_to_id = assignedToId;
    if (status) filters.status = status as any;
    if (assignedBy) filters.assigned_by = assignedBy;
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    if (isOverdue !== null) filters.is_overdue = isOverdue === 'true';

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await assetTrackingService.listAssignments(filters, page, limit);

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
    console.error('Error listing assignments:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ASSIGNMENT_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list assignments'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAssignmentRequest = await request.json();

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

    if (!body.assigned_to_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ASSIGNED_TO_TYPE',
            message: 'Assigned to type is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.assigned_to_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ASSIGNED_TO_ID',
            message: 'Assigned to ID is required'
          }
        },
        { status: 400 }
      );
    }

    const assignment = await assetTrackingService.createAssignment(body);

    return NextResponse.json({
      success: true,
      data: assignment
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ASSIGNMENT_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create assignment'
        }
      },
      { status: 500 }
    );
  }
} 