import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Try to update just the name field, nothing else
    const { data, error } = await supabase
      .from('customers')
      .update({ 
        name: 'John Smith',
        updated_at: new Date().toISOString() // Explicitly set updated_at
      })
      .eq('email', 'john.smith@example.com')
      .select('id, name, email') // Only select specific fields

    if (error) {
      console.error('Error updating customer:', error)
      return NextResponse.json({
        error: 'Failed to update customer',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      data: data
    })

  } catch (error) {
    console.error('Error in test update:', error)
    return NextResponse.json({
      error: 'Failed to test update',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
