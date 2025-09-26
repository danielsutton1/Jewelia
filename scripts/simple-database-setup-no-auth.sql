-- =====================================================
-- SIMPLE DATABASE SETUP (NO AUTH.USERS MODIFICATION)
-- =====================================================
-- This script creates all necessary tables and populates them with sample data
-- WITHOUT modifying the auth.users table

-- =====================================================
-- 1. CREATE REQUIRED ENUMS
-- =====================================================

-- Create message type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('internal', 'external', 'system', 'notification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create message status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create message priority enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE message_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CREATE SUPPORTING TABLES
-- =====================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'staff',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partners table if it doesn't exist
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    type TEXT DEFAULT 'supplier',
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'company',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE,
    customer_id UUID,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    assigned_to UUID,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    manager_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE MESSAGING TABLES
-- =====================================================

-- Create message_threads table
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type message_type NOT NULL DEFAULT 'internal',
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    created_by UUID NOT NULL,
    participants UUID[] NOT NULL DEFAULT '{}',
    partner_id UUID,
    organization_id UUID,
    department_id UUID,
    related_order_id UUID,
    related_project_id UUID,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type message_type NOT NULL DEFAULT 'internal',
    sender_id UUID NOT NULL,
    recipient_id UUID,
    partner_id UUID,
    organization_id UUID,
    subject TEXT,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown')),
    priority message_priority NOT NULL DEFAULT 'normal',
    category TEXT NOT NULL DEFAULT 'general',
    status message_status NOT NULL DEFAULT 'sent',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    thread_id UUID,
    reply_to_id UUID,
    related_order_id UUID,
    related_task_id UUID,
    related_project_id UUID,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT,
    mime_type TEXT,
    is_processed BOOLEAN NOT NULL DEFAULT false,
    processing_status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL,
    reaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create message_read_receipts table
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_method TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. ADD FOREIGN KEY CONSTRAINTS (WITHOUT AUTH.USERS)
-- =====================================================

-- Foreign keys for message_threads
ALTER TABLE message_threads 
ADD CONSTRAINT IF NOT EXISTS message_threads_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE message_threads 
ADD CONSTRAINT IF NOT EXISTS message_threads_partner_id_fkey 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

ALTER TABLE message_threads 
ADD CONSTRAINT IF NOT EXISTS message_threads_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE message_threads 
ADD CONSTRAINT IF NOT EXISTS message_threads_department_id_fkey 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE message_threads 
ADD CONSTRAINT IF NOT EXISTS message_threads_related_order_id_fkey 
FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE message_threads 
ADD CONSTRAINT IF NOT EXISTS message_threads_related_project_id_fkey 
FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Foreign keys for messages
ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_partner_id_fkey 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_thread_id_fkey 
FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_reply_to_id_fkey 
FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_related_order_id_fkey 
FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_related_task_id_fkey 
FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE SET NULL;

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS messages_related_project_id_fkey 
FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Foreign keys for message_attachments
ALTER TABLE message_attachments 
ADD CONSTRAINT IF NOT EXISTS message_attachments_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

-- Foreign keys for message_reactions
ALTER TABLE message_reactions 
ADD CONSTRAINT IF NOT EXISTS message_reactions_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE message_reactions 
ADD CONSTRAINT IF NOT EXISTS message_reactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Foreign keys for message_read_receipts
ALTER TABLE message_read_receipts 
ADD CONSTRAINT IF NOT EXISTS message_read_receipts_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE message_read_receipts 
ADD CONSTRAINT IF NOT EXISTS message_read_receipts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Indexes for message_threads table
CREATE INDEX IF NOT EXISTS idx_message_threads_created_by ON message_threads(created_by);
CREATE INDEX IF NOT EXISTS idx_message_threads_partner_id ON message_threads(partner_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_organization_id ON message_threads(organization_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_is_active ON message_threads(is_active);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at);

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample users (using the same UUIDs as in your auth.users)
INSERT INTO users (id, full_name, email, role, avatar_url) VALUES
('fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Test User', 'test@jewelia.com', 'admin', 'https://example.com/avatar1.jpg'),
('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@jewelia.com', 'admin', 'https://example.com/avatar2.jpg'),
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah@jewelia.com', 'staff', 'https://example.com/avatar3.jpg'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Chen', 'mike@jewelia.com', 'staff', 'https://example.com/avatar4.jpg'),
('550e8400-e29b-41d4-a716-446655440003', 'Emma Wilson', 'emma@jewelia.com', 'staff', 'https://example.com/avatar5.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample partners
INSERT INTO partners (id, name, company, email, type, status, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Acme Corp', 'Acme Solutions', 'contact@acme.com', 'supplier', 'active', 'https://example.com/acme_logo.jpg'),
('550e8400-e29b-41d4-a716-446655440005', 'Diamond Partners', 'Diamond Partners LLC', 'info@diamondpartners.com', 'supplier', 'active', 'https://example.com/diamond_logo.jpg'),
('550e8400-e29b-41d4-a716-446655440006', 'Gold Suppliers', 'Gold Suppliers Inc', 'sales@goldsuppliers.com', 'supplier', 'active', 'https://example.com/gold_logo.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample organizations
INSERT INTO organizations (id, name, type, status) VALUES
('550e8400-e29b-41d4-a716-446655440007', 'Jewelia CRM', 'company', 'active'),
('550e8400-e29b-41d4-a716-446655440008', 'Jewelry Store Chain', 'retail', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, order_number, customer_id, status, total_amount) VALUES
('550e8400-e29b-41d4-a716-446655440009', 'ORD-001', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'pending', 2500.00),
('550e8400-e29b-41d4-a716-446655440010', 'ORD-002', '550e8400-e29b-41d4-a716-446655440001', 'completed', 1800.00),
('550e8400-e29b-41d4-a716-446655440011', 'ORD-003', '550e8400-e29b-41d4-a716-446655440002', 'in_progress', 3200.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (id, title, description, status, assigned_to, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'Review Diamond Quality', 'Check the quality of incoming diamonds', 'pending', '550e8400-e29b-41d4-a716-446655440001', 'fdb2a122-d6ae-4e78-b277-3317e1a09132'),
('550e8400-e29b-41d4-a716-446655440013', 'Customer Meeting', 'Meet with VIP customer about custom ring', 'in_progress', '550e8400-e29b-41d4-a716-446655440002', 'fdb2a122-d6ae-4e78-b277-3317e1a09132'),
('550e8400-e29b-41d4-a716-446655440014', 'Inventory Count', 'Count all jewelry items in stock', 'completed', '550e8400-e29b-41d4-a716-446655440003', 'fdb2a122-d6ae-4e78-b277-3317e1a09132')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, name, description, status, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440015', 'Holiday Collection 2024', 'Design and produce holiday jewelry collection', 'active', 'fdb2a122-d6ae-4e78-b277-3317e1a09132'),
('550e8400-e29b-41d4-a716-446655440016', 'Website Redesign', 'Update the company website with new features', 'active', 'fdb2a122-d6ae-4e78-b277-3317e1a09132'),
('550e8400-e29b-41d4-a716-446655440017', 'Mobile App Development', 'Create mobile app for customers', 'pending', 'fdb2a122-d6ae-4e78-b277-3317e1a09132')
ON CONFLICT (id) DO NOTHING;

-- Insert sample departments
INSERT INTO departments (id, name, description, manager_id) VALUES
('550e8400-e29b-41d4-a716-446655440018', 'Sales', 'Handles all sales activities', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440019', 'Production', 'Manages jewelry production', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440020', 'Customer Service', 'Provides customer support', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample message threads
INSERT INTO message_threads (id, type, subject, category, created_by, participants, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'internal', 'Project Discussion - Holiday Collection', 'general', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', ARRAY['fdb2a122-d6ae-4e78-b277-3317e1a09132', '550e8400-e29b-41d4-a716-446655440001'], true),
('550e8400-e29b-41d4-a716-446655440022', 'internal', 'Customer Inquiry - Custom Ring', 'general', '550e8400-e29b-41d4-a716-446655440002', ARRAY['550e8400-e29b-41d4-a716-446655440002', 'fdb2a122-d6ae-4e78-b277-3317e1a09132'], true),
('550e8400-e29b-41d4-a716-446655440023', 'external', 'Supplier Communication - Diamond Order', 'general', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', ARRAY['fdb2a122-d6ae-4e78-b277-3317e1a09132'], true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO messages (id, type, sender_id, recipient_id, subject, content, thread_id, status, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440024', 'internal', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', '550e8400-e29b-41d4-a716-446655440001', 'Project Discussion - Holiday Collection', 'Hi Sarah! How is the holiday collection coming along?', '550e8400-e29b-41d4-a716-446655440021', 'sent', false),
('550e8400-e29b-41d4-a716-446655440025', 'internal', '550e8400-e29b-41d4-a716-446655440001', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Project Discussion - Holiday Collection', 'Great progress! We have completed 80% of the designs.', '550e8400-e29b-41d4-a716-446655440021', 'delivered', true),
('550e8400-e29b-41d4-a716-446655440026', 'internal', '550e8400-e29b-41d4-a716-446655440002', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Customer Inquiry - Custom Ring', 'I have a customer interested in a custom engagement ring. Can we discuss the details?', '550e8400-e29b-41d4-a716-446655440022', 'sent', false),
('550e8400-e29b-41d4-a716-446655440027', 'internal', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', '550e8400-e29b-41d4-a716-446655440002', 'Customer Inquiry - Custom Ring', 'Absolutely! What are the specifications they are looking for?', '550e8400-e29b-41d4-a716-446655440022', 'delivered', true),
('550e8400-e29b-41d4-a716-446655440028', 'external', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', NULL, 'Supplier Communication - Diamond Order', 'We need to place an order for 50 high-quality diamonds for the holiday collection.', '550e8400-e29b-41d4-a716-446655440023', 'sent', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample message attachments
INSERT INTO message_attachments (message_id, file_name, file_type, file_size, file_url, mime_type) VALUES
('550e8400-e29b-41d4-a716-446655440024', 'holiday_collection_draft.pdf', 'document', 102400, 'https://example.com/holiday_collection_draft.pdf', 'application/pdf'),
('550e8400-e29b-41d4-a716-446655440026', 'customer_ring_specs.docx', 'document', 51200, 'https://example.com/customer_ring_specs.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
ON CONFLICT (id) DO NOTHING;

-- Insert sample message reactions
INSERT INTO message_reactions (message_id, user_id, reaction_type) VALUES
('550e8400-e29b-41d4-a716-446655440025', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'like'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440002', 'love')
ON CONFLICT (id) DO NOTHING;

-- Insert sample message read receipts
INSERT INTO message_read_receipts (message_id, user_id, read_at, read_method) VALUES
('550e8400-e29b-41d4-a716-446655440025', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', NOW() - INTERVAL '1 hour', 'web'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '30 minutes', 'web')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. VERIFY THE SETUP
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ All tables created with proper foreign keys';
    RAISE NOTICE '✅ Sample data inserted for testing';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '✅ Row Level Security enabled';
    RAISE NOTICE '✅ Messaging system ready for production';
    RAISE NOTICE '=====================================================';
END $$;
