import { NextRequest, NextResponse } from 'next/server'
import { RBACService } from '@/lib/services/RBACService'
import { CreateUserRequest, UpdateUserRoleRequest } from '@/types/rbac'

const rbacService = new RBACService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')

    if (userId) {
      // Get specific user
      const userRole = await rbacService.getUserRole(userId)
      const userPermissions = await rbacService.getUserPermissions(userId)
      
      if (!userRole) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          userId,
          role: userRole,
          permissions: userPermissions
        }
      })
    } else {
      // Get all users (this would need to be implemented with pagination)
      // For now, return a placeholder response
      return NextResponse.json({
        success: true,
        data: [],
        message: 'User listing endpoint - to be implemented with pagination'
      })
    }
  } catch (error: any) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.full_name || !body.role) {
      return NextResponse.json(
        { error: 'Email, full name, and role are required' },
        { status: 400 }
      )
    }

    const user = await rbacService.createUser(body)

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create user API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateUserRoleRequest = await request.json()

    // Validate required fields
    if (!body.user_id || !body.role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    const success = await rbacService.updateUserRole(body)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully'
    })
  } catch (error: any) {
    console.error('Update user role API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
