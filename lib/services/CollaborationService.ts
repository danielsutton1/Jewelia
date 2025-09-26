import { createSupabaseServerClient } from '@/lib/supabase/server'
import { 
  Project, 
  ProjectTask, 
  ProjectCollaborator, 
  ProjectFile, 
  TimeEntry,
  ProjectActivity,
  ProjectTemplate
} from '@/types/collaboration'

export class CollaborationService {
  private supabase: any = null

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // =====================================================
  // PROJECT MANAGEMENT
  // =====================================================

  async createProject(userId: string, projectData: Partial<Project>): Promise<Project | null> {
    try {
      const supabase = await this.getSupabase()
      
      const project = {
        title: projectData.title || 'Untitled Project',
        description: projectData.description || '',
        type: projectData.type || 'custom_design',
        status: 'draft',
        priority: projectData.priority || 'medium',
        owner_id: userId,
        budget: projectData.budget,
        due_date: projectData.due_date,
        currency: projectData.currency || 'USD',
        progress_percentage: 0,
        time_logged: 0,
        tags: projectData.tags || [],
        category: projectData.category || 'General',
        requirements: [],
        deliverables: [],
        milestones: [],
        tasks: [],
        files: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      }

      const { data: newProject, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        return null
      }

      // Add owner as collaborator
      await this.addCollaborator(newProject.id, userId, 'owner')

      // Log activity
      await this.logActivity(newProject.id, userId, 'created', 'project', newProject.id, `Created project "${project.title}"`)

      return newProject
    } catch (error) {
      console.error('Error in createProject:', error)
      return null
    }
  }

  async getUserProjects(userId: string, filters?: {
    status?: string
    type?: string
    role?: string
    limit?: number
  }): Promise<Project[]> {
    try {
      const supabase = await this.getSupabase()
      
      let query = supabase
        .from('projects')
        .select(`
          *,
          collaborators:project_collaborators(
            id,
            role,
            status,
            user:users(id, name, email, avatar_url)
          )
        `)

      // Filter by user involvement (owner or collaborator)
      query = query.or(`owner_id.eq.${userId},id.in.(${supabase
        .from('project_collaborators')
        .select('project_id')
        .eq('user_id', userId)
        .eq('status', 'active')})`)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      query = query.order('updated_at', { ascending: false })

      const { data: projects, error } = await query

      if (error) {
        console.error('Error fetching user projects:', error)
        return []
      }

      return projects || []
    } catch (error) {
      console.error('Error in getUserProjects:', error)
      return []
    }
  }

