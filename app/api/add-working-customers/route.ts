import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Add new customers with different email addresses
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .insert([
        {
          name: 'John Smith',
          email: 'john.smith.working@example.com',
          phone: '+1-555-0101',
          address: '123 Main St, New York, NY 10001',
          notes: 'Premium customer, interested in diamond jewelry'
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson.working@example.com',
          phone: '+1-555-0102',
          address: '456 Oak Ave, Los Angeles, CA 90210',
          notes: 'Regular customer, prefers gold jewelry'
        },
        {
          name: 'Michael Brown',
          email: 'michael.brown.working@example.com',
          phone: '+1-555-0103',
          address: '789 Pine Rd, Chicago, IL 60601',
          notes: 'New customer, interested in engagement rings'
        },
        {
          name: 'Emily Davis',
          email: 'emily.davis.working@example.com',
          phone: '+1-555-0104',
          address: '321 Elm St, Miami, FL 33101',
          notes: 'VIP customer, high-end jewelry collector'
        },
        {
          name: 'David Wilson',
          email: 'david.wilson.working@example.com',
          phone: '+1-555-0105',
          address: '654 Maple Dr, Seattle, WA 98101',
          notes: 'Business customer, corporate gifts'
        }
      ])
      .select()

    if (customerError) {
      console.error('Error adding working customers:', customerError)
      return NextResponse.json({
        error: 'Failed to add working customers',
        details: customerError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Added ${customers?.length || 0} working customers successfully`,
      customers: customers
    })

  } catch (error) {
    console.error('Error adding working customers:', error)
    return NextResponse.json({
      error: 'Failed to add working customers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
