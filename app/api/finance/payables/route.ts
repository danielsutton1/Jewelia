import { NextRequest, NextResponse } from 'next/server'
import { financeService } from '@/lib/services/FinanceService'

// GET /api/finance/payables - Get accounts payable
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      vendor_id: searchParams.get('vendor_id') || undefined,
      status: searchParams.get('status') || undefined,
      due_date_from: searchParams.get('due_date_from') || undefined,
      due_date_to: searchParams.get('due_date_to') || undefined
    }

    const payables = await financeService.getAccountsPayable(filters)

    return NextResponse.json({
      success: true,
      data: payables,
      count: payables.length
    })
  } catch (error: any) {
    console.error('Error in finance.payables:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 