  async getProject(projectId: string, userId: string): Promise<Project | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          collaborators:project_collaborators(
            id,
            role,
            status,
            permissions,
            user:users(id, name, email, avatar_url, company)
          ),
          tasks:project_tasks(*),
          files:project_files(*),
          time_entries:time_entries(*),
          activities:project_activities(
            *,
            user:users(name, avatar_url)
          )
        `)
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        return null
      }

      // Check if user has access to this project
      const hasAccess = project.owner_id === userId || 
        project.collaborators.some((c: any) => c.user.id === userId && c.status === 'active')

      if (!hasAccess) {
        console.error('User does not have access to this project')
        return null
      }

      return project
    } catch (error) {
      console.error('Error in getProject:', error)
      return null
    }
  }

  // =====================================================
  // TASK MANAGEMENT
  // =====================================================

  async createTask(projectId: string, userId: string, taskData: Partial<ProjectTask>): Promise<ProjectTask | null> {
    try {
      const supabase = await this.getSupabase()
      
      const task = {
        project_id: projectId,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        type: taskData.type || 'other',
        status: 'todo',
        priority: taskData.priority || 'medium',
        assignee_id: taskData.assignee_id,
        created_by: userId,
        due_date: taskData.due_date,
        estimated_hours: taskData.estimated_hours,
        progress_percentage: 0,
        dependencies: taskData.dependencies || [],
        milestone_id: taskData.milestone_id,
        subtasks: [],
        comments: [],
        watchers: [userId],
        tags: taskData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newTask, error } = await supabase
        .from('project_tasks')
        .insert(task)
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        return null
      }

      // Log activity
      await this.logActivity(projectId, userId, 'created', 'task', newTask.id, `Created task "${task.title}"`)

      // Update project last activity
      await this.updateProjectActivity(projectId)

      return newTask
    } catch (error) {
      console.error('Error in createTask:', error)
      return null
    }
  }

  async updateTaskStatus(taskId: string, userId: string, status: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'in_progress' && !updates.started_at) {
        updates.started_at = new Date().toISOString()
      }

      if (status === 'done') {
        updates.completed_at = new Date().toISOString()
        updates.progress_percentage = 100
      }

      const { data: task, error } = await supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', taskId)
        .select('project_id, title')
        .single()

      if (error) {
        console.error('Error updating task status:', error)
        return false
      }

      // Log activity
      await this.logActivity(task.project_id, userId, 'updated', 'task', taskId, `Updated task "${task.title}" status to ${status}`)

      // Update project activity
      await this.updateProjectActivity(task.project_id)

      return true
    } catch (error) {
      console.error('Error in updateTaskStatus:', error)
      return false
    }
  }

  // =====================================================
  // COLLABORATION MANAGEMENT
  // =====================================================

  async addCollaborator(
    projectId: string, 
    userId: string, 
    role: 'owner' | 'manager' | 'contributor' | 'viewer'
  ): Promise<ProjectCollaborator | null> {
    try {
      const supabase = await this.getSupabase()
      
      // Check if user is already a collaborator
      const { data: existing } = await supabase
        .from('project_collaborators')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single()

      if (existing) {
        console.log('User is already a collaborator on this project')
        return null
      }

      const permissions = this.getDefaultPermissions(role)
      
      const collaborator = {
        project_id: projectId,
        user_id: userId,
        role,
        permissions,
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
        status: 'active'
      }

      const { data: newCollaborator, error } = await supabase
        .from('project_collaborators')
        .insert(collaborator)
        .select()
        .single()

      if (error) {
        console.error('Error adding collaborator:', error)
        return null
      }

      return newCollaborator
    } catch (error) {
      console.error('Error in addCollaborator:', error)
      return null
    }
  }

  private getDefaultPermissions(role: string) {
    const basePermissions = [
      { action: 'view', resource: 'project' },
      { action: 'view', resource: 'tasks' },
      { action: 'view', resource: 'files' },
      { action: 'view', resource: 'comments' }
    ]

    switch (role) {
      case 'owner':
      case 'manager':
        return [
          ...basePermissions,
          { action: 'edit', resource: 'project' },
          { action: 'delete', resource: 'project' },
          { action: 'invite', resource: 'project' },
          { action: 'manage_tasks', resource: 'tasks' },
          { action: 'manage_files', resource: 'files' },
          { action: 'manage_budget', resource: 'budget' }
        ]
      
      case 'contributor':
        return [
          ...basePermissions,
          { action: 'edit', resource: 'tasks' },
          { action: 'edit', resource: 'files' },
          { action: 'edit', resource: 'comments' }
        ]
      
      case 'viewer':
      default:
        return basePermissions
    }
  }

  // =====================================================
  // TIME TRACKING
  // =====================================================

  async logTime(
    projectId: string, 
    userId: string, 
    timeData: Partial<TimeEntry>
  ): Promise<TimeEntry | null> {
    try {
      const supabase = await this.getSupabase()
      
      const timeEntry = {
        project_id: projectId,
        task_id: timeData.task_id,
        user_id: userId,
        description: timeData.description || '',
        hours: timeData.hours || 0,
        billable: timeData.billable || false,
        hourly_rate: timeData.hourly_rate,
        activity_type: timeData.activity_type || 'other',
        date: timeData.date || new Date().toISOString().split('T')[0],
        start_time: timeData.start_time,
        end_time: timeData.end_time,
        approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newTimeEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select()
        .single()

      if (error) {
        console.error('Error logging time:', error)
        return null
      }

      // Update project total time
      await this.updateProjectTimeLogged(projectId)

      // Log activity
      await this.logActivity(projectId, userId, 'created', 'time_entry', newTimeEntry.id, `Logged ${timeEntry.hours} hours`)

      return newTimeEntry
    } catch (error) {
      console.error('Error in logTime:', error)
      return null
    }
  }

  private async updateProjectTimeLogged(projectId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('hours')
        .eq('project_id', projectId)

      const totalHours = timeEntries?.reduce((sum: number, entry: any) => sum + entry.hours, 0) || 0

      await supabase
        .from('projects')
        .update({ time_logged: totalHours })
        .eq('id', projectId)
    } catch (error) {
      console.error('Error updating project time logged:', error)
    }
  }

  // =====================================================
  // ACTIVITY LOGGING
  // =====================================================

  private async logActivity(
    projectId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      const activity = {
        project_id: projectId,
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        description,
        metadata,
        created_at: new Date().toISOString()
      }

      await supabase
        .from('project_activities')
        .insert(activity)
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  private async updateProjectActivity(projectId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      await supabase
        .from('projects')
        .update({ 
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
    } catch (error) {
      console.error('Error updating project activity:', error)
    }
  }

  // =====================================================
  // PROJECT TEMPLATES
  // =====================================================

  async getProjectTemplates(category?: string): Promise<ProjectTemplate[]> {
    try {
      const supabase = await this.getSupabase()
      
      let query = supabase
        .from('project_templates')
        .select('*')
        .eq('is_public', true)

      if (category) {
        query = query.eq('category', category)
      }

      query = query.order('usage_count', { ascending: false })

      const { data: templates, error } = await query

      if (error) {
        console.error('Error fetching project templates:', error)
        return []
      }

      return templates || []
    } catch (error) {
      console.error('Error in getProjectTemplates:', error)
      return []
    }
  }

  async createProjectFromTemplate(
    userId: string, 
    templateId: string, 
    projectData: Partial<Project>
  ): Promise<Project | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: template, error: templateError } = await supabase
        .from('project_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError || !template) {
        console.error('Error fetching template:', templateError)
        return null
      }

      // Create project with template structure
      const project = await this.createProject(userId, {
        ...projectData,
        requirements: template.default_requirements,
        milestones: template.default_milestones
      })

      if (project) {
        // Create default tasks
        for (const taskTemplate of template.default_tasks) {
          await this.createTask(project.id, userId, taskTemplate)
        }

        // Update template usage count
        await supabase
          .from('project_templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', templateId)
      }

      return project
    } catch (error) {
      console.error('Error in createProjectFromTemplate:', error)
      return null
    }
  }
}
