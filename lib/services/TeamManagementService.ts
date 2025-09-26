// 🚀 TEAM MANAGEMENT SERVICE
// Comprehensive service for enterprise team management and collaboration

import { createClient } from '@supabase/supabase-js'
import { 
  Team, 
  TeamMember, 
  TeamInvitation, 
  TeamProject, 
  ProjectMember,
  TeamWorkspace,
  WorkspaceMember,
  TeamNetworkConnection,
  TeamSharedResource,
  TeamPerformanceMetrics,
  TeamActivityLog,
  BulkOperation,
  BulkOperationItem,
  TeamSecurityPolicy,
  TeamComplianceAudit,
  CreateTeamRequest,
  UpdateTeamRequest,
  InviteTeamMemberRequest,
  CreateTeamProjectRequest,
  UpdateTeamProjectRequest,
  BulkUserOperationRequest,
  EnhancedUserRole,
  TeamStatus,
  ProjectStatus,
  InvitationStatus,
  BulkOperationStatus
} from '@/types/team-management'
import { logger } from './LoggingService'

// =====================================================
// SERVICE CONFIGURATION
// =====================================================

const TEAM_CONFIG = {
  // Default team settings
  DEFAULT_MAX_MEMBERS: 100,
  DEFAULT_INVITATION_EXPIRY_DAYS: 7,
  
  // Team hierarchy limits
  MAX_TEAM_LEVEL: 5,
  MAX_SUB_TEAMS: 10,
  
  // Performance thresholds
  MAX_PROJECTS_PER_TEAM: 50,
  MAX_WORKSPACES_PER_TEAM: 20,
  
  // Bulk operation limits
  MAX_BULK_OPERATION_ITEMS: 1000,
  BULK_OPERATION_BATCH_SIZE: 100
}

// =====================================================
// TEAM MANAGEMENT SERVICE CLASS
// =====================================================

export class TeamManagementService {
  private supabase: any
  private isInitialized: boolean = false

  constructor() {
    this.supabase = null
    this.initializeService()
  }

  private async initializeService() {
    try {
      // Initialize Supabase client
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      this.isInitialized = true
      logger.info('TeamManagementService initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize TeamManagementService', error)
      throw error
    }
  }

  // =====================================================
  // TEAM MANAGEMENT METHODS
  // =====================================================

  /**
   * Create a new team
   */
  async createTeam(request: CreateTeamRequest, creatorId: string): Promise<Team> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Validate team slug uniqueness
      const { data: existingTeam } = await this.supabase
        .from('teams')
        .select('id')
        .eq('slug', request.slug)
        .single()

      if (existingTeam) {
        throw new Error('Team slug already exists')
      }

      // Create team
      const { data: team, error } = await this.supabase
        .from('teams')
        .insert([{
          ...request,
          owner_id: creatorId,
          created_by: creatorId,
          team_level: request.parent_team_id ? 2 : 1
        }])
        .select()
        .single()

      if (error) throw error

      // Add creator as team owner
      await this.addTeamMember(team.id, creatorId, 'team_owner', {
        can_invite_members: true,
        can_remove_members: true,
        can_edit_team: true,
        can_manage_projects: true,
        can_view_analytics: true,
        can_manage_finances: true
      })

      // Log activity
      await this.logTeamActivity(team.id, 'team_created', {
        team_name: team.name,
        creator_id: creatorId
      })

