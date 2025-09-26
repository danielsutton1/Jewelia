// 🏆 COMPREHENSIVE RBAC SYSTEM TYPES
// Type definitions for the jewelry industry access control system

// =====================================================
// CORE ROLE AND PERMISSION TYPES
// =====================================================

export type JewelryUserRole =
  // Management Roles
  | 'store_owner'           // Full system access, can manage everything
  | 'store_manager'         // Can manage staff, inventory, customers, reports
  | 'assistant_manager'     // Can manage most operations except user management
  
  // Sales Roles
  | 'senior_sales_associate' // Can handle complex sales, view financials
  | 'sales_associate'       // Can handle standard sales, limited financial access
  | 'customer_service_rep'  // Can handle customer inquiries, basic sales
  
  // Technical Roles
  | 'jewelry_designer'      // Can manage designs, CAD files, production
  | 'goldsmith'            // Can manage production, quality control
  | 'jeweler'              // Can handle repairs, custom work
  | 'appraiser'            // Can assess jewelry value, create appraisals
  
  // Support Roles
  | 'inventory_manager'     // Can manage inventory, suppliers, pricing
  | 'bookkeeper'           // Can manage financial data, reports
  | 'accountant'           // Can access all financial data, tax reports
  
  // System Roles
  | 'system_admin'         // Can manage system settings, users
  | 'viewer'               // Read-only access to most data
  | 'guest'                // Limited access for temporary users

export type PermissionCategory =
  | 'customer_management'   // Customer data access and management
  | 'inventory_management'  // Product and inventory control
  | 'sales_management'      // Sales processes and transactions
  | 'financial_management'  // Financial data and reporting
  | 'production_management' // Manufacturing and quality control
  | 'user_management'       // User and role management
  | 'system_administration' // System settings and configuration
  | 'reporting_analytics'   // Reports and business intelligence
  | 'network_collaboration' // Partner and network features
  | 'file_management'       // Document and file access

export type ResourceType =
  | 'global'               // System-wide permissions
  | 'department'           // Department-specific permissions
  | 'project'              // Project-specific permissions
  | 'customer'             // Customer-specific permissions
  | 'inventory_item'       // Individual inventory item permissions
  | 'financial_report'     // Specific report permissions
  | 'team'                 // Team-specific permissions
  | 'workspace'            // Workspace-specific permissions

// =====================================================
// PERMISSION SYSTEM TYPES
// =====================================================

export interface Permission {
  id: string
  name: string
  description?: string
  category: PermissionCategory
  resource_type: ResourceType
  resource_id?: string
  is_sensitive: boolean
  requires_approval: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: string
  role: JewelryUserRole
  permission_id: string
  granted_by?: string
  granted_at: string
  expires_at?: string
  is_active: boolean
  created_at: string
}

export interface UserPermission {
  id: string
  user_id: string
  permission_id: string
  granted_by?: string
  granted_at: string
  expires_at?: string
  is_active: boolean
  reason?: string
  created_at: string
}

// =====================================================
// TEAM AND DEPARTMENT TYPES
// =====================================================

export interface Department {
  id: string
  name: string
  description?: string
  manager_id?: string
  parent_department_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description?: string
  department_id?: string
  team_lead_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: JewelryUserRole
  permissions?: Record<string, boolean>
  joined_at: string
  left_at?: string
  is_active: boolean
  created_at: string
}

// =====================================================
// USER PROFILE TYPES
// =====================================================

export interface UserProfile {
  id: string
  user_id: string
  role: JewelryUserRole
  department_id?: string
  manager_id?: string
  employee_id?: string
  hire_date?: string
  termination_date?: string
  is_active: boolean
  last_login_at?: string
  login_count: number
  failed_login_attempts: number
  locked_until?: string
  two_factor_enabled: boolean
  two_factor_secret?: string
  created_at: string
  updated_at: string
}

// =====================================================
// AUDIT AND SECURITY TYPES
// =====================================================

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  success: boolean
  error_message?: string
  created_at: string
}

