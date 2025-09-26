import { NextRequest, NextResponse } from 'next/server';
import { MaterialsTrackingService } from '@/lib/services/MaterialsTrackingService';

const materialsService = new MaterialsTrackingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const materialId = searchParams.get('materialId');
    const supplierId = searchParams.get('supplierId');

    let analyticsData;

    switch (type) {
      case 'overview':
        analyticsData = await materialsService.getMaterialsAnalytics();
        break;
      case 'cost-analysis':
        if (!materialId) {
          return NextResponse.json(
            { error: 'Material ID is required for cost analysis' },
            { status: 400 }
          );
        }
        analyticsData = await materialsService.getCostAnalysis(materialId);
        break;
      case 'supplier-performance':
        analyticsData = await materialsService.getSupplierPerformance(supplierId || undefined);
        break;
      case 'low-stock':
        analyticsData = await materialsService.checkLowStockItems();
        break;
      case 'out-of-stock':
        analyticsData = await materialsService.checkOutOfStockItems();
        break;
      default:
        analyticsData = await materialsService.getMaterialsAnalytics();
    }
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching materials analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials analytics' },
      { status: 500 }
    );
  }
} 