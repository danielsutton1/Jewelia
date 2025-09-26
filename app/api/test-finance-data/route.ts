import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Sample accounts receivable data
    const arData = [
      {
        "Invoice ID": "INV-001",
        "Customer": "John Smith",
        "Date Issued": "2024-01-15",
        "Due Date": "2024-02-15",
        "Amount": 1500.00,
        "Balance": 1500.00
      },
      {
        "Invoice ID": "INV-002",
        "Customer": "Sarah Johnson",
        "Date Issued": "2024-01-20",
        "Due Date": "2024-02-20",
        "Amount": 2500.00,
        "Balance": 2500.00
      },
      {
        "Invoice ID": "INV-003",
        "Customer": "Mike Wilson",
        "Date Issued": "2024-01-25",
        "Due Date": "2024-02-25",
        "Amount": 800.00,
        "Balance": 0.00
      }
    ]

    // Sample accounts payable data
    const apData = [
      {
        "Bill ID": "BILL-001",
        "Vendor": "Diamond Supplier Co",
        "Date Issued": "2024-01-10",
        "Due Date": "2024-02-10",
        "Amount": 5000.00,
        "Balance": 5000.00
      },
      {
        "Bill ID": "BILL-002",
        "Vendor": "Gold Metals Inc",
        "Date Issued": "2024-01-15",
        "Due Date": "2024-02-15",
        "Amount": 3000.00,
        "Balance": 3000.00
      }
    ]

    // Insert accounts receivable data
    const { data: arResult, error: arError } = await supabase
      .from('accounts_receivable')
      .insert(arData)
      .select()

    if (arError) {
      console.error('AR Insert Error:', arError)
      return NextResponse.json({ error: arError.message }, { status: 500 })
    }

    // Insert accounts payable data
    const { data: apResult, error: apError } = await supabase
      .from('accounts_payable')
      .insert(apData)
      .select()

    if (apError) {
      console.error('AP Insert Error:', apError)
      return NextResponse.json({ error: apError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Sample finance data inserted',
      accounts_receivable_inserted: arResult?.length || 0,
      accounts_payable_inserted: apResult?.length || 0
    })
  } catch (error: any) {
    console.error('Insert finance data error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 