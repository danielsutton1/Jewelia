import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/InventoryService';

const inventoryService = new InventoryService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const data = await inventoryService.get(id);
    
    if (!data) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/inventory/[id] error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const data = await inventoryService.update(id, body);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('PUT /api/inventory/[id] error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const success = await inventoryService.delete(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/inventory/[id] error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
} 