-- 🏆 COMPREHENSIVE RBAC SYSTEM FOR JEWELRY INDUSTRY
-- This migration creates a world-class access control system specifically designed for jewelry businesses

-- =====================================================
-- 1. JEWELRY INDUSTRY ROLE DEFINITIONS
-- =====================================================

-- Create comprehensive role enum for jewelry industry
CREATE TYPE jewelry_user_role AS ENUM (
    -- Management Roles
    'store_owner',           -- Full system access, can manage everything
    'store_manager',         -- Can manage staff, inventory, customers, reports
    'assistant_manager',     -- Can manage most operations except user management
    
    -- Sales Roles
    'senior_sales_associate', -- Can handle complex sales, view financials
    'sales_associate',       -- Can handle standard sales, limited financial access
    'customer_service_rep',  -- Can handle customer inquiries, basic sales
    
    -- Technical Roles
    'jewelry_designer',      -- Can manage designs, CAD files, production
    'goldsmith',            -- Can manage production, quality control
    'jeweler',              -- Can handle repairs, custom work
    'appraiser',            -- Can assess jewelry value, create appraisals
    
    -- Support Roles
    'inventory_manager',     -- Can manage inventory, suppliers, pricing
    'bookkeeper',           -- Can manage financial data, reports
    'accountant',           -- Can access all financial data, tax reports
    
    -- System Roles
    'system_admin',         -- Can manage system settings, users
    'viewer',               -- Read-only access to most data
    'guest'                 -- Limited access for temporary users
);

-- Create permission categories
CREATE TYPE permission_category AS ENUM (
    'customer_management',   -- Customer data access and management
    'inventory_management',  -- Product and inventory control
    'sales_management',      -- Sales processes and transactions
    'financial_management',  -- Financial data and reporting
    'production_management', -- Manufacturing and quality control
    'user_management',       -- User and role management
    'system_administration', -- System settings and configuration
    'reporting_analytics',   -- Reports and business intelligence
    'network_collaboration', -- Partner and network features
    'file_management'        -- Document and file access
);

-- Create resource types for granular permissions
CREATE TYPE resource_type AS ENUM (
    'global',               -- System-wide permissions
    'department',           -- Department-specific permissions
    'project',              -- Project-specific permissions
    'customer',             -- Customer-specific permissions
    'inventory_item',       -- Individual inventory item permissions
    'financial_report',     -- Specific report permissions
    'team',                 -- Team-specific permissions
    'workspace'             -- Workspace-specific permissions
);

-- =====================================================
-- 2. PERMISSIONS SYSTEM
-- =====================================================

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category permission_category NOT NULL,
    resource_type resource_type DEFAULT 'global',
    resource_id UUID, -- specific resource this permission applies to
    is_sensitive BOOLEAN DEFAULT false, -- marks sensitive permissions
    requires_approval BOOLEAN DEFAULT false, -- requires manager approval
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role jewelry_user_role NOT NULL,
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
    reason TEXT, -- reason for granting this permission
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, permission_id)
);

-- =====================================================
-- 3. TEAM AND DEPARTMENT MANAGEMENT
-- =====================================================

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    team_lead_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role jewelry_user_role NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, user_id)
);

-- =====================================================
-- 4. ENHANCED USER PROFILES
-- =====================================================

-- Create enhanced user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role jewelry_user_role NOT NULL DEFAULT 'viewer',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employee_id VARCHAR(50) UNIQUE, -- Employee ID number
    hire_date DATE,
    termination_date DATE,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. AUDIT AND SECURITY LOGGING
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'login', 'logout', 'permission_denied', 'data_access', etc.
    severity VARCHAR(20) DEFAULT 'info', -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create access attempts table
CREATE TABLE IF NOT EXISTS access_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    permission_required VARCHAR(255),
    access_granted BOOLEAN DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. DATA ACCESS CONTROL
-- =====================================================

-- Create data ownership table
CREATE TABLE IF NOT EXISTS data_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_type VARCHAR(50) DEFAULT 'user', -- 'user', 'department', 'team'
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(resource_type, resource_id, owner_id)
);

