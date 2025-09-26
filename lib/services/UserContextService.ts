import { SupabaseClient, User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface UserContext {
  user: User
  tenantId: string
  userRole: string
  permissions: Record<string, boolean>
}

export class UserContextService {
  private static instance: UserContextService
  private userContext: UserContext | null = null

  static getInstance(): UserContextService {
    if (!UserContextService.instance) {
      UserContextService.instance = new UserContextService()
    }
    return UserContextService.instance
  }

  /**
   * Initialize user context from Supabase session
   */
  async initialize(supabase: SupabaseClient): Promise<UserContext | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        this.userContext = null
        return null
      }

      // Get user profile with tenant and role information
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('tenant_id, role, permissions')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        console.error('Failed to fetch user profile:', profileError)
        this.userContext = null
        return null
      }

      if (!profile.tenant_id) {
        console.error('User has no tenant_id')
        this.userContext = null
        return null
      }

      // Get role-based permissions
      const permissions = this.getRolePermissions(profile.role)

      this.userContext = {
        user,
        tenantId: profile.tenant_id,
        userRole: profile.role,
        permissions
      }

      return this.userContext
    } catch (error) {
      console.error('Error initializing user context:', error)
      this.userContext = null
      return null
    }
  }

  /**
   * Get current user context
   */
  getContext(): UserContext | null {
    return this.userContext
  }

  /**
   * Get tenant ID for current user
   */
  getTenantId(): string | null {
    return this.userContext?.tenantId || null
  }

  /**
   * Get user role for current user
   */
  getUserRole(): string | null {
    return this.userContext?.userRole || null
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    if (!this.userContext) return false
    return this.userContext.permissions[permission] || false
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.userContext?.userRole === 'admin'
  }

  /**
   * Check if user is manager or admin
   */
  isManagerOrAdmin(): boolean {
    const role = this.userContext?.userRole
    return role === 'admin' || role === 'manager'
  }

  /**
   * Get tenant filter for database queries
   */
  getTenantFilter(): { tenant_id: string } | null {
    const tenantId = this.getTenantId()
    return tenantId ? { tenant_id: tenantId } : null
  }

  /**
   * Validate user access to a resource
   */
  async validateAccess(
    supabase: SupabaseClient, 
    table: string, 
    resourceId: string
  ): Promise<boolean> {
    if (!this.userContext) return false

    // Admins can access all resources in their tenant
    if (this.isAdmin()) {
      const { data } = await supabase
        .from(table)
        .select('tenant_id')
        .eq('id', resourceId)
        .eq('tenant_id', this.userContext.tenantId)
        .single()
      
      return !!data
    }

    // For non-admins, implement additional checks based on role
    // This can be extended based on specific business rules
    return true
  }

  /**
   * Get role-based permissions
   */
  private getRolePermissions(role: string): Record<string, boolean> {
    const rolePermissions: Record<string, Record<string, boolean>> = {
      admin: {
        canViewCustomers: true,
        canEditCustomers: true,
        canViewOrders: true,
        canEditOrders: true,
        canViewInventory: true,
        canEditInventory: true,
        canViewProduction: true,
        canEditProduction: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canViewFinancials: true,
        canEditFinancials: true,
        canViewReports: true,
        canExportData: true
      },
      manager: {
        canViewCustomers: true,
        canEditCustomers: true,
        canViewOrders: true,
        canEditOrders: true,
        canViewInventory: true,
        canEditInventory: true,
        canViewProduction: true,
        canEditProduction: true,
        canViewAnalytics: true,
        canManageUsers: false,
        canViewFinancials: true,
        canEditFinancials: false,
        canViewReports: true,
        canExportData: true
      },
      sales: {
        canViewCustomers: true,
        canEditCustomers: true,
        canViewOrders: true,
        canEditOrders: true,
        canViewInventory: true,
        canEditInventory: false,
        canViewProduction: false,
        canEditProduction: false,
        canViewAnalytics: true,
        canManageUsers: false,
        canViewFinancials: false,
        canEditFinancials: false,
        canViewReports: false,
        canExportData: false
      },
      production: {
        canViewCustomers: false,
        canEditCustomers: false,
        canViewOrders: true,
        canEditOrders: false,
        canViewInventory: true,
        canEditInventory: true,
        canViewProduction: true,
        canEditProduction: true,
        canViewAnalytics: false,
        canManageUsers: false,
        canViewFinancials: false,
        canEditFinancials: false,
        canViewReports: false,
        canExportData: false
      },
      logistics: {
        canViewCustomers: false,
        canEditCustomers: false,
        canViewOrders: true,
        canEditOrders: false,
        canViewInventory: true,
        canEditInventory: true,
        canViewProduction: false,
        canEditProduction: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canViewFinancials: false,
        canEditFinancials: false,
        canViewReports: false,
        canExportData: false
      },
      viewer: {
        canViewCustomers: true,
        canEditCustomers: false,
        canViewOrders: true,
        canEditOrders: false,
        canViewInventory: true,
        canEditInventory: false,
        canViewProduction: true,
        canEditProduction: false,
        canViewAnalytics: true,
        canManageUsers: false,
        canViewFinancials: false,
        canEditFinancials: false,
        canViewReports: false,
        canExportData: false
      }
    }

    return rolePermissions[role] || rolePermissions.viewer
  }

  /**
   * Clear user context (for logout)
   */
  clear(): void {
    this.userContext = null
  }
}

/**
 * Helper function to get user context from request
 */
export async function getUserContextFromRequest(): Promise<UserContext | null> {
  const supabase = await createSupabaseServerClient()
  const userContextService = UserContextService.getInstance()
  return await userContextService.initialize(supabase)
}

/**
 * Helper function to validate user access
 */
export async function validateUserAccess(
  table: string,
  resourceId: string,
  requiredPermission?: string
): Promise<{ hasAccess: boolean; userContext: UserContext | null }> {
  const userContext = await getUserContextFromRequest()
  
  if (!userContext) {
    return { hasAccess: false, userContext: null }
  }

  // Check permission if required
  if (requiredPermission && !userContext.permissions[requiredPermission]) {
    return { hasAccess: false, userContext }
  }

  // Validate resource access
  const supabase = await createSupabaseServerClient()
  const userContextService = UserContextService.getInstance()
  const hasAccess = await userContextService.validateAccess(supabase, table, resourceId)

  return { hasAccess, userContext }
}
