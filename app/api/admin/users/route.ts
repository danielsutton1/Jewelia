import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CreateUserRequest, UpdateUserRequest } from '@/types/team-management'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role, jewelry_role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role !== 'admin' && currentUser?.jewelry_role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('business_id')
    const role = searchParams.get('role')
    const jewelryRole = searchParams.get('jewelry_role')
    const department = searchParams.get('department')
    const isActive = searchParams.get('is_active')
    const search = searchParams.get('search')

    // Build filters
    const filters: any = {}
    if (role && role !== 'all') filters.role = role
    if (jewelryRole && jewelryRole !== 'all') filters.jewelry_role = jewelryRole
    if (department && department !== 'all') filters.department = department
    if (isActive && isActive !== 'all') filters.is_active = isActive === 'true'
    if (search) filters.search = search

    // Get users directly from Supabase
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (businessId) {
      query = query.eq('business_id', businessId)
    }
    if (filters.role) {
      query = query.eq('role', filters.role)
    }
    if (filters.jewelry_role) {
      query = query.eq('jewelry_role', filters.jewelry_role)
    }
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      throw usersError
    }

    return NextResponse.json({
      success: true,
      data: {
        users,
        total_count: users.length
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role, jewelry_role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role !== 'admin' && currentUser?.jewelry_role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userData, teamMemberData } = body

    // Validate user data
    if (!userData || !userData.email || !userData.password || !userData.full_name) {
      return NextResponse.json(
        { success: false, message: 'Missing required user data' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth
    const { data: authUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    })

    if (createUserError) {
      throw createUserError
    }

    // Create user profile in users table
    const { data: newUser, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || 'user',
        business_id: userData.business_id,
        department: userData.department,
        jewelry_role: userData.jewelry_role,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        phone: userData.phone,
        position: userData.position,
        hire_date: userData.hire_date,
        manager_id: userData.manager_id,
        permissions: userData.permissions
      })
      .select()
      .single()

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: { user: newUser }
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role, jewelry_role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role !== 'admin' && currentUser?.jewelry_role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, updateData } = body

    if (!userId || !updateData) {
      return NextResponse.json(
        { success: false, message: 'Missing user ID or update data' },
        { status: 400 }
      )
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role, jewelry_role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role !== 'admin' && currentUser?.jewelry_role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Missing user ID' },
        { status: 400 }
      )
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user profile from users table
    const { error: deleteProfileError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteProfileError) {
      throw deleteProfileError
    }

    // Delete user from Supabase Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      throw deleteAuthError
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
