// 🚀 TEAM MANAGEMENT SYSTEM TYPES
// Comprehensive type definitions for enterprise team management

// =====================================================
// ENHANCED ROLE AND PERMISSION TYPES
// =====================================================

export type EnhancedUserRole =
  | 'super_admin'
  | 'admin'
  | 'team_owner'
  | 'team_manager'
  | 'team_lead'
  | 'senior_member'
  | 'member'
  | 'viewer'
  | 'guest'

export type JewelryRole =
  | 'admin'
  | 'manager'
  | 'designer'
  | 'goldsmith'
  | 'jeweler'
  | 'craftsman'
  | 'assistant'
  | 'apprentice'
  | 'sales'
  | 'consultant';

export type PermissionCategory = 
  | 'user_management' 
  | 'team_management' 
  | 'content_management' 
  | 'financial_management' 
  | 'analytics_access' 
  | 'system_settings'
  | 'network_management' 
  | 'collaboration_tools' 
  | 'file_management';


export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: PermissionCategory;
  resource_type?: ResourceType;
  resource_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role: EnhancedUserRole;
  permission_id: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  
  // Relations
  permission?: Permission;
  granted_by_user?: User;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  
  // Relations
  permission?: Permission;
  user?: User;
  granted_by_user?: User;
}

// =====================================================
// TEAM MANAGEMENT TYPES
// =====================================================

import { ResourceType } from './rbac'

export type TeamStatus = 'active' | 'inactive' | 'archived' | 'suspended';

export interface Team {
  id: string;
  name: string;
  description?: string;
  slug: string;
  
  // Team hierarchy
  parent_team_id?: string;
  team_level: number;
  
  // Team settings
  is_public: boolean;
  allow_self_join: boolean;
  require_approval: boolean;
  max_members: number;
  
  // Team metadata
  avatar_url?: string;
  banner_url?: string;
  tags: string[];
  industry?: string;
  location?: string;
  
  // Team status
  status: TeamStatus;
  
  // Ownership and management
  owner_id?: string;
  created_by?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  parent_team?: Team;
  sub_teams?: Team[];
  owner?: User;
  created_by_user?: User;
  members?: TeamMember[];
  projects?: TeamProject[];
  workspaces?: TeamWorkspace[];
}

export type TeamMemberStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'invited';

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  
  // Member role and status
  role: EnhancedUserRole;
  status: TeamMemberStatus;
  
  // Member permissions (team-specific)
  can_invite_members: boolean;
  can_remove_members: boolean;
  can_edit_team: boolean;
  can_manage_projects: boolean;
  can_view_analytics: boolean;
  can_manage_finances: boolean;
  
  // Member metadata
  joined_at: string;
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
  
  // Member preferences
  notification_preferences: Record<string, any>;
  privacy_settings: Record<string, any>;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
  user?: User;
  invited_by_user?: User;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  
  // Invitation details
  role: EnhancedUserRole;
  message?: string;
  expires_at: string;
  
  // Invitation status
  status: InvitationStatus;
  
  // Invitation metadata
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
  accepted_by?: string;
  
  // Invitation tracking
  sent_count: number;
  last_sent_at: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
  invited_by_user?: User;
  accepted_by_user?: User;
}

// =====================================================
// TEAM COLLABORATION FEATURES
// =====================================================

export type ProjectType = 'general' | 'client_project' | 'internal' | 'research' | 'development';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TeamProject {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  
  // Project details
  project_type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Project timeline
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  
  // Project metadata
  tags: string[];
  budget?: number;
  progress_percentage: number;
  
  // Project ownership
  owner_id?: string;
  created_by?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
  owner?: User;
  created_by_user?: User;
  members?: ProjectMember[];
}

