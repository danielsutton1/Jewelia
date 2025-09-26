import { NextRequest, NextResponse } from 'next/server';
import { ProductionBatchesService } from '@/lib/services/ProductionBatchesService';

const productionService = new ProductionBatchesService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const batchId = searchParams.get('batchId');

    let analyticsData;

    switch (type) {
      case 'batch-analytics':
        analyticsData = await productionService.getBatchAnalytics();
        break;
      case 'production-metrics':
        analyticsData = await productionService.getProductionMetrics(batchId || undefined);
        break;
      case 'efficiency-stats':
        analyticsData = await productionService.getEfficiencyStats();
        break;
      case 'batch-optimization':
        // This would require production orders data
        analyticsData = { message: 'Batch optimization requires production orders data' };
        break;
      default:
        analyticsData = await productionService.getBatchAnalytics();
    }
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching production analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production analytics' },
      { status: 500 }
    );
  }
} 