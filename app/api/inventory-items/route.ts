import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/InventoryService';

const inventoryService = new InventoryService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: any = {};
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const lowStockOnly = searchParams.get('low_stock_only');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const sortBy = searchParams.get('sort_by');
    const sortOrder = searchParams.get('sort_order');

    if (search) filters.search = search;
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (minPrice) filters.min_price = parseFloat(minPrice);
    if (maxPrice) filters.max_price = parseFloat(maxPrice);
    if (lowStockOnly) filters.low_stock_only = lowStockOnly === 'true';
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);
    if (sortBy) filters.sort_by = sortBy;
    if (sortOrder) filters.sort_order = sortOrder;

    const items = await inventoryService.list(filters);

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length
    });

  } catch (error) {
    console.error('Error listing inventory items:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVENTORY_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list inventory items'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ITEM_NAME',
            message: 'Item name is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.sku) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_SKU',
            message: 'SKU is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.price) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PRICE',
            message: 'Price is required'
          }
        },
        { status: 400 }
      );
    }

    // Create the inventory item
    const item = await inventoryService.create(body);

    return NextResponse.json({
      success: true,
      data: item
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVENTORY_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create inventory item'
        }
      },
      { status: 500 }
    );
  }
} 