export type ProjectMemberRole = 'owner' | 'manager' | 'lead' | 'member' | 'contributor' | 'reviewer';
export type ProjectMemberStatus = 'active' | 'inactive' | 'completed';

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  
  // Member role and responsibilities
  role: ProjectMemberRole;
  responsibilities: string[];
  
  // Member status
  status: ProjectMemberStatus;
  
  // Member timeline
  joined_at: string;
  left_at?: string;
  
  // Member performance
  contribution_score: number;
  last_activity: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  project?: TeamProject;
  user?: User;
}

export type WorkspaceType = 'general' | 'project' | 'department' | 'client' | 'research';

export interface TeamWorkspace {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  
  // Workspace settings
  workspace_type: WorkspaceType;
  is_private: boolean;
  allow_guest_access: boolean;
  
  // Workspace metadata
  avatar_url?: string;
  tags: string[];
  
  // Workspace ownership
  owner_id?: string;
  created_by?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
  owner?: User;
  created_by_user?: User;
  members?: WorkspaceMember[];
}

export type WorkspaceAccessLevel = 'owner' | 'admin' | 'member' | 'guest';
export type WorkspaceMemberStatus = 'active' | 'inactive' | 'suspended';

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  
  // Member access level
  access_level: WorkspaceAccessLevel;
  
  // Member permissions
  can_edit_content: boolean;
  can_share_content: boolean;
  can_invite_others: boolean;
  
  // Member status
  status: WorkspaceMemberStatus;
  
  // Member timeline
  joined_at: string;
  invited_by?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  workspace?: TeamWorkspace;
  user?: User;
  invited_by_user?: User;
}

// =====================================================
// SHARED NETWORK CONNECTIONS AND RELATIONSHIPS
// =====================================================

export type ConnectionType = 'collaboration' | 'partnership' | 'supplier' | 'customer' | 'competitor' | 'mentor';
export type ConnectionStatus = 'pending' | 'active' | 'inactive' | 'blocked';

export interface TeamNetworkConnection {
  id: string;
  team_id: string;
  connected_team_id: string;
  
  // Connection details
  connection_type: ConnectionType;
  status: ConnectionStatus;
  
  // Connection metadata
  description?: string;
  tags: string[];
  strength_score: number;
  
  // Connection timeline
  initiated_at: string;
  accepted_at?: string;
  last_interaction: string;
  
  // Connection management
  initiated_by?: string;
  managed_by?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
  connected_team?: Team;
  initiated_by_user?: User;
  managed_by_user?: User;
}

export type AccessLevel = 'view' | 'edit' | 'manage' | 'admin';
export type SharingStatus = 'active' | 'expired' | 'revoked';

export interface TeamSharedResource {
  id: string;
  team_id: string;
  resource_type: ResourceType;
  resource_id: string;
  
  // Sharing settings
  shared_with_team_id: string;
  access_level: AccessLevel;
  
  // Sharing metadata
  shared_by?: string;
  shared_at: string;
  expires_at?: string;
  
  // Sharing status
  status: SharingStatus;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
  shared_with_team?: Team;
  shared_by_user?: User;
}

// =====================================================
// TEAM ANALYTICS AND PERFORMANCE METRICS
// =====================================================

export interface TeamPerformanceMetrics {
  id: string;
  team_id: string;
  metric_date: string;
  
  // Team metrics
  total_members: number;
  active_members: number;
  new_members: number;
  departed_members: number;
  
  // Activity metrics
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  
  // Collaboration metrics
  messages_sent: number;
  files_shared: number;
  meetings_held: number;
  
  // Performance metrics
  average_response_time: number; // in minutes
  task_completion_rate: number; // percentage
  member_satisfaction_score: number; // 1-5 scale
  
  // Network metrics
  new_connections: number;
  total_connections: number;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
}

export type ActivityType = 
  | 'member_joined' 
  | 'member_left' 
  | 'project_created' 
  | 'project_completed'
  | 'file_shared' 
  | 'message_sent' 
  | 'meeting_scheduled' 
  | 'task_assigned'
  | 'permission_changed' 
  | 'team_settings_updated' 
  | 'invitation_sent';

