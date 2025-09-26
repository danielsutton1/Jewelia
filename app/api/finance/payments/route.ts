import { NextRequest, NextResponse } from 'next/server'
import { financeService } from '@/lib/services/FinanceService'

// POST /api/finance/payments - Record payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const payment = await financeService.recordPayment(body)

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully'
    })
  } catch (error: any) {
    console.error('Error in finance.payments:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 