export interface SecurityEvent {
  id: string
  user_id?: string
  event_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  ip_address?: string
  user_agent?: string
  session_id?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface AccessAttempt {
  id: string
  user_id?: string
  resource_type: string
  resource_id?: string
  permission_required?: string
  access_granted: boolean
  ip_address?: string
  user_agent?: string
  created_at: string
}

// =====================================================
// DATA ACCESS CONTROL TYPES
// =====================================================

export interface DataOwnership {
  id: string
  resource_type: string
  resource_id: string
  owner_id: string
  owner_type: 'user' | 'department' | 'team'
  department_id?: string
  team_id?: string
  created_at: string
}

export interface DataSharing {
  id: string
  resource_type: string
  resource_id: string
  shared_with_user_id?: string
  shared_with_department_id?: string
  shared_with_team_id?: string
  permission_level: 'read' | 'write' | 'admin'
  shared_by?: string
  expires_at?: string
  is_active: boolean
  created_at: string
}

// =====================================================
// PERMISSION CHECK TYPES
// =====================================================

export interface PermissionCheck {
  user_id: string
  permission: string
  resource_type?: ResourceType
  resource_id?: string
  granted: boolean
  reason?: string
  checked_at: string
}

export interface UserPermissions {
  role: JewelryUserRole
  permissions: Permission[]
  custom_permissions: UserPermission[]
  department_permissions: Permission[]
  team_permissions: Permission[]
  effective_permissions: Permission[]
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateUserRequest {
  email: string
  full_name: string
  role: JewelryUserRole
  department_id?: string
  manager_id?: string
  employee_id?: string
  hire_date?: string
  send_invitation?: boolean
}

export interface UpdateUserRoleRequest {
  user_id: string
  role: JewelryUserRole
  reason?: string
  expires_at?: string
}

export interface GrantPermissionRequest {
  user_id: string
  permission_id: string
  reason: string
  expires_at?: string
}

export interface RevokePermissionRequest {
  user_id: string
  permission_id: string
  reason: string
}

export interface CreateTeamRequest {
  name: string
  description?: string
  department_id?: string
  team_lead_id?: string
  members?: string[]
}

export interface InviteTeamMemberRequest {
  team_id: string
  email: string
  role: JewelryUserRole
  message?: string
}

// =====================================================
// DASHBOARD AND UI TYPES
// =====================================================

export interface UserManagementDashboard {
  total_users: number
  active_users: number
  users_by_role: Record<JewelryUserRole, number>
  users_by_department: Record<string, number>
  recent_activity: AuditLog[]
  security_alerts: SecurityEvent[]
  permission_requests: UserPermission[]
}

export interface RoleHierarchy {
  role: JewelryUserRole
  level: number
  parent_roles: JewelryUserRole[]
  child_roles: JewelryUserRole[]
  permissions: Permission[]
  can_manage: JewelryUserRole[]
}

export interface PermissionMatrix {
  roles: JewelryUserRole[]
  permissions: Permission[]
  matrix: Record<JewelryUserRole, Record<string, boolean>>
}

// =====================================================
// SECURITY AND COMPLIANCE TYPES
// =====================================================

export interface SecurityReport {
  period: {
    start: string
    end: string
  }
  total_logins: number
  failed_logins: number
  permission_denials: number
  security_events: SecurityEvent[]
  access_patterns: Record<string, number>
  compliance_status: {
    pci_dss: boolean
    gdpr: boolean
    sox: boolean
    industry_standards: boolean
  }
}

export interface ComplianceCheck {
  standard: 'pci_dss' | 'gdpr' | 'sox' | 'industry_standards'
  status: 'compliant' | 'non_compliant' | 'partial'
  issues: string[]
  recommendations: string[]
  last_checked: string
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type RoleLevel = 1 | 2 | 3 | 4 | 5 // Higher number = more permissions

export interface RoleInfo {
  role: JewelryUserRole
  level: RoleLevel
  display_name: string
  description: string
  color: string
  icon: string
  permissions_count: number
}

export interface PermissionInfo {
  permission: string
  display_name: string
  description: string
  category: PermissionCategory
  is_sensitive: boolean
  requires_approval: boolean
}

// =====================================================
// CONSTANTS
// =====================================================

export const ROLE_HIERARCHY: Record<JewelryUserRole, RoleLevel> = {
  store_owner: 5,
  store_manager: 4,
  assistant_manager: 3,
  senior_sales_associate: 3,
  sales_associate: 2,
  customer_service_rep: 2,
  jewelry_designer: 3,
  goldsmith: 3,
  jeweler: 3,
  appraiser: 2,
  inventory_manager: 3,
  bookkeeper: 3,
  accountant: 4,
  system_admin: 5,
  viewer: 1,
  guest: 1
}

export const ROLE_DISPLAY_NAMES: Record<JewelryUserRole, string> = {
  store_owner: 'Store Owner',
  store_manager: 'Store Manager',
  assistant_manager: 'Assistant Manager',
  senior_sales_associate: 'Senior Sales Associate',
  sales_associate: 'Sales Associate',
  customer_service_rep: 'Customer Service Rep',
  jewelry_designer: 'Jewelry Designer',
  goldsmith: 'Goldsmith',
  jeweler: 'Jeweler',
  appraiser: 'Appraiser',
  inventory_manager: 'Inventory Manager',
  bookkeeper: 'Bookkeeper',
  accountant: 'Accountant',
  system_admin: 'System Administrator',
  viewer: 'Viewer',
  guest: 'Guest'
}

export const ROLE_DESCRIPTIONS: Record<JewelryUserRole, string> = {
  store_owner: 'Full system access with complete control over all operations',
  store_manager: 'Can manage staff, inventory, customers, and generate reports',
  assistant_manager: 'Can manage most operations except user management',
  senior_sales_associate: 'Can handle complex sales and view financial information',
  sales_associate: 'Can handle standard sales with limited financial access',
  customer_service_rep: 'Can handle customer inquiries and basic sales',
  jewelry_designer: 'Can manage designs, CAD files, and production processes',
  goldsmith: 'Can manage production and quality control processes',
  jeweler: 'Can handle repairs and custom jewelry work',
  appraiser: 'Can assess jewelry value and create appraisals',
  inventory_manager: 'Can manage inventory, suppliers, and pricing',
  bookkeeper: 'Can manage financial data and reports',
  accountant: 'Can access all financial data and tax reports',
  system_admin: 'Can manage system settings and user accounts',
  viewer: 'Read-only access to most system data',
  guest: 'Limited access for temporary users'
}

export const ROLE_COLORS: Record<JewelryUserRole, string> = {
  store_owner: '#8B5CF6',      // Purple
  store_manager: '#3B82F6',    // Blue
  assistant_manager: '#06B6D4', // Cyan
  senior_sales_associate: '#10B981', // Emerald
  sales_associate: '#84CC16',   // Lime
  customer_service_rep: '#F59E0B', // Amber
  jewelry_designer: '#EF4444',  // Red
  goldsmith: '#F97316',         // Orange
  jeweler: '#EC4899',           // Pink
  appraiser: '#6366F1',         // Indigo
  inventory_manager: '#14B8A6', // Teal
  bookkeeper: '#8B5CF6',        // Purple
  accountant: '#DC2626',        // Red
  system_admin: '#7C2D12',      // Dark Red
  viewer: '#6B7280',            // Gray
  guest: '#9CA3AF'              // Light Gray
}