export interface TeamActivityLog {
  id: string;
  team_id: string;
  user_id?: string;
  
  // Activity details
  activity_type: ActivityType;
  activity_data: Record<string, any>;
  
  // Activity metadata
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  
  created_at: string;
  
  // Relations
  team?: Team;
  user?: User;
}

// =====================================================
// BULK USER MANAGEMENT TOOLS
// =====================================================

export type BulkOperationType = 
  | 'user_import' 
  | 'user_update' 
  | 'user_deletion' 
  | 'permission_bulk_update'
  | 'team_assignment' 
  | 'role_bulk_update' 
  | 'invitation_bulk_send';

export type BulkOperationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface BulkOperation {
  id: string;
  operation_type: BulkOperationType;
  
  // Operation details
  description?: string;
  total_items: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  
  // Operation status
  status: BulkOperationStatus;
  
  // Operation metadata
  initiated_by?: string;
  started_at: string;
  completed_at?: string;
  
  // Operation results
  results: Record<string, any>;
  error_log?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  initiated_by_user?: User;
  items?: BulkOperationItem[];
}

export type BulkItemStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export interface BulkOperationItem {
  id: string;
  bulk_operation_id: string;
  
  // Item details
  item_type: string;
  item_id?: string;
  item_data: Record<string, any>;
  
  // Item status
  status: BulkItemStatus;
  
  // Item results
  result_message?: string;
  error_message?: string;
  processed_at?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  bulk_operation?: BulkOperation;
}

// =====================================================
// SECURITY AND COMPLIANCE FEATURES
// =====================================================

export type PolicyType = 'access_control' | 'data_protection' | 'audit_requirements' | 'compliance_standards';
export type EnforcementLevel = 'strict' | 'moderate' | 'flexible';

export interface TeamSecurityPolicy {
  id: string;
  team_id: string;
  
  // Policy details
  policy_name: string;
  policy_type: PolicyType;
  description?: string;
  
  // Policy settings
  is_enforced: boolean;
  enforcement_level: EnforcementLevel;
  
  // Policy metadata
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
  created_by_user?: User;
}

export type AuditType = 'security' | 'compliance' | 'performance' | 'access_control';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'reviewed';

export interface TeamComplianceAudit {
  id: string;
  team_id: string;
  
  // Audit details
  audit_type: AuditType;
  audit_date: string;
  
  // Audit results
  overall_score: number; // 0-1 scale
  passed_checks: number;
  failed_checks: number;
  total_checks: number;
  
  // Audit metadata
  auditor_id?: string;
  audit_notes?: string;
  recommendations?: string;
  
  // Audit status
  status: AuditStatus;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  team?: Team;
  auditor?: User;
}

// =====================================================
// SERVICE REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateTeamRequest {
  name: string;
  description?: string;
  slug: string;
  parent_team_id?: string;
  is_public?: boolean;
  allow_self_join?: boolean;
  require_approval?: boolean;
  max_members?: number;
  industry?: string;
  location?: string;
  tags?: string[];
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
  allow_self_join?: boolean;
  require_approval?: boolean;
  max_members?: number;
  industry?: string;
  location?: string;
  tags?: string[];
  status?: TeamStatus;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: EnhancedUserRole;
  message?: string;
  permissions?: {
    can_invite_members?: boolean;
    can_remove_members?: boolean;
    can_edit_team?: boolean;
    can_manage_projects?: boolean;
    can_view_analytics?: boolean;
    can_manage_finances?: boolean;
  };
}

export interface CreateTeamProjectRequest {
  name: string;
  description?: string;
  project_type?: ProjectType;
  priority?: ProjectPriority;
  start_date?: string;
  due_date?: string;
  tags?: string[];
  budget?: number;
}

export interface UpdateTeamProjectRequest {
  name?: string;
  description?: string;
  project_type?: ProjectType;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string;
  due_date?: string;
  tags?: string[];
  budget?: number;
  progress_percentage?: number;
}

