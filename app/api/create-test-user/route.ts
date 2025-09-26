// 🧪 CREATE TEST USER ENDPOINT
// This creates a test user for development purposes

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Create a test user using admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'test@jewelia.com',
      password: 'testpassword123',
      email_confirm: true, // Auto-confirm email for development
      user_metadata: {
        full_name: 'Test User',
        role: 'admin'
      }
    })

    if (error) {
      console.error('Error creating test user:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create test user',
        details: error.message
      }, { status: 400 })
    }

    console.log('🧪 Test user created successfully:', data.user?.email)

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name: data.user?.user_metadata?.full_name,
        confirmed: data.user?.email_confirmed_at
      },
      note: 'Test user created and email confirmed. You can now sign in!'
    })

  } catch (error) {
    console.error('🧪 Create test user error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to create test user',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if test user exists using admin client
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('Error listing users:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to list users',
        details: error.message
      }, { status: 500 })
    }

    const testUser = users?.find(u => u.email === 'test@jewelia.com')

    return NextResponse.json({
      success: true,
      message: 'User check completed',
      test_user_exists: !!testUser,
      test_user: testUser ? {
        id: testUser.id,
        email: testUser.email,
        full_name: testUser.user_metadata?.full_name,
        confirmed: testUser.email_confirmed_at
      } : null,
      total_users: users?.length || 0
    })

  } catch (error) {
    console.error('🧪 Check test user error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to check test user',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}
