import { NextRequest, NextResponse } from 'next/server'
import { RBACService } from '@/lib/services/RBACService'

const rbacService = new RBACService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const permission = searchParams.get('permission')
    const resourceType = searchParams.get('resourceType') || 'global'
    const resourceId = searchParams.get('resourceId')

    if (userId && permission) {
      // Check specific permission
      const hasPermission = await rbacService.hasPermission(
        userId,
        permission,
        resourceType,
        resourceId || undefined
      )

      return NextResponse.json({
        success: true,
        hasPermission,
        userId,
        permission,
        resourceType,
        resourceId
      })
    } else if (userId) {
      // Get all user permissions
      const userPermissions = await rbacService.getUserPermissions(userId)
      
      if (!userPermissions) {
        return NextResponse.json(
          { error: 'User not found or no permissions' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: userPermissions
      })
    } else {
      // Get all available permissions
      const permissions = await rbacService.getAllPermissions()
      
      return NextResponse.json({
        success: true,
        data: permissions
      })
    }
  } catch (error: any) {
    console.error('Permissions API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