      logger.info('Team created successfully', { team_id: team.id, creator_id: creatorId })
      return team
    } catch (error) {
      logger.error('Failed to create team', error)
      throw error
    }
  }

  /**
   * Update team information
   */
  async updateTeam(teamId: string, request: UpdateTeamRequest, updaterId: string): Promise<Team> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Check if user has permission to edit team
      const hasPermission = await this.checkTeamPermission(teamId, updaterId, 'can_edit_team')
      if (!hasPermission) {
        throw new Error('Insufficient permissions to edit team')
      }

      // Update team
      const { data: team, error } = await this.supabase
        .from('teams')
        .update({
          ...request,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await this.logTeamActivity(teamId, 'team_settings_updated', {
        updater_id: updaterId,
        changes: request
      })

      logger.info('Team updated successfully', { team_id: teamId, updater_id: updaterId })
      return team
    } catch (error) {
      logger.error('Failed to update team', error)
      throw error
    }
  }

  /**
   * Get team by ID with optional relations
   */
  async getTeam(teamId: string, includeRelations: string[] = []): Promise<Team> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // For now, just get the basic team info
      // We'll add relations later when foreign keys are properly set up
      const { data: team, error } = await this.supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (error) throw error
      return team
    } catch (error) {
      logger.error('Failed to get team', error)
      throw error
    }
  }

  /**
   * Get all teams for a user
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // For now, just get all teams where the user is the owner
      // This is a simplified approach until we set up proper foreign key relationships
      const { data: teams, error } = await this.supabase
        .from('teams')
        .select('*')
        .eq('owner_id', userId)

      if (error) throw error
      return teams || []
    } catch (error) {
      logger.error('Failed to get user teams', error)
      throw error
    }
  }

  // =====================================================
  // TEAM MEMBER MANAGEMENT METHODS
  // =====================================================

  /**
   * Add a member to a team
   */
  async addTeamMember(
    teamId: string, 
    userId: string, 
    role: EnhancedUserRole,
    permissions: {
      can_invite_members?: boolean
      can_remove_members?: boolean
      can_edit_team?: boolean
      can_manage_projects?: boolean
      can_view_analytics?: boolean
      can_manage_finances?: boolean
    } = {}
  ): Promise<TeamMember> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Check if user is already a member
      const { data: existingMember } = await this.supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        throw new Error('User is already a team member')
      }

      // Add team member
      const { data: member, error } = await this.supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: userId,
          role,
          status: 'active',
          joined_at: new Date().toISOString(),
          ...permissions
        }])
        .select()
        .single()

      if (error) throw error

      // Log activity
      await this.logTeamActivity(teamId, 'member_joined', {
        user_id: userId,
        role,
        permissions
      })

      logger.info('Team member added successfully', { team_id: teamId, user_id: userId, role })
      return member
    } catch (error) {
      logger.error('Failed to add team member', error)
      throw error
    }
  }

  /**
   * Remove a member from a team
   */
  async removeTeamMember(teamId: string, userId: string, removerId: string): Promise<void> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Check if remover has permission
      const hasPermission = await this.checkTeamPermission(teamId, removerId, 'can_remove_members')
      if (!hasPermission) {
        throw new Error('Insufficient permissions to remove team member')
      }

      // Remove team member
      const { error } = await this.supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error

      // Log activity
      await this.logTeamActivity(teamId, 'member_left', {
        user_id: userId,
        removed_by: removerId
      })

      logger.info('Team member removed successfully', { team_id: teamId, user_id: userId, remover_id: removerId })
    } catch (error) {
      logger.error('Failed to remove team member', error)
      throw error
    }
  }

  /**
   * Update team member permissions
   */
  async updateTeamMemberPermissions(
    teamId: string,
    userId: string,
    permissions: Partial<Pick<TeamMember, 'can_invite_members' | 'can_remove_members' | 'can_edit_team' | 'can_manage_projects' | 'can_view_analytics' | 'can_manage_finances'>>,
    updaterId: string
  ): Promise<TeamMember> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Check if updater has permission
      const hasPermission = await this.checkTeamPermission(teamId, updaterId, 'can_edit_team')
      if (!hasPermission) {
        throw new Error('Insufficient permissions to update team member')
      }

      // Update permissions
      const { data: member, error } = await this.supabase
        .from('team_members')
        .update({
          ...permissions,
          updated_at: new Date().toISOString()
        })
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await this.logTeamActivity(teamId, 'permission_changed', {
        user_id: userId,
        updated_by: updaterId,
        changes: permissions
      })

      logger.info('Team member permissions updated', { team_id: teamId, user_id: userId, updater_id: updaterId })
      return member
    } catch (error) {
      logger.error('Failed to update team member permissions', error)
      throw error
    }
  }

  // =====================================================
  // TEAM INVITATION METHODS
  // =====================================================

  /**
   * Invite a user to join a team
   */
  async inviteTeamMember(
    teamId: string,
    request: InviteTeamMemberRequest,
    inviterId: string
  ): Promise<TeamInvitation> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Check if inviter has permission
      const hasPermission = await this.checkTeamPermission(teamId, inviterId, 'can_invite_members')
      if (!hasPermission) {
        throw new Error('Insufficient permissions to invite team members')
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await this.supabase
        .from('team_invitations')
        .select('id, status')
        .eq('team_id', teamId)
        .eq('email', request.email)
        .single()

      if (existingInvitation && existingInvitation.status === 'pending') {
        throw new Error('Invitation already sent to this email')
      }

      // Create invitation
      const { data: invitation, error } = await this.supabase
        .from('team_invitations')
        .insert([{
          team_id: teamId,
          email: request.email,
          role: request.role,
          message: request.message,
          invited_by: inviterId,
          expires_at: new Date(Date.now() + TEAM_CONFIG.DEFAULT_INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Log activity
      await this.logTeamActivity(teamId, 'invitation_sent', {
        email: request.email,
        role: request.role,
        inviter_id: inviterId
      })

      logger.info('Team invitation sent successfully', { team_id: teamId, email: request.email, inviter_id: inviterId })
      return invitation
    } catch (error) {
      logger.error('Failed to send team invitation', error)
      throw error
    }
  }

  /**
   * Accept a team invitation
   */
  async acceptTeamInvitation(invitationId: string, userId: string): Promise<TeamMember> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Get invitation
      const { data: invitation, error: invitationError } = await this.supabase
        .from('team_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single()

      if (invitationError || !invitation) {
        throw new Error('Invitation not found or already processed')
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired')
      }

      // Update invitation status
      const { error: updateError } = await this.supabase
        .from('team_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: userId
        })
        .eq('id', invitationId)

      if (updateError) throw updateError

      // Add user to team
      const member = await this.addTeamMember(
        invitation.team_id,
        userId,
        invitation.role
      )

      logger.info('Team invitation accepted successfully', { invitation_id: invitationId, user_id: userId })
      return member
    } catch (error) {
      logger.error('Failed to accept team invitation', error)
      throw error
    }
  }

  // =====================================================
  // TEAM PROJECT MANAGEMENT METHODS
  // =====================================================

  /**
   * Create a new team project
   */
  async createTeamProject(
    teamId: string,
    request: CreateTeamProjectRequest,
    creatorId: string
  ): Promise<TeamProject> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Check if creator has permission
      const hasPermission = await this.checkTeamPermission(teamId, creatorId, 'can_manage_projects')
      if (!hasPermission) {
        throw new Error('Insufficient permissions to create projects')
      }

      // Create project
      const { data: project, error } = await this.supabase
        .from('team_projects')
        .insert([{
          ...request,
          team_id: teamId,
          owner_id: creatorId,
          created_by: creatorId
        }])
        .select()
        .single()

      if (error) throw error

      // Add creator as project owner
      await this.addProjectMember(project.id, creatorId, 'owner')

      // Log activity
      await this.logTeamActivity(teamId, 'project_created', {
        project_id: project.id,
        project_name: project.name,
        creator_id: creatorId
      })

      logger.info('Team project created successfully', { project_id: project.id, team_id: teamId, creator_id: creatorId })
      return project
    } catch (error) {
      logger.error('Failed to create team project', error)
      throw error
    }
  }

  /**
   * Add member to project
   */
  async addProjectMember(
    projectId: string,
    userId: string,
    role: string,
    responsibilities: string[] = []
  ): Promise<ProjectMember> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Check if user is already a project member
      const { data: existingMember } = await this.supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        throw new Error('User is already a project member')
      }

      // Add project member
      const { data: member, error } = await this.supabase
        .from('project_members')
        .insert([{
          project_id: projectId,
          user_id: userId,
          role,
          responsibilities,
          status: 'active',
          joined_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      logger.info('Project member added successfully', { project_id: projectId, user_id: userId, role })
      return member
    } catch (error) {
      logger.error('Failed to add project member', error)
      throw error
    }
  }

  // =====================================================
  // TEAM ANALYTICS AND PERFORMANCE METHODS
  // =====================================================

  /**
   * Get team performance metrics
   */
  async getTeamPerformanceMetrics(teamId: string, dateRange?: { start: string; end: string }): Promise<TeamPerformanceMetrics[]> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      let query = this.supabase
        .from('team_performance_metrics')
        .select('*')
        .eq('team_id', teamId)
        .order('metric_date', { ascending: false })

      if (dateRange) {
        query = query.gte('metric_date', dateRange.start).lte('metric_date', dateRange.end)
      }

      const { data: metrics, error } = await query

      if (error) throw error
      return metrics || []
    } catch (error) {
      logger.error('Failed to get team performance metrics', error)
      throw error
    }
  }

  /**
   * Get team activity logs
   */
  async getTeamActivityLogs(
    teamId: string,
    options: {
      activityType?: string
      userId?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<TeamActivityLog[]> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      let query = this.supabase
        .from('team_activity_logs')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (options.activityType) {
        query = query.eq('activity_type', options.activityType)
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data: logs, error } = await query

      if (error) throw error
      return logs || []
    } catch (error) {
      logger.error('Failed to get team activity logs', error)
      throw error
    }
  }

  // =====================================================
  // BULK OPERATIONS METHODS
  // =====================================================

  /**
   * Execute bulk user operation
   */
  async executeBulkOperation(request: BulkUserOperationRequest, initiatorId: string): Promise<BulkOperation> {
    try {
      if (!this.isInitialized) throw new Error('Service not initialized')

      // Validate request size
      if (request.users.length > TEAM_CONFIG.MAX_BULK_OPERATION_ITEMS) {
        throw new Error(`Too many users. Maximum allowed: ${TEAM_CONFIG.MAX_BULK_OPERATION_ITEMS}`)
      }

      // Create bulk operation record
      const { data: bulkOp, error: createError } = await this.supabase
        .from('bulk_operations')
        .insert([{
          operation_type: request.operation_type,
          description: request.description,
          total_items: request.users.length,
          initiated_by: initiatorId
        }])
        .select()
        .single()

      if (createError) throw createError

      // Process users in batches
      const batchSize = TEAM_CONFIG.BULK_OPERATION_BATCH_SIZE
      let processedItems = 0
      let successfulItems = 0
      let failedItems = 0

      for (let i = 0; i < request.users.length; i += batchSize) {
        const batch = request.users.slice(i, i + batchSize)
        
        for (const user of batch) {
          try {
            await this.processBulkOperationItem(bulkOp.id, user, request.operation_type)
            successfulItems++
          } catch (error) {
            failedItems++
            logger.error('Bulk operation item failed', { user, error })
          }
          processedItems++
        }

        // Update progress
        await this.updateBulkOperationProgress(bulkOp.id, processedItems, successfulItems, failedItems)
      }

      // Mark operation as completed
      const { data: completedOp, error: updateError } = await this.supabase
        .from('bulk_operations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          processed_items: processedItems,
          successful_items: successfulItems,
          failed_items: failedItems
        })
        .eq('id', bulkOp.id)
        .select()
        .single()

      if (updateError) throw updateError

      logger.info('Bulk operation completed successfully', { 
        operation_id: bulkOp.id, 
        total: processedItems, 
        successful: successfulItems, 
        failed: failedItems 
      })

      return completedOp
    } catch (error) {
      logger.error('Failed to execute bulk operation', error)
      throw error
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if user has specific team permission
   */
  private async checkTeamPermission(teamId: string, userId: string, permission: string): Promise<boolean> {
    try {
      const { data: member } = await this.supabase
        .from('team_members')
        .select(permission)
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      return member?.[permission] || false
    } catch (error) {
      return false
    }
  }

  /**
   * Log team activity
   */
  private async logTeamActivity(
    teamId: string,
    activityType: string,
    activityData: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase
        .from('team_activity_logs')
        .insert([{
          team_id: teamId,
          activity_type: activityType,
          activity_data: activityData
        }])
    } catch (error) {
      logger.error('Failed to log team activity', error)
    }
  }

  /**
   * Process individual bulk operation item
   */
  private async processBulkOperationItem(
    bulkOpId: string,
    user: any,
    operationType: string
  ): Promise<void> {
    // Implementation depends on operation type
    switch (operationType) {
      case 'user_import':
        // Import user logic
        break
      case 'team_assignment':
        // Team assignment logic
        break
      default:
        throw new Error(`Unsupported operation type: ${operationType}`)
    }
  }

  /**
   * Update bulk operation progress
   */
  private async updateBulkOperationProgress(
    bulkOpId: string,
    processed: number,
    successful: number,
    failed: number
  ): Promise<void> {
    try {
      await this.supabase
        .from('bulk_operations')
        .update({
          processed_items: processed,
          successful_items: successful,
          failed_items: failed
        })
        .eq('id', bulkOpId)
    } catch (error) {
      logger.error('Failed to update bulk operation progress', error)
    }
  }
}

// Export singleton instance
export const teamManagementService = new TeamManagementService()
