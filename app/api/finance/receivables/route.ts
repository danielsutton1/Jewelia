import { NextRequest, NextResponse } from 'next/server'
import { financeService } from '@/lib/services/FinanceService'

// GET /api/finance/receivables - Get accounts receivable
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      customer_id: searchParams.get('customer_id') || undefined,
      status: searchParams.get('status') || undefined,
      due_date_from: searchParams.get('due_date_from') || undefined,
      due_date_to: searchParams.get('due_date_to') || undefined
    }

    const receivables = await financeService.getAccountsReceivable(filters)

    return NextResponse.json({
      success: true,
      data: receivables,
      count: receivables.length
    })
  } catch (error: any) {
    console.error('Error in finance.receivables:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 