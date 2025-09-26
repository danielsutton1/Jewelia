import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update customers by email (more reliable than ID)
    const updates = [
      {
        email: 'john.smith@example.com',
        name: 'John Smith'
      },
      {
        email: 'sarah.johnson@example.com',
        name: 'Sarah Johnson'
      },
      {
        email: 'michael.brown@example.com',
        name: 'Michael Brown'
      },
      {
        email: 'emily.davis@example.com',
        name: 'Emily Davis'
      },
      {
        email: 'david.wilson@example.com',
        name: 'David Wilson'
      },
      {
        email: 'john.smith.test@example.com',
        name: 'John Smith (Test)'
      }
    ]

    let successCount = 0
    let errorCount = 0

    for (const update of updates) {
      const { error } = await supabase
        .from('customers')
        .update({ name: update.name })
        .eq('email', update.email)

      if (error) {
        console.error(`Error updating customer ${update.email}:`, error)
        errorCount++
      } else {
        successCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} customers successfully`,
      errors: errorCount,
      total: updates.length
    })

  } catch (error) {
    console.error('Error updating customer names:', error)
    return NextResponse.json({
      error: 'Failed to update customer names',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
