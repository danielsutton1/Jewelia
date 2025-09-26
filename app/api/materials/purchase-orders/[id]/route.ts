import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseOrder = await materialsService.getPurchaseOrder(id);
    
    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    const purchaseOrder = await materialsService.updatePurchaseOrder(id, {
      supplier_id: body.supplier_id,
      order_number: body.order_number,
      order_date: body.order_date,
      expected_delivery_date: body.expected_delivery_date,
      status: body.status,
      total_amount: body.total_amount,
      notes: body.notes
    });
    
    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
      { status: 500 }
    );
  }
}

// Purchase Order Items endpoints
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    const item = await materialsService.addPurchaseOrderItem({
      purchase_order_id: id,
      material_id: body.material_id,
      quantity: body.quantity,
      unit_cost: body.unit_cost,
      total_cost: body.total_cost,
      received_quantity: body.received_quantity || 0
    });
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding purchase order item:', error);
    return NextResponse.json(
      { error: 'Failed to add purchase order item' },
      { status: 500 }
    );
  }
} 