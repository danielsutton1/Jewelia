import { createClient } from '@supabase/supabase-js'
import { 
  JewelryUserRole, 
  Permission, 
  UserPermission, 
  RolePermission, 
  UserProfile,
  Department,
  Team,
  TeamMember,
  AuditLog,
  SecurityEvent,
  AccessAttempt,
  PermissionCheck,
  UserPermissions,
  CreateUserRequest,
  UpdateUserRoleRequest,
  GrantPermissionRequest,
  RevokePermissionRequest,
  CreateTeamRequest,
  InviteTeamMemberRequest,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS
} from '../../types/rbac'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class RBACService {
  private readonly tableName = 'user_profiles'

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    permissionName: string,
    resourceType: string = 'global',
    resourceId?: string
  ): Promise<boolean> {
    try {
      console.log('🔐 Checking permission:', { userId, permissionName, resourceType, resourceId })
      
      const { data, error } = await supabase.rpc('user_has_permission', {
        user_id: userId,
        permission_name: permissionName,
        resource_type: resourceType,
        resource_id: resourceId
      })

      if (error) {
        console.error('❌ Permission check error:', error)
        return false
      }

      const hasPermission = data as boolean
      console.log('✅ Permission check result:', hasPermission)

      // Log access attempt
      await this.logAccessAttempt(
        userId,
        resourceType,
        resourceId,
        permissionName,
        hasPermission
      )

      return hasPermission
    } catch (error) {
      console.error('❌ Permission check failed:', error)
      return false
    }
  }

  /**
   * Get user's role
   */
  async getUserRole(userId: string): Promise<JewelryUserRole | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('❌ Get user role error:', error)
        return null
      }

      return data?.role || null
    } catch (error) {
      console.error('❌ Get user role failed:', error)
      return null
    }
  }

  /**
   * Get user's complete permissions
   */
  async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (profileError || !profile) {
        console.error('❌ Get user profile error:', profileError)
        return null
      }

      // Get role permissions
      const { data: rolePermissions, error: roleError } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions (*)
        `)
        .eq('role', profile.role)
        .eq('is_active', true)

      if (roleError) {
        console.error('❌ Get role permissions error:', roleError)
        return null
      }

      // Get custom user permissions
      const { data: userPermissions, error: userError } = await supabase
        .from('user_permissions')
        .select(`
          *,
          permissions (*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)

      if (userError) {
        console.error('❌ Get user permissions error:', userError)
        return null
      }

      // Get department permissions (if user has department)
      let departmentPermissions: Permission[] = []
      if (profile.department_id) {
        const { data: deptPerms, error: deptError } = await supabase
          .from('role_permissions')
          .select(`
            permission_id,
            permissions (*)
          `)
          .eq('role', profile.role)
          .eq('is_active', true)

        if (!deptError && deptPerms) {
          departmentPermissions = deptPerms.map(rp => rp.permissions).flat().filter(Boolean)
        }
      }

      // Get team permissions (if user is in teams)
      let teamPermissions: Permission[] = []
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (!teamError && teamMembers && teamMembers.length > 0) {
        const teamIds = teamMembers.map(tm => tm.team_id)
        const { data: teamPerms, error: teamPermError } = await supabase
          .from('role_permissions')
          .select(`
            permission_id,
            permissions (*)
          `)
          .eq('role', profile.role)
          .eq('is_active', true)

        if (!teamPermError && teamPerms) {
          teamPermissions = teamPerms.map(rp => rp.permissions).flat().filter(Boolean)
        }
      }

      // Combine all permissions
      const rolePerms = rolePermissions?.map(rp => rp.permissions).flat().filter(Boolean) || []
      const customPerms = userPermissions?.map(up => up.permissions).flat().filter(Boolean) || []
      
      // Create effective permissions (role + custom + department + team)
      const effectivePermissions = [
        ...rolePerms,
        ...customPerms,
        ...departmentPermissions,
        ...teamPermissions
      ]

      // Remove duplicates
      const uniquePermissions = effectivePermissions.filter((permission, index, self) =>
        index === self.findIndex(p => p.id === permission.id)
      )

      return {
        role: profile.role,
        permissions: rolePerms,
        custom_permissions: userPermissions || [],
        department_permissions: departmentPermissions,
        team_permissions: teamPermissions,
        effective_permissions: uniquePermissions
      }
    } catch (error) {
      console.error('❌ Get user permissions failed:', error)
      return null
    }
  }

  /**
   * Create new user with role
   */
  async createUser(userData: CreateUserRequest): Promise<UserProfile | null> {
    try {
      console.log('👤 Creating user:', userData)

      // First create the auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      })

      if (authError || !authUser.user) {
        console.error('❌ Create auth user error:', authError)
        throw new Error('Failed to create user account')
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authUser.user.id,
          role: userData.role,
          department_id: userData.department_id,
          manager_id: userData.manager_id,
          employee_id: userData.employee_id,
          hire_date: userData.hire_date,
          is_active: true
        }])
        .select()
        .single()

      if (profileError) {
        console.error('❌ Create user profile error:', profileError)
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authUser.user.id)
        throw new Error('Failed to create user profile')
      }

      // Log the user creation
      await this.logSecurityEvent(
        authUser.user.id,
        'user_created',
        'high',
        `User created with role: ${userData.role}`,
        { role: userData.role, department_id: userData.department_id }
      )

      console.log('✅ User created successfully:', profile)
      return profile
    } catch (error) {
      console.error('❌ Create user failed:', error)
      throw error
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(request: UpdateUserRoleRequest): Promise<boolean> {
    try {
      console.log('🔄 Updating user role:', request)

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          role: request.role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', request.user_id)
        .eq('is_active', true)

      if (error) {
        console.error('❌ Update user role error:', error)
        return false
      }

      // Log the role change
      await this.logSecurityEvent(
        request.user_id,
        'role_changed',
        'high',
        `User role changed to: ${request.role}`,
        { 
          new_role: request.role, 
          reason: request.reason,
          expires_at: request.expires_at 
        }
      )

      console.log('✅ User role updated successfully')
      return true
    } catch (error) {
      console.error('❌ Update user role failed:', error)
      return false
    }
  }

  /**
   * Grant custom permission to user
   */
  async grantPermission(request: GrantPermissionRequest): Promise<boolean> {
    try {
      console.log('🔓 Granting permission:', request)

      const { data, error } = await supabase
        .from('user_permissions')
        .insert([{
          user_id: request.user_id,
          permission_id: request.permission_id,
          reason: request.reason,
          expires_at: request.expires_at,
          is_active: true
        }])

      if (error) {
        console.error('❌ Grant permission error:', error)
        return false
      }

      // Log the permission grant
      await this.logSecurityEvent(
        request.user_id,
        'permission_granted',
        'medium',
        `Custom permission granted`,
        { 
          permission_id: request.permission_id,
          reason: request.reason,
          expires_at: request.expires_at 
        }
      )

      console.log('✅ Permission granted successfully')
      return true
    } catch (error) {
      console.error('❌ Grant permission failed:', error)
      return false
    }
  }

  /**
   * Revoke custom permission from user
   */
  async revokePermission(request: RevokePermissionRequest): Promise<boolean> {
    try {
      console.log('🔒 Revoking permission:', request)

      const { data, error } = await supabase
        .from('user_permissions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', request.user_id)
        .eq('permission_id', request.permission_id)
        .eq('is_active', true)

      if (error) {
        console.error('❌ Revoke permission error:', error)
        return false
      }

      // Log the permission revocation
      await this.logSecurityEvent(
        request.user_id,
        'permission_revoked',
        'medium',
        `Custom permission revoked`,
        { 
          permission_id: request.permission_id,
          reason: request.reason 
        }
      )

      console.log('✅ Permission revoked successfully')
      return true
    } catch (error) {
      console.error('❌ Revoke permission failed:', error)
      return false
    }
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Get permissions error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Get permissions failed:', error)
      return []
    }
  }

  /**
   * Get all departments
   */
  async getDepartments(): Promise<Department[]> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Get departments error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Get departments failed:', error)
      return []
    }
  }

  /**
   * Get all teams
   */
  async getTeams(): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          departments (name),
          team_members (user_id, role)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Get teams error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Get teams failed:', error)
      return []
    }
  }

  /**
   * Create team
   */
  async createTeam(request: CreateTeamRequest): Promise<Team | null> {
    try {
      console.log('👥 Creating team:', request)

      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: request.name,
          description: request.description,
          department_id: request.department_id,
          team_lead_id: request.team_lead_id,
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Create team error:', error)
        return null
      }

      // Add team members if provided
      if (request.members && request.members.length > 0) {
        const memberInserts = request.members.map(memberId => ({
          team_id: data.id,
          user_id: memberId,
          role: 'member' as JewelryUserRole,
          is_active: true
        }))

        const { error: membersError } = await supabase
          .from('team_members')
          .insert(memberInserts)

        if (membersError) {
          console.error('❌ Add team members error:', membersError)
        }
      }

      console.log('✅ Team created successfully:', data)
      return data
    } catch (error) {
      console.error('❌ Create team failed:', error)
      return null
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(
    limit: number = 100,
    offset: number = 0,
    userId?: string,
    action?: string
  ): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (action) {
        query = query.eq('action', action)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Get audit logs error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Get audit logs failed:', error)
      return []
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(
    limit: number = 100,
    offset: number = 0,
    severity?: string
  ): Promise<SecurityEvent[]> {
    try {
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (severity) {
        query = query.eq('severity', severity)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Get security events error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Get security events failed:', error)
      return []
    }
  }

  /**
   * Log access attempt
   */
  private async logAccessAttempt(
    userId: string,
    resourceType: string,
    resourceId: string | undefined,
    permissionRequired: string,
    accessGranted: boolean
  ): Promise<void> {
    try {
      await supabase.rpc('log_access_attempt', {
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
        permission_required: permissionRequired,
        access_granted: accessGranted
      })
    } catch (error) {
      console.error('❌ Log access attempt failed:', error)
    }
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    userId: string,
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('security_events')
        .insert([{
          user_id: userId,
          event_type: eventType,
          severity: severity,
          description: description,
          metadata: metadata
        }])
    } catch (error) {
      console.error('❌ Log security event failed:', error)
    }
  }

  /**
   * Get role information
   */
  getRoleInfo(role: JewelryUserRole) {
    return {
      role,
      level: ROLE_HIERARCHY[role],
      display_name: ROLE_DISPLAY_NAMES[role],
      description: ROLE_DESCRIPTIONS[role],
      color: ROLE_COLORS[role],
      icon: this.getRoleIcon(role),
      permissions_count: 0 // Will be populated when needed
    }
  }

  /**
   * Get role icon
   */
  private getRoleIcon(role: JewelryUserRole): string {
    const iconMap: Record<JewelryUserRole, string> = {
      store_owner: '👑',
      store_manager: '👔',
      assistant_manager: '👨‍💼',
      senior_sales_associate: '💎',
      sales_associate: '💍',
      customer_service_rep: '📞',
      jewelry_designer: '🎨',
      goldsmith: '🔨',
      jeweler: '⚒️',
      appraiser: '🔍',
      inventory_manager: '📦',
      bookkeeper: '📊',
      accountant: '💰',
      system_admin: '⚙️',
      viewer: '👁️',
      guest: '👋'
    }
    return iconMap[role] || '👤'
  }

  /**
   * Check if user can manage another user
   */
  async canManageUser(managerId: string, targetUserId: string): Promise<boolean> {
    try {
      const managerRole = await this.getUserRole(managerId)
      const targetRole = await this.getUserRole(targetUserId)

      if (!managerRole || !targetRole) {
        return false
      }

      const managerLevel = ROLE_HIERARCHY[managerRole]
      const targetLevel = ROLE_HIERARCHY[targetRole]

      // Can only manage users with lower or equal role level
      return managerLevel >= targetLevel
    } catch (error) {
      console.error('❌ Can manage user check failed:', error)
      return false
    }
  }
}