export interface BulkUserOperationRequest {
  operation_type: BulkOperationType;
  description?: string;
  users: Array<{
    email: string;
    full_name: string;
    role?: EnhancedUserRole;
    team_id?: string;
    permissions?: string[];
  }>;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface TeamMemberWithUser extends TeamMember {
  user: User;
}

export interface TeamWithMembers extends Team {
  members: TeamMemberWithUser[];
}

export interface TeamWithProjects extends Team {
  projects: TeamProject[];
}

export interface TeamWithWorkspaces extends Team {
  workspaces: TeamWorkspace[];
}

export interface TeamWithMetrics extends Team {
  performance_metrics: TeamPerformanceMetrics[];
}

export interface TeamWithConnections extends Team {
  network_connections: TeamNetworkConnection[];
}

// =====================================================
// USER TYPE (for relations)
// =====================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  jewelry_role: JewelryRole;
  department?: string;
  is_active: boolean;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  position?: string;
  hire_date?: string;
  manager_id?: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

// =====================================================
// USER MANAGEMENT TYPES
// =====================================================

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
  business_id?: string;
  department?: string;
  jewelry_role: string;
  is_active?: boolean;
  phone?: string;
  bio?: string;
  position?: string;
  hire_date?: string;
  manager_id?: string;
  permissions?: string[];
}

export interface UpdateUserRequest {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  business_id?: string;
  department?: string;
  jewelry_role?: string;
  is_active?: boolean;
  phone?: string;
  bio?: string;
  position?: string;
  manager_id?: string;
  permissions?: string[];
}

export interface CreateTeamMemberRequest {
  team_id: string;
  user_id: string;
  role: EnhancedUserRole;
  permissions?: string[];
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function getRoleColor(role: EnhancedUserRole): string {
  const roleColors: Record<EnhancedUserRole, string> = {
    'super_admin': 'bg-red-500',
    'admin': 'bg-orange-500',
    'team_owner': 'bg-purple-500',
    'team_manager': 'bg-blue-500',
    'team_lead': 'bg-indigo-500',
    'senior_member': 'bg-green-500',
    'member': 'bg-gray-500',
    'viewer': 'bg-slate-400',
    'guest': 'bg-gray-300'
  };
  return roleColors[role] || 'bg-gray-400';
}

export function getRoleDisplayName(role: EnhancedUserRole): string {
  const roleNames: Record<EnhancedUserRole, string> = {
    'super_admin': 'Super Admin',
    'admin': 'Administrator',
    'team_owner': 'Team Owner',
    'team_manager': 'Team Manager',
    'team_lead': 'Team Lead',
    'senior_member': 'Senior Member',
    'member': 'Member',
    'viewer': 'Viewer',
    'guest': 'Guest'
  };
  return roleNames[role] || 'Unknown Role';
}

export function getJewelryRoleColor(role: JewelryRole): string {
  const roleColors: Record<JewelryRole, string> = {
    'admin': 'bg-red-500',
    'manager': 'bg-orange-500',
    'designer': 'bg-purple-500',
    'goldsmith': 'bg-blue-500',
    'jeweler': 'bg-indigo-500',
    'craftsman': 'bg-green-500',
    'assistant': 'bg-gray-500',
    'apprentice': 'bg-slate-400',
    'sales': 'bg-yellow-500',
    'consultant': 'bg-pink-500'
  };
  return roleColors[role] || 'bg-gray-400';
}

export function getJewelryRoleDisplayName(role: JewelryRole): string {
  const roleNames: Record<JewelryRole, string> = {
    'admin': 'Administrator',
    'manager': 'Manager',
    'designer': 'Designer',
    'goldsmith': 'Goldsmith',
    'jeweler': 'Jeweler',
    'craftsman': 'Craftsman',
    'assistant': 'Assistant',
    'apprentice': 'Apprentice',
    'sales': 'Sales',
    'consultant': 'Consultant'
  };
  return roleNames[role] || 'Unknown Role';
}
