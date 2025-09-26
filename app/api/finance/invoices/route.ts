import { NextRequest, NextResponse } from 'next/server'
import { financeService } from '@/lib/services/FinanceService'

// POST /api/finance/invoices - Create invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const invoice = await financeService.createInvoice(body)

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    })
  } catch (error: any) {
    console.error('Error in finance.invoices:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 