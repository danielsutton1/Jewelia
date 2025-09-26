import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const materialId = searchParams.get('materialId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const productionOrderId = searchParams.get('productionOrderId');
    const orderId = searchParams.get('orderId');

    let usageData;
    if (productionOrderId || orderId) {
      usageData = await materialsService.getUsageByProject(productionOrderId || undefined, orderId || undefined);
    } else {
      usageData = await materialsService.getUsageHistory(materialId || undefined, startDate || undefined, endDate || undefined);
    }
    
    return NextResponse.json(usageData);
  } catch (error) {
    console.error('Error fetching material usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material usage' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const usage = await materialsService.recordUsage({
      material_id: body.material_id,
      production_order_id: body.production_order_id,
      order_id: body.order_id,
      quantity_used: body.quantity_used,
      usage_date: body.usage_date,
      usage_type: body.usage_type || 'production',
      notes: body.notes,
      created_by: body.created_by
    });
    
    return NextResponse.json(usage, { status: 201 });
  } catch (error) {
    console.error('Error recording material usage:', error);
    return NextResponse.json(
      { error: 'Failed to record material usage' },
      { status: 500 }
    );
  }
} 