// 🚀 TEAM MANAGEMENT API
// Main API route for team management operations

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClientWithJWT } from '@/lib/supabase/server-with-jwt'
import { teamManagementService } from '@/lib/services/TeamManagementService'
import { withErrorHandling, handleApiError, AuthenticationError, ValidationError } from '@/lib/middleware/errorHandler'
import { logger } from '@/lib/services/LoggingService'
import { z } from 'zod'

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const CreateTeamSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  parent_team_id: z.string().uuid().optional(),
  is_public: z.boolean().default(false),
  allow_self_join: z.boolean().default(false),
  require_approval: z.boolean().default(true),
  max_members: z.number().min(1).max(1000).default(100),
  industry: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).default([])
})

const UpdateTeamSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  is_public: z.boolean().optional(),
  allow_self_join: z.boolean().optional(),
  require_approval: z.boolean().optional(),
  max_members: z.number().min(1).max(1000).optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'archived', 'suspended']).optional()
})

const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['super_admin', 'admin', 'team_owner', 'team_manager', 'team_lead', 'senior_member', 'member', 'viewer', 'guest']),
  message: z.string().optional(),
  permissions: z.object({
    can_invite_members: z.boolean().optional(),
    can_remove_members: z.boolean().optional(),
    can_edit_team: z.boolean().optional(),
    can_manage_projects: z.boolean().optional(),
    can_view_analytics: z.boolean().optional(),
    can_manage_finances: z.boolean().optional()
  }).optional()
})

const CreateProjectSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  project_type: z.enum(['general', 'client_project', 'internal', 'research', 'development']).default('general'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  tags: z.array(z.string()).default([]),
  budget: z.number().positive().optional()
})

// =====================================================
// API HANDLERS
// =====================================================

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    // DEVELOPMENT MODE: Skip authentication for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let user;
    if (isDevelopment) {
      // Create a mock user for development
      user = {
        id: 'c5e33bb2-4811-4042-bd4e-97b1ffec7c38', // Use existing UUID from test data
        email: 'dev@example.com',
        user_metadata: { role: 'admin' }
      };
    } else {
      const { client: supabase, user: authUser, error: authError } = await createSupabaseClientWithJWT(request)
      
      if (authError || !authUser) {
        throw new AuthenticationError('Unauthorized')
      }
      user = authUser;
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'get-user-teams':
        const teams = await teamManagementService.getUserTeams(user.id)
        return NextResponse.json({ success: true, data: teams })

      case 'get-team':
        const teamId = searchParams.get('teamId')
        if (!teamId) {
          throw new ValidationError('Team ID is required')
        }
        
        const includeRelations = searchParams.get('include')?.split(',') || []
        const team = await teamManagementService.getTeam(teamId, includeRelations)
        return NextResponse.json({ success: true, data: team })

      case 'get-team-metrics':
        const metricsTeamId = searchParams.get('teamId')
        if (!metricsTeamId) {
          throw new ValidationError('Team ID is required')
        }
        
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined
        
        const metrics = await teamManagementService.getTeamPerformanceMetrics(metricsTeamId, dateRange)
        return NextResponse.json({ success: true, data: metrics })

      case 'get-team-activity':
        const activityTeamId = searchParams.get('teamId')
        if (!activityTeamId) {
          throw new ValidationError('Team ID is required')
        }
        
        const activityOptions = {
          activityType: searchParams.get('activityType') || undefined,
          userId: searchParams.get('userId') || undefined,
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0')
        }
        
        const activityLogs = await teamManagementService.getTeamActivityLogs(activityTeamId, activityOptions)
        return NextResponse.json({ success: true, data: activityLogs })

      default:
        throw new ValidationError('Invalid action parameter')
    }
  } catch (error) {
    return handleApiError(error)
  }
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const { client: supabase, user, error: authError } = await createSupabaseClientWithJWT(request)
    
    if (authError || !user) {
      throw new AuthenticationError('Unauthorized')
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    switch (action) {
      case 'create-team':
        const createTeamData = CreateTeamSchema.parse(body)
        const team = await teamManagementService.createTeam(createTeamData, user.id)
        return NextResponse.json({ success: true, data: team })

      case 'update-team':
        const teamId = searchParams.get('teamId')
        if (!teamId) {
          throw new ValidationError('Team ID is required')
        }
        
        const updateTeamData = UpdateTeamSchema.parse(body)
        const updatedTeam = await teamManagementService.updateTeam(teamId, updateTeamData, user.id)
        return NextResponse.json({ success: true, data: updatedTeam })

      case 'invite-member':
        const inviteTeamId = searchParams.get('teamId')
        if (!inviteTeamId) {
          throw new ValidationError('Team ID is required')
        }
        
        const inviteData = InviteMemberSchema.parse(body)
        const invitation = await teamManagementService.inviteTeamMember(inviteTeamId, inviteData, user.id)
        return NextResponse.json({ success: true, data: invitation })

      case 'create-project':
        const projectTeamId = searchParams.get('teamId')
        if (!projectTeamId) {
          throw new ValidationError('Team ID is required')
        }
        
        const projectData = CreateProjectSchema.parse(body)
        const project = await teamManagementService.createTeamProject(projectTeamId, projectData, user.id)
        return NextResponse.json({ success: true, data: project })

      case 'accept-invitation':
        const invitationId = searchParams.get('invitationId')
        if (!invitationId) {
          throw new ValidationError('Invitation ID is required')
        }
        
        const member = await teamManagementService.acceptTeamInvitation(invitationId, user.id)
        return NextResponse.json({ success: true, data: member })

      default:
        throw new ValidationError('Invalid action parameter')
    }
  } catch (error) {
    return handleApiError(error)
  }
})

export const PUT = withErrorHandling(async (request: NextRequest) => {
  try {
    const { client: supabase, user, error: authError } = await createSupabaseClientWithJWT(request)
    
    if (authError || !user) {
      throw new AuthenticationError('Unauthorized')
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    switch (action) {
      case 'update-member-permissions':
        const teamId = searchParams.get('teamId')
        const memberUserId = searchParams.get('userId')
        
        if (!teamId || !memberUserId) {
          throw new ValidationError('Team ID and User ID are required')
        }
        
        const permissions = body.permissions
        if (!permissions) {
          throw new ValidationError('Permissions are required')
        }
        
        const updatedMember = await teamManagementService.updateTeamMemberPermissions(
          teamId,
          memberUserId,
          permissions,
          user.id
        )
        return NextResponse.json({ success: true, data: updatedMember })

      default:
        throw new ValidationError('Invalid action parameter')
    }
  } catch (error) {
    return handleApiError(error)
  }
})

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  try {
    const { client: supabase, user, error: authError } = await createSupabaseClientWithJWT(request)
    
    if (authError || !user) {
      throw new AuthenticationError('Unauthorized')
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'remove-member':
        const teamId = searchParams.get('teamId')
        const memberUserId = searchParams.get('userId')
        
        if (!teamId || !memberUserId) {
          throw new ValidationError('Team ID and User ID are required')
        }
        
        await teamManagementService.removeTeamMember(teamId, memberUserId, user.id)
        return NextResponse.json({ success: true, message: 'Team member removed successfully' })

      default:
        throw new ValidationError('Invalid action parameter')
    }
  } catch (error) {
    return handleApiError(error)
  }
})
