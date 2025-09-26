export interface Project {
  id: string
  title: string
  description: string
  type: 'custom_design' | 'repair' | 'consultation' | 'manufacturing' | 'appraisal' | 'other'
  status: 'draft' | 'active' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Participants
  owner_id: string
  collaborators: ProjectCollaborator[]
  client_id?: string
  
  // Timeline
  start_date?: string
  due_date?: string
  completed_date?: string
  estimated_hours?: number
  
  // Financial
  budget?: number
  cost_estimate?: number
  final_cost?: number
  currency: string
  
  // Project details
  requirements: ProjectRequirement[]
  deliverables: ProjectDeliverable[]
  milestones: ProjectMilestone[]
  tasks: ProjectTask[]
  files: ProjectFile[]
  
  // Metadata
  tags: string[]
  category: string
  created_at: string
  updated_at: string
  
  // Progress tracking
  progress_percentage: number
  time_logged: number
  last_activity: string
}

export interface ProjectCollaborator {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'manager' | 'contributor' | 'viewer'
  permissions: ProjectPermission[]
  invited_at: string
  joined_at?: string
  status: 'pending' | 'active' | 'inactive'
  
  // User details (populated via join)
  user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
    company?: string
    specialties: string[]
  }
}

export interface ProjectPermission {
  action: 'view' | 'edit' | 'delete' | 'invite' | 'manage_tasks' | 'manage_files' | 'manage_budget'
  resource: 'project' | 'tasks' | 'files' | 'comments' | 'budget' | 'timeline'
}

export interface ProjectRequirement {
  id: string
  title: string
  description: string
  type: 'functional' | 'design' | 'material' | 'technical' | 'budget' | 'timeline'
  priority: 'must_have' | 'should_have' | 'nice_to_have'
  status: 'pending' | 'approved' | 'rejected' | 'needs_clarification'
  created_by: string
  created_at: string
}

export interface ProjectDeliverable {
  id: string
  title: string
  description: string
  type: 'design' | 'prototype' | 'final_product' | 'documentation' | 'approval' | 'other'
  due_date?: string
  completed_date?: string
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'rejected'
  assignee_id?: string
  files: string[] // File IDs
  approval_required: boolean
  approved_by?: string
  approved_at?: string
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  due_date: string
  completed_date?: string
  status: 'upcoming' | 'current' | 'completed' | 'overdue'
  tasks: string[] // Task IDs
  dependencies: string[] // Other milestone IDs
  budget_allocation?: number
  deliverables: string[] // Deliverable IDs
}

export interface ProjectTask {
  id: string
  project_id: string
  title: string
  description: string
  type: 'design' | 'production' | 'review' | 'admin' | 'communication' | 'other'
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Assignment
  assignee_id?: string
  created_by: string
  
  // Timeline
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  started_at?: string
  completed_at?: string
  
  // Dependencies
  dependencies: string[] // Other task IDs
  milestone_id?: string
  
  // Progress
  progress_percentage: number
  subtasks: ProjectSubtask[]
  
  // Communication
  comments: TaskComment[]
  watchers: string[] // User IDs
  
  // Metadata
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ProjectSubtask {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export interface TaskComment {
  id: string
  content: string
  author_id: string
  created_at: string
  updated_at?: string
  mentions: string[] // User IDs mentioned
  attachments: string[] // File IDs
  
  // Author details (populated via join)
  author?: {
    name: string
    avatar_url?: string
  }
}

export interface ProjectFile {
  id: string
  project_id: string
  name: string
  description?: string
  file_path: string
  file_type: string
  file_size: number
  mime_type: string
  
  // Organization
  category: 'design' | 'reference' | 'contract' | 'progress' | 'final' | 'other'
  tags: string[]
  version: number
  is_latest: boolean
  
  // Access control
  uploaded_by: string
  visibility: 'public' | 'collaborators' | 'private'
  
  // Metadata
  uploaded_at: string
  last_modified: string
  thumbnail_url?: string
}

export interface TimeEntry {
  id: string
  project_id: string
  task_id?: string
  user_id: string
  description: string
  hours: number
  billable: boolean
  hourly_rate?: number
  
  // Categorization
  activity_type: 'design' | 'production' | 'review' | 'communication' | 'admin' | 'travel' | 'other'
  
  // Timeline
  date: string
  start_time?: string
  end_time?: string
  
  // Approval
  approved: boolean
  approved_by?: string
  approved_at?: string
  
  // Metadata
  created_at: string
  updated_at: string
}

export interface ProjectActivity {
  id: string
  project_id: string
  user_id: string
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'commented' | 'uploaded' | 'invited'
  resource_type: 'project' | 'task' | 'milestone' | 'file' | 'comment' | 'time_entry'
  resource_id: string
  description: string
  metadata?: any
  created_at: string
  
  // User details (populated via join)
  user?: {
    name: string
    avatar_url?: string
  }
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  industry: string[]
  
  // Template structure
  default_milestones: Omit<ProjectMilestone, 'id' | 'completed_date' | 'status'>[]
  default_tasks: Omit<ProjectTask, 'id' | 'project_id' | 'assignee_id' | 'started_at' | 'completed_at'>[]
  default_requirements: Omit<ProjectRequirement, 'id' | 'created_by' | 'created_at'>[]
  
  // Metadata
  created_by: string
  created_at: string
  usage_count: number
  is_public: boolean
  tags: string[]
}

// Enums and Utility Types
export type ProjectStatus = 'draft' | 'active' | 'in_progress' | 'review' | 'completed' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type ProjectType = 'custom_design' | 'repair' | 'consultation' | 'manufacturing' | 'appraisal' | 'other'
export type CollaboratorRole = 'owner' | 'manager' | 'contributor' | 'viewer'
export type ActivityType = 'design' | 'production' | 'review' | 'communication' | 'admin' | 'travel' | 'other'
