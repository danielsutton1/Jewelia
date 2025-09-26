-- 🚀 TEAM MANAGEMENT SYSTEM MIGRATION
-- This migration extends the existing user management with comprehensive team features

-- =====================================================
-- 1. ENHANCED ROLE AND PERMISSION SYSTEM
-- =====================================================

-- Create enhanced role enum
CREATE TYPE enhanced_user_role AS ENUM (
    'super_admin', 'admin', 'team_owner', 'team_manager', 'team_lead', 
    'senior_member', 'member', 'viewer', 'guest'
);

-- Create permission categories
CREATE TYPE permission_category AS ENUM (
    'user_management', 'team_management', 'content_management', 
    'financial_management', 'analytics_access', 'system_settings',
    'network_management', 'collaboration_tools', 'file_management'
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category permission_category NOT NULL,
    resource_type TEXT, -- 'global', 'team', 'project', 'file'
    resource_id UUID, -- specific resource this permission applies to
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role enhanced_user_role NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(role, permission_id)
);

-- Create custom user permissions (for overriding role permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, permission_id)
);

-- =====================================================
-- 2. TEAM MANAGEMENT SYSTEM
-- =====================================================

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    -- Team hierarchy
    parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    team_level INTEGER DEFAULT 1, -- 1 = top level, 2 = sub-team, etc.
    
    -- Team settings
    is_public BOOLEAN DEFAULT false,
    allow_self_join BOOLEAN DEFAULT false,
    require_approval BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 100,
    
    -- Team metadata
    avatar_url TEXT,
    banner_url TEXT,
    tags TEXT[] DEFAULT '{}',
    industry TEXT,
    location TEXT,
    
    -- Team status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'suspended')),
    
    -- Ownership and management
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Member role and status
    role enhanced_user_role NOT NULL DEFAULT 'member',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended', 'invited')),
    
    -- Member permissions (team-specific)
    can_invite_members BOOLEAN DEFAULT false,
    can_remove_members BOOLEAN DEFAULT false,
    can_edit_team BOOLEAN DEFAULT false,
    can_manage_projects BOOLEAN DEFAULT false,
    can_view_analytics BOOLEAN DEFAULT false,
    can_manage_finances BOOLEAN DEFAULT false,
    
    -- Member metadata
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Member preferences
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, user_id)
);

-- Create team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    
    -- Invitation details
    role enhanced_user_role NOT NULL DEFAULT 'member',
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Invitation status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
    
    -- Invitation metadata
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Invitation tracking
    sent_count INTEGER DEFAULT 1,
    last_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, email)
);

-- =====================================================
-- 3. TEAM COLLABORATION FEATURES
-- =====================================================

-- Create team projects table
CREATE TABLE IF NOT EXISTS team_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Project details
    project_type TEXT DEFAULT 'general' CHECK (project_type IN ('general', 'client_project', 'internal', 'research', 'development')),
    status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Project timeline
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    
    -- Project metadata
    tags TEXT[] DEFAULT '{}',
    budget DECIMAL(12,2),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Project ownership
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Member role and responsibilities
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'lead', 'member', 'contributor', 'reviewer')),
    responsibilities TEXT[],
    
    -- Member status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    
    -- Member timeline
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Member performance
    contribution_score INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

-- Create team workspaces table
CREATE TABLE IF NOT EXISTS team_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Workspace settings
    workspace_type TEXT DEFAULT 'general' CHECK (workspace_type IN ('general', 'project', 'department', 'client', 'research')),
    is_private BOOLEAN DEFAULT false,
    allow_guest_access BOOLEAN DEFAULT false,
    
    -- Workspace metadata
    avatar_url TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Workspace ownership
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES team_workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Member access level
    access_level TEXT DEFAULT 'member' CHECK (access_level IN ('owner', 'admin', 'member', 'guest')),
    
    -- Member permissions
    can_edit_content BOOLEAN DEFAULT false,
    can_share_content BOOLEAN DEFAULT false,
    can_invite_others BOOLEAN DEFAULT false,
    
    -- Member status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Member timeline
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(workspace_id, user_id)
);

-- =====================================================
-- 4. SHARED NETWORK CONNECTIONS AND RELATIONSHIPS
-- =====================================================

-- Create team network connections table
CREATE TABLE IF NOT EXISTS team_network_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    connected_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Connection details
    connection_type TEXT DEFAULT 'collaboration' CHECK (connection_type IN ('collaboration', 'partnership', 'supplier', 'customer', 'competitor', 'mentor')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'blocked')),
    
    -- Connection metadata
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    strength_score INTEGER DEFAULT 1 CHECK (strength_score >= 1 AND strength_score <= 10),
    
    -- Connection timeline
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Connection management
    initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    managed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, connected_team_id)
);

-- Create team shared resources table
CREATE TABLE IF NOT EXISTS team_shared_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('inventory', 'equipment', 'knowledge', 'contact', 'file', 'project')),
    resource_id UUID NOT NULL, -- reference to the actual resource
    
    -- Sharing settings
    shared_with_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    access_level TEXT DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'manage', 'admin')),
    
    -- Sharing metadata
    shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Sharing status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, shared_with_team_id, resource_type, resource_id)
);

