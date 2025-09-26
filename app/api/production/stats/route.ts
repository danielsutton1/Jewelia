import { NextRequest, NextResponse } from 'next/server'
import { productionService } from '@/lib/services/ProductionService'

// GET /api/production/stats - Get production statistics
export async function GET(request: NextRequest) {
  try {
    const data = await productionService.getProductionStats()

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 