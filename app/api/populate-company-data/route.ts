import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Update customers with company data
    const updates = [
      { name: 'Sarah Johnson', company: 'Johnson & Associates' },
      { name: 'Michael Chen', company: 'Chen Technologies' },
      { name: 'Emily Rodriguez', company: 'Davis Consulting' },
      { name: 'David Thompson', company: 'Wilson Enterprises' },
      { name: 'Lisa Anderson', company: 'Anderson Manufacturing' },
      { name: 'James Wilson', company: 'Wilson & Co.' },
      { name: 'Amanda Foster', company: 'Foster Design Studio' },
      { name: 'Robert Kim', company: 'Kim Solutions' },
      { name: 'Jennifer Davis', company: 'Davis Creative' },
      { name: 'Thomas Brown', company: 'Brown & Associates' }
    ]

    let updatedCount = 0

    for (const update of updates) {
      const { error } = await supabase
        .from('customers')
        .update({ company: update.company })
        .eq('full_name', update.name)

      if (!error) {
        updatedCount++
      } else {
        console.error(`Error updating ${update.name}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} customers with company data`,
      updatedCount 
    })

  } catch (error) {
    console.error('Error populating company data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to populate company data' },
      { status: 500 }
    )
  }
} 