import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      supplierId: searchParams.get('supplierId') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    };

    const purchaseOrders = await materialsService.listPurchaseOrders(filters);
    
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const purchaseOrder = await materialsService.createPurchaseOrder({
      supplier_id: body.supplier_id,
      order_number: body.order_number,
      order_date: body.order_date,
      expected_delivery_date: body.expected_delivery_date,
      status: body.status || 'pending',
      total_amount: body.total_amount || 0,
      notes: body.notes,
      created_by: body.created_by
    });
    
    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
} 