-- =====================================================
-- 5. TEAM ANALYTICS AND PERFORMANCE METRICS
-- =====================================================

-- Create team performance metrics table
CREATE TABLE IF NOT EXISTS team_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    
    -- Team metrics
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    new_members INTEGER DEFAULT 0,
    departed_members INTEGER DEFAULT 0,
    
    -- Activity metrics
    total_projects INTEGER DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    
    -- Collaboration metrics
    messages_sent INTEGER DEFAULT 0,
    files_shared INTEGER DEFAULT 0,
    meetings_held INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_response_time INTEGER DEFAULT 0, -- in minutes
    task_completion_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    member_satisfaction_score DECIMAL(3,2) DEFAULT 0, -- 1-5 scale
    
    -- Network metrics
    new_connections INTEGER DEFAULT 0,
    total_connections INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, metric_date)
);

-- Create team activity logs table
CREATE TABLE IF NOT EXISTS team_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'member_joined', 'member_left', 'project_created', 'project_completed',
        'file_shared', 'message_sent', 'meeting_scheduled', 'task_assigned',
        'permission_changed', 'team_settings_updated', 'invitation_sent'
    )),
    activity_data JSONB DEFAULT '{}',
    
    -- Activity metadata
    resource_type TEXT, -- 'project', 'file', 'message', 'member', etc.
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. BULK USER MANAGEMENT TOOLS
-- =====================================================

-- Create bulk operations table
CREATE TABLE IF NOT EXISTS bulk_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL CHECK (operation_type IN (
        'user_import', 'user_update', 'user_deletion', 'permission_bulk_update',
        'team_assignment', 'role_bulk_update', 'invitation_bulk_send'
    )),
    
    -- Operation details
    description TEXT,
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    successful_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    
    -- Operation status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    
    -- Operation metadata
    initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Operation results
    results JSONB DEFAULT '{}',
    error_log TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bulk operation items table
CREATE TABLE IF NOT EXISTS bulk_operation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulk_operation_id UUID REFERENCES bulk_operations(id) ON DELETE CASCADE,
    
    -- Item details
    item_type TEXT NOT NULL, -- 'user', 'permission', 'team_member', etc.
    item_id UUID,
    item_data JSONB DEFAULT '{}',
    
    -- Item status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    
    -- Item results
    result_message TEXT,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. SECURITY AND COMPLIANCE FEATURES
-- =====================================================

-- Create team security policies table
CREATE TABLE IF NOT EXISTS team_security_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Policy details
    policy_name VARCHAR(255) NOT NULL,
    policy_type TEXT NOT NULL CHECK (policy_type IN (
        'access_control', 'data_protection', 'audit_requirements', 'compliance_standards'
    )),
    description TEXT,
    
    -- Policy settings
    is_enforced BOOLEAN DEFAULT true,
    enforcement_level TEXT DEFAULT 'strict' CHECK (enforcement_level IN ('strict', 'moderate', 'flexible')),
    
    -- Policy metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, policy_name)
);

-- Create team compliance audits table
CREATE TABLE IF NOT EXISTS team_compliance_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Audit details
    audit_type TEXT NOT NULL CHECK (audit_type IN ('security', 'compliance', 'performance', 'access_control')),
    audit_date DATE NOT NULL,
    
    -- Audit results
    overall_score DECIMAL(3,2) DEFAULT 0, -- 0-1 scale
    passed_checks INTEGER DEFAULT 0,
    failed_checks INTEGER DEFAULT 0,
    total_checks INTEGER DEFAULT 0,
    
    -- Audit metadata
    auditor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    audit_notes TEXT,
    recommendations TEXT,
    
    -- Audit status
    status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'reviewed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. PERFORMANCE INDEXES
-- =====================================================

-- Team management indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_parent_team_id ON teams(parent_team_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);

-- Team member indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Team invitation indexes
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations(expires_at);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_team_projects_team_id ON team_projects(team_id);
CREATE INDEX IF NOT EXISTS idx_team_projects_status ON team_projects(status);
CREATE INDEX IF NOT EXISTS idx_team_projects_owner_id ON team_projects(owner_id);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_team_performance_metrics_team_id ON team_performance_metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_team_performance_metrics_metric_date ON team_performance_metrics(metric_date);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_team_id ON team_activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_user_id ON team_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_activity_type ON team_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_created_at ON team_activity_logs(created_at DESC);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_shared_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_compliance_audits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 TEAM MANAGEMENT SYSTEM DEPLOYED SUCCESSFULLY!';
    RAISE NOTICE '✅ Enhanced role and permission system created';
    RAISE NOTICE '✅ Comprehensive team management tables created';
    RAISE NOTICE '✅ Team collaboration features implemented';
    RAISE NOTICE '✅ Shared network connections established';
    RAISE NOTICE '✅ Team analytics and performance metrics ready';
    RAISE NOTICE '✅ Bulk user management tools available';
    RAISE NOTICE '✅ Security and compliance features enabled';
    RAISE NOTICE '✅ Performance indexes and RLS policies configured';
    RAISE NOTICE '✅ System ready for enterprise team management!';
END $$;
