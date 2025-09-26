import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update existing customers with proper names
    const customerUpdates = [
      {
        id: '4ad97a54-e762-488e-8be1-b36474c44842',
        name: 'John Smith'
      },
      {
        id: 'd01339f7-76f1-40bd-82c2-f4022c7f9c6b',
        name: 'Sarah Johnson'
      },
      {
        id: 'fe24424d-d10b-41ac-884d-de2f2e487acd',
        name: 'Michael Brown'
      },
      {
        id: '0866fa54-e2f9-40fc-accd-2bd82eacf024',
        name: 'Emily Davis'
      },
      {
        id: '77c31113-39cb-46a3-829c-1fa121208c7d',
        name: 'David Wilson'
      },
      {
        id: '1ab484b1-8fc9-4354-ad17-080f6d10e1b5',
        name: 'John Smith (Test)'
      }
    ]

    let successCount = 0
    let errorCount = 0

    for (const update of customerUpdates) {
      const { error } = await supabase
        .from('customers')
        .update({ name: update.name })
        .eq('id', update.id)

      if (error) {
        console.error(`Error updating customer ${update.id}:`, error)
        errorCount++
      } else {
        successCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} customers successfully`,
      errors: errorCount,
      total: customerUpdates.length
    })

  } catch (error) {
    console.error('Error fixing customer names:', error)
    return NextResponse.json({
      error: 'Failed to fix customer names',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
