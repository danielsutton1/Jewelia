-- Complete Team Management System for Jewelia CRM
-- Run this in your Supabase SQL Editor

-- Step 1: Create enhanced user roles enum for jewelry industry
DO $$ BEGIN
    CREATE TYPE jewelry_role AS ENUM (
        'admin',
        'manager',
        'sales_representative',
        'jewelry_designer',
        'gemologist',
        'metalsmith',
        'quality_control',
        'inventory_specialist',
        'customer_service',
        'logistics_coordinator',
        'accountant',
        'marketing_specialist',
        'appraiser',
        'repair_technician',
        'store_manager',
        'assistant'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create business/company table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100) DEFAULT 'jewelry',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    tax_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Enhanced users table with jewelry-specific fields
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN business_id UUID REFERENCES businesses(id);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN jewelry_role jewelry_role DEFAULT 'assistant';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN phone VARCHAR(50);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN bio TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN hire_date DATE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN department VARCHAR(100);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN supervisor_id UUID REFERENCES users(id);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN emergency_contact JSONB;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN certifications JSONB;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN skills JSONB;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Step 4: Create user_permissions table for granular access control
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) NOT NULL,
    permission_value BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permission_key)
);

-- Step 5: Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create team_members table for additional team info
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE,
    salary_range VARCHAR(100),
    benefits JSONB,
    performance_notes TEXT,
    training_completed JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Fix internal_messages table with proper foreign keys
DROP TABLE IF EXISTS internal_messages CASCADE;
CREATE TABLE internal_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'unread',
    is_admin_message BOOLEAN DEFAULT FALSE,
    business_id UUID REFERENCES businesses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_jewelry_role ON users(jewelry_role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_supervisor_id ON users(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_business_id ON team_members(business_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_business_id ON departments(business_id);

-- Step 9: Insert default business
INSERT INTO businesses (id, name, description, industry, address, phone, email, website)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Jewelia Jewelry Co.',
    'Premium jewelry design and manufacturing company specializing in custom pieces and fine jewelry.',
    'jewelry',
    '123 Jewelry Lane, Diamond District, NY 10001',
    '+1-555-0123',
    'info@jewelia.com',
    'https://jewelia.com'
) ON CONFLICT DO NOTHING;

-- Step 10: Insert sample team members with jewelry-specific roles
INSERT INTO users (id, email, full_name, role, jewelry_role, business_id, phone, department, bio, hire_date)
VALUES 
    ('fdb2a122-d6ae-4e78-b277-3317e1a09132', 'test@jewelia.com', 'Test User', 'admin', 'admin', '550e8400-e29b-41d4-a716-446655440000', '+1-555-0001', 'Management', 'System administrator and business owner', '2024-01-01'),
    ('550e8400-e29b-41d4-a716-446655440001', 'michael.jones@jewelia.com', 'Michael Jones', 'manager', 'store_manager', '550e8400-e29b-41d4-a716-446655440000', '+1-555-0002', 'Sales', 'Experienced store manager with 15 years in luxury retail', '2024-01-15'),
    ('550e8400-e29b-41d4-a716-446655440002', 'daniel.smith@jewelia.com', 'Daniel Smith', 'staff', 'jewelry_designer', '550e8400-e29b-41d4-a716-446655440000', '+1-555-0003', 'Design', 'Creative jewelry designer specializing in modern and vintage styles', '2024-02-01'),
    ('550e8400-e29b-41d4-a716-446655440003', 'eli.martin@jewelia.com', 'Eli Martin', 'staff', 'gemologist', '550e8400-e29b-41d4-a716-446655440000', '+1-555-0004', 'Quality Control', 'Certified gemologist with expertise in diamond grading and certification', '2024-02-15'),
    ('550e8400-e29b-41d4-a716-446655440004', 'lisa.rodriguez@jewelia.com', 'Lisa Rodriguez', 'staff', 'sales_representative', '550e8400-e29b-41d4-a716-446655440000', '+1-555-0005', 'Sales', 'Top-performing sales representative with excellent customer relationships', '2024-03-01'),
    ('550e8400-e29b-41d4-a716-446655440005', 'renee.lepir@jewelia.com', 'Renee Lepir', 'staff', 'metalsmith', '550e8400-e29b-41d4-a716-446655440000', '+1-555-0006', 'Production', 'Skilled metalsmith specializing in platinum and gold work', '2024-03-15')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    jewelry_role = EXCLUDED.jewelry_role,
    business_id = EXCLUDED.business_id,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department,
    bio = EXCLUDED.bio,
    hire_date = EXCLUDED.hire_date;

-- Step 11: Insert team member records
INSERT INTO team_members (user_id, business_id, employee_id, start_date, salary_range, benefits)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'EMP001', '2024-01-15', '$60,000 - $80,000', '{"health_insurance": true, "dental_insurance": true, "retirement_plan": true}'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'EMP002', '2024-02-01', '$50,000 - $70,000', '{"health_insurance": true, "dental_insurance": true, "retirement_plan": true}'),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'EMP003', '2024-02-15', '$55,000 - $75,000', '{"health_insurance": true, "dental_insurance": true, "retirement_plan": true}'),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'EMP004', '2024-03-01', '$45,000 - $65,000', '{"health_insurance": true, "dental_insurance": true, "retirement_plan": true}'),
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'EMP005', '2024-03-15', '$50,000 - $70,000', '{"health_insurance": true, "dental_insurance": true, "retirement_plan": true}')
ON CONFLICT (user_id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    start_date = EXCLUDED.start_date,
    salary_range = EXCLUDED.salary_range,
    benefits = EXCLUDED.benefits;

-- Step 12: Insert departments
INSERT INTO departments (business_id, name, description, manager_id, color)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Management', 'Executive and administrative functions', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', '#EF4444'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Sales', 'Customer acquisition and relationship management', '550e8400-e29b-41d4-a716-446655440001', '#3B82F6'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Design', 'Jewelry design and creative development', '550e8400-e29b-41d4-a716-446655440002', '#8B5CF6'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Quality Control', 'Gemology and quality assurance', '550e8400-e29b-41d4-a716-446655440003', '#10B981'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Production', 'Manufacturing and metalsmithing', '550e8400-e29b-41d4-a716-446655440005', '#F59E0B')
ON CONFLICT DO NOTHING;

-- Step 13: Insert sample internal message
INSERT INTO internal_messages (sender_id, recipient_id, subject, content, message_type, priority, business_id)
VALUES (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001',
    'Welcome to the Team!',
    'Welcome Michael! We''re excited to have you join our jewelry team. Your experience in luxury retail will be invaluable.',
    'announcement',
    'high',
    '550e8400-e29b-41d4-a716-446655440000'
);

-- Step 14: Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and admins can view all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Business access policies
CREATE POLICY "Users can view own business" ON businesses FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND business_id = businesses.id)
);

-- Team members policies
CREATE POLICY "Users can view own team info" ON team_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND business_id = team_members.business_id)
);

-- Internal messages policies
CREATE POLICY "Users can view messages in their business" ON internal_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND business_id = internal_messages.business_id)
);
CREATE POLICY "Users can send messages in their business" ON internal_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND business_id = internal_messages.business_id)
);

-- Step 15: Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_business_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT business_id FROM users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role::text FROM users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 16: Create triggers for updated_at
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Team Management System created successfully!' as status;
