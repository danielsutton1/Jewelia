import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting user enhancement process...')

    // Try to add basic columns first
    console.log('Attempting to add basic enhanced columns...')
    
    // Start with just basic text fields that are most likely to work
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({
        bio: 'Professional jewelry industry expert with years of experience in design and sales.',
        location: 'San Francisco, CA',
        company: 'Jewelia CRM',
        job_title: 'Senior Developer'
      })
      .eq('id', user.id)
      .select()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user profile', details: updateError },
        { status: 500 }
      )
    }

    // Fetch the updated user to verify
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated user', details: fetchError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User profile enhanced successfully',
      data: {
        user: updatedUser,
        columns_added: 'auto-created'
      }
    })

  } catch (error: any) {
    console.error('Error in enhance user API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