-- Create data sharing table
CREATE TABLE IF NOT EXISTS data_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID NOT NULL,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    shared_with_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    permission_level VARCHAR(50) DEFAULT 'read', -- 'read', 'write', 'admin'
    shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS jewelry_user_role AS $$
BEGIN
  RETURN (SELECT role FROM user_profiles WHERE user_id = $1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    user_id UUID,
    permission_name VARCHAR(255),
    resource_type VARCHAR(100) DEFAULT 'global',
    resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role jewelry_user_role;
    has_permission BOOLEAN := false;
BEGIN
    -- Get user role
    SELECT get_user_role(user_id) INTO user_role;
    
    -- Check role-based permissions
    SELECT EXISTS(
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role = user_role
        AND p.name = permission_name
        AND p.resource_type = $3
        AND (p.resource_id = $4 OR p.resource_id IS NULL)
        AND rp.is_active = true
        AND (rp.expires_at IS NULL OR rp.expires_at > NOW())
    ) INTO has_permission;
    
    -- If not found in role permissions, check user-specific permissions
    IF NOT has_permission THEN
        SELECT EXISTS(
            SELECT 1 FROM user_permissions up
            JOIN permissions p ON up.permission_id = p.id
            WHERE up.user_id = $1
            AND p.name = permission_name
            AND p.resource_type = $3
            AND (p.resource_id = $4 OR p.resource_id IS NULL)
            AND up.is_active = true
            AND (up.expires_at IS NULL OR up.expires_at > NOW())
        ) INTO has_permission;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log access attempt
CREATE OR REPLACE FUNCTION log_access_attempt(
    user_id UUID,
    resource_type VARCHAR(100),
    resource_id UUID,
    permission_required VARCHAR(255),
    access_granted BOOLEAN,
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO access_attempts (
        user_id, resource_type, resource_id, permission_required,
        access_granted, ip_address, user_agent
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. INSERT DEFAULT PERMISSIONS
-- =====================================================

-- Insert core permissions
INSERT INTO permissions (name, description, category, resource_type, is_sensitive) VALUES
-- Customer Management
('customers.view', 'View customer information', 'customer_management', 'global', false),
('customers.create', 'Create new customers', 'customer_management', 'global', false),
('customers.edit', 'Edit customer information', 'customer_management', 'global', false),
('customers.delete', 'Delete customers', 'customer_management', 'global', true),
('customers.export', 'Export customer data', 'customer_management', 'global', true),

-- Inventory Management
('inventory.view', 'View inventory items', 'inventory_management', 'global', false),
('inventory.create', 'Add new inventory items', 'inventory_management', 'global', false),
('inventory.edit', 'Edit inventory items', 'inventory_management', 'global', false),
('inventory.delete', 'Delete inventory items', 'inventory_management', 'global', true),
('inventory.pricing', 'View and edit pricing information', 'inventory_management', 'global', true),
('inventory.cost', 'View cost information', 'inventory_management', 'global', true),

-- Sales Management
('sales.view', 'View sales transactions', 'sales_management', 'global', false),
('sales.create', 'Create sales transactions', 'sales_management', 'global', false),
('sales.edit', 'Edit sales transactions', 'sales_management', 'global', false),
('sales.delete', 'Delete sales transactions', 'sales_management', 'global', true),
('sales.refund', 'Process refunds', 'sales_management', 'global', true),

-- Financial Management
('financial.view', 'View financial reports', 'financial_management', 'global', true),
('financial.edit', 'Edit financial data', 'financial_management', 'global', true),
('financial.export', 'Export financial data', 'financial_management', 'global', true),
('financial.approve', 'Approve financial transactions', 'financial_management', 'global', true),

-- Production Management
('production.view', 'View production data', 'production_management', 'global', false),
('production.create', 'Create production orders', 'production_management', 'global', false),
('production.edit', 'Edit production data', 'production_management', 'global', false),
('production.quality', 'Manage quality control', 'production_management', 'global', false),

-- User Management
('users.view', 'View user information', 'user_management', 'global', true),
('users.create', 'Create new users', 'user_management', 'global', true),
('users.edit', 'Edit user information', 'user_management', 'global', true),
('users.delete', 'Delete users', 'user_management', 'global', true),
('users.roles', 'Manage user roles', 'user_management', 'global', true),

-- System Administration
('system.settings', 'Manage system settings', 'system_administration', 'global', true),
('system.backup', 'Manage system backups', 'system_administration', 'global', true),
('system.logs', 'View system logs', 'system_administration', 'global', true),

-- Reporting and Analytics
('reports.view', 'View reports', 'reporting_analytics', 'global', false),
('reports.create', 'Create custom reports', 'reporting_analytics', 'global', false),
('reports.export', 'Export reports', 'reporting_analytics', 'global', false),
('analytics.view', 'View analytics dashboard', 'reporting_analytics', 'global', false);

-- =====================================================
-- 9. INSERT ROLE PERMISSIONS
-- =====================================================

-- Store Owner - Full access to everything
INSERT INTO role_permissions (role, permission_id)
SELECT 'store_owner', id FROM permissions;

-- Store Manager - Most permissions except system admin
INSERT INTO role_permissions (role, permission_id)
SELECT 'store_manager', id FROM permissions 
WHERE category != 'system_administration';

-- Assistant Manager - Management permissions without user management
INSERT INTO role_permissions (role, permission_id)
SELECT 'assistant_manager', id FROM permissions 
WHERE category IN ('customer_management', 'inventory_management', 'sales_management', 'production_management', 'reporting_analytics')
AND name NOT LIKE '%.delete';

-- Senior Sales Associate - Sales and customer management
INSERT INTO role_permissions (role, permission_id)
SELECT 'senior_sales_associate', id FROM permissions 
WHERE category IN ('customer_management', 'sales_management', 'inventory_management')
AND name NOT LIKE '%.delete' AND name NOT LIKE '%.cost';

-- Sales Associate - Basic sales permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'sales_associate', id FROM permissions 
WHERE name IN ('customers.view', 'customers.create', 'customers.edit', 'inventory.view', 'sales.view', 'sales.create', 'sales.edit');

-- Customer Service Rep - Customer and basic sales
INSERT INTO role_permissions (role, permission_id)
SELECT 'customer_service_rep', id FROM permissions 
WHERE name IN ('customers.view', 'customers.create', 'customers.edit', 'inventory.view', 'sales.view');

-- Jewelry Designer - Design and production
INSERT INTO role_permissions (role, permission_id)
SELECT 'jewelry_designer', id FROM permissions 
WHERE category IN ('production_management', 'inventory_management')
AND name NOT LIKE '%.delete' AND name NOT LIKE '%.cost';

-- Goldsmith - Production and quality control
INSERT INTO role_permissions (role, permission_id)
SELECT 'goldsmith', id FROM permissions 
WHERE category IN ('production_management', 'inventory_management')
AND name NOT LIKE '%.delete' AND name NOT LIKE '%.cost';

-- Jeweler - Repairs and custom work
INSERT INTO role_permissions (role, permission_id)
SELECT 'jeweler', id FROM permissions 
WHERE category IN ('production_management', 'inventory_management', 'customer_management')
AND name NOT LIKE '%.delete' AND name NOT LIKE '%.cost';

-- Appraiser - Appraisal and valuation
INSERT INTO role_permissions (role, permission_id)
SELECT 'appraiser', id FROM permissions 
WHERE name IN ('customers.view', 'inventory.view', 'inventory.pricing', 'reports.view', 'reports.create');

-- Inventory Manager - Full inventory control
INSERT INTO role_permissions (role, permission_id)
SELECT 'inventory_manager', id FROM permissions 
WHERE category = 'inventory_management';

-- Bookkeeper - Financial data access
INSERT INTO role_permissions (role, permission_id)
SELECT 'bookkeeper', id FROM permissions 
WHERE category IN ('financial_management', 'sales_management', 'customer_management')
AND name NOT LIKE '%.delete';

-- Accountant - Full financial access
INSERT INTO role_permissions (role, permission_id)
SELECT 'accountant', id FROM permissions 
WHERE category IN ('financial_management', 'sales_management', 'customer_management', 'reporting_analytics');

-- System Admin - System administration
INSERT INTO role_permissions (role, permission_id)
SELECT 'system_admin', id FROM permissions 
WHERE category IN ('system_administration', 'user_management');

-- Viewer - Read-only access
INSERT INTO role_permissions (role, permission_id)
SELECT 'viewer', id FROM permissions 
WHERE name LIKE '%.view' AND category != 'system_administration';

-- Guest - Very limited access
INSERT INTO role_permissions (role, permission_id)
SELECT 'guest', id FROM permissions 
WHERE name IN ('customers.view', 'inventory.view');

-- =====================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Permissions indexes
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_type ON permissions(resource_type);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

-- Role permissions indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_active ON role_permissions(is_active);

-- User permissions indexes
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_active ON user_permissions(is_active);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Security events indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- Access attempts indexes
CREATE INDEX IF NOT EXISTS idx_access_attempts_user_id ON access_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_access_attempts_resource_type ON access_attempts(resource_type);
CREATE INDEX IF NOT EXISTS idx_access_attempts_created_at ON access_attempts(created_at);

-- =====================================================
-- 11. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sharing ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 12. CREATE RLS POLICIES
-- =====================================================

-- Permissions policies (only system admins can manage)
CREATE POLICY "System admins can manage permissions" ON permissions
    FOR ALL USING (get_user_role(auth.uid()) = 'system_admin');

-- Role permissions policies (only system admins can manage)
CREATE POLICY "System admins can manage role permissions" ON role_permissions
    FOR ALL USING (get_user_role(auth.uid()) = 'system_admin');

-- User permissions policies (managers and system admins can manage)
CREATE POLICY "Managers can manage user permissions" ON user_permissions
    FOR ALL USING (
        get_user_role(auth.uid()) IN ('store_owner', 'store_manager', 'system_admin')
    );

-- User profiles policies (users can view their own, managers can manage)
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can manage user profiles" ON user_profiles
    FOR ALL USING (
        get_user_role(auth.uid()) IN ('store_owner', 'store_manager', 'system_admin')
    );

-- Audit logs policies (only system admins and managers can view)
CREATE POLICY "Managers can view audit logs" ON audit_logs
    FOR SELECT USING (
        get_user_role(auth.uid()) IN ('store_owner', 'store_manager', 'system_admin')
    );

-- Security events policies (only system admins can view)
CREATE POLICY "System admins can view security events" ON security_events
    FOR SELECT USING (get_user_role(auth.uid()) = 'system_admin');

-- Access attempts policies (only system admins can view)
CREATE POLICY "System admins can view access attempts" ON access_attempts
    FOR SELECT USING (get_user_role(auth.uid()) = 'system_admin');

-- =====================================================
-- 13. CREATE TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, old_values, new_values
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_user_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_user_permissions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_role_permissions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- 14. INSERT DEFAULT DEPARTMENTS
-- =====================================================

INSERT INTO departments (name, description) VALUES
('Management', 'Store management and administration'),
('Sales', 'Customer sales and service'),
('Production', 'Jewelry manufacturing and repair'),
('Inventory', 'Inventory management and procurement'),
('Finance', 'Financial management and accounting'),
('Customer Service', 'Customer support and inquiries');

-- =====================================================
-- 15. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT ON user_permissions TO authenticated;
GRANT SELECT ON departments TO authenticated;
GRANT SELECT ON teams TO authenticated;
GRANT SELECT ON team_members TO authenticated;
GRANT SELECT ON user_profiles TO authenticated;

-- Grant permissions to service role for system operations
GRANT ALL ON permissions TO service_role;
GRANT ALL ON role_permissions TO service_role;
GRANT ALL ON user_permissions TO service_role;
GRANT ALL ON departments TO service_role;
GRANT ALL ON teams TO service_role;
GRANT ALL ON team_members TO service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON audit_logs TO service_role;
GRANT ALL ON security_events TO service_role;
GRANT ALL ON access_attempts TO service_role;
GRANT ALL ON data_ownership TO service_role;
GRANT ALL ON data_sharing TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log successful migration
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
VALUES (
    NULL,
    'MIGRATION',
    'system',
    gen_random_uuid(),
    '{"migration": "comprehensive_rbac_system", "status": "completed", "timestamp": "' || NOW() || '"}'
);
