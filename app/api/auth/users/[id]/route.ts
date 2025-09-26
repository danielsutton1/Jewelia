import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']).optional(),
  avatar_url: z.string().url().optional(),
  tenant_id: z.string().uuid().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get user by ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: userData
    })

  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Validate input
    const validatedData = UpdateUserSchema.parse(body)
    
    // Update user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Update user metadata in auth if needed
    if (validatedData.full_name || validatedData.role) {
      await supabase.auth.admin.updateUserById(resolvedParams.id, {
        user_metadata: {
          full_name: validatedData.full_name,
          role: validatedData.role
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: profileData,
      message: 'User updated successfully'
    })

  } catch (error: any) {
    console.error('Update user error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Prevent self-deletion
    if (user.id === resolvedParams.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(resolvedParams.id)

    if (authDeleteError) {
      console.error('Auth delete error:', authDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete user from auth' },
        { status: 500 }
      )
    }

    // Delete user profile from our users table
    const { error: profileDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', resolvedParams.id)

    if (profileDeleteError) {
      console.error('Profile delete error:', profileDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'User deleted successfully'
      }
    })

  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 