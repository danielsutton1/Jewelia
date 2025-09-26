import { NextRequest, NextResponse } from 'next/server'
import { financeService } from '@/lib/services/FinanceService'

// GET /api/finance/analytics - Get financial metrics
export async function GET(request: NextRequest) {
  try {
    const metrics = await financeService.getFinancialMetrics()

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error: any) {
    console.error('Error in finance.analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 