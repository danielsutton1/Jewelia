-- CAD Files Management System Migration
-- Comprehensive system for CAD file storage, version control, design workflows, and production integration

-- CAD Files Table - Core file storage with versioning
CREATE TABLE IF NOT EXISTS cad_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN (
        'stl', '3dm', 'cad', 'step', 'iges', 'obj', 'dwg', 'dxf', 'skp', 'blend', 'max', 'fbx', 'other'
    )),
    mime_type VARCHAR(100),
    version_number INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES cad_files(id) ON DELETE SET NULL,
    is_latest_version BOOLEAN DEFAULT true,
    
    -- Design Information
    design_name VARCHAR(255),
    design_description TEXT,
    designer_id UUID, -- References users table if exists
    designer_name VARCHAR(255),
    design_category VARCHAR(100),
    design_tags TEXT[], -- Array of tags
    
    -- Technical Specifications
    dimensions JSONB, -- {length, width, height, units}
    material_specs JSONB, -- {material_type, weight, density, etc.}
    complexity_score DECIMAL(3,2), -- 0.00 to 10.00
    estimated_print_time INTEGER, -- in minutes
    estimated_material_cost DECIMAL(10,2),
    
    -- Workflow Status
    workflow_status VARCHAR(50) DEFAULT 'draft' CHECK (workflow_status IN (
        'draft', 'in_review', 'approved', 'rejected', 'in_production', 'completed', 'archived'
    )),
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN (
        'pending', 'approved', 'rejected', 'needs_revision'
    )),
    
    -- Metadata
    thumbnail_path TEXT,
    preview_url TEXT,
    checksum VARCHAR(64), -- For file integrity
    metadata JSONB, -- Additional flexible data
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID
);

-- Design Workflows Table - Approval process management
CREATE TABLE IF NOT EXISTS design_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
    workflow_type VARCHAR(50) NOT NULL CHECK (workflow_type IN (
        'design_review', 'production_approval', 'quality_check', 'customer_approval'
    )),
    current_step VARCHAR(50) NOT NULL,
    total_steps INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active', 'completed', 'cancelled', 'on_hold'
    )),
    assigned_to UUID, -- References users table if exists
    assigned_by UUID, -- References users table if exists
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Steps Table - Individual steps in approval process
CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES design_workflows(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50) NOT NULL CHECK (step_type IN (
        'review', 'approval', 'revision', 'notification', 'quality_check'
    )),
    assigned_to UUID, -- References users table if exists
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'skipped', 'rejected'
    )),
    required_approval BOOLEAN DEFAULT false,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Categories Table - Organization and tagging
CREATE TABLE IF NOT EXISTS cad_file_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES cad_file_categories(id) ON DELETE SET NULL,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Comments Table - Collaboration and feedback
CREATE TABLE IF NOT EXISTS cad_file_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES cad_file_comments(id) ON DELETE CASCADE,
    author_id UUID, -- References users table if exists
    author_name VARCHAR(255) NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general' CHECK (comment_type IN (
        'general', 'feedback', 'revision_request', 'approval_note', 'production_note'
    )),
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Integration Table - Link to manufacturing
CREATE TABLE IF NOT EXISTS cad_production_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
    production_item_id UUID, -- References production_items or inventory table
    production_order_id UUID, -- References production_orders table
    link_type VARCHAR(50) NOT NULL CHECK (link_type IN (
        'primary_design', 'reference_design', 'tooling', 'fixture', 'packaging'
    )),
    manufacturing_notes TEXT,
    material_requirements JSONB, -- {material_type, quantity, specifications}
    cost_impact DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Access Control Table - Permissions and sharing
CREATE TABLE IF NOT EXISTS cad_file_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
    user_id UUID, -- References users table if exists
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'owner', 'editor', 'viewer', 'approver', 'reviewer'
    )),
    permissions JSONB, -- {can_view, can_edit, can_delete, can_approve, can_share}
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- File Change History Table - Audit trail
CREATE TABLE IF NOT EXISTS cad_file_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cad_file_id UUID REFERENCES cad_files(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
        'created', 'updated', 'version_created', 'status_changed', 'approved', 'rejected'
    )),
    changed_by UUID, -- References users table if exists
    changed_by_name VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_cad_files_parent_id ON cad_files(parent_file_id);
CREATE INDEX idx_cad_files_workflow_status ON cad_files(workflow_status);
CREATE INDEX idx_cad_files_designer_id ON cad_files(designer_id);
CREATE INDEX idx_cad_files_category ON cad_files(design_category);
CREATE INDEX idx_cad_files_file_type ON cad_files(file_type);
CREATE INDEX idx_cad_files_created_at ON cad_files(created_at);
CREATE INDEX idx_cad_files_is_latest_version ON cad_files(is_latest_version);

CREATE INDEX idx_design_workflows_cad_file_id ON design_workflows(cad_file_id);
CREATE INDEX idx_design_workflows_status ON design_workflows(status);
CREATE INDEX idx_design_workflows_assigned_to ON design_workflows(assigned_to);

CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_status ON workflow_steps(status);
CREATE INDEX idx_workflow_steps_assigned_to ON workflow_steps(assigned_to);

CREATE INDEX idx_cad_file_comments_cad_file_id ON cad_file_comments(cad_file_id);
CREATE INDEX idx_cad_file_comments_author_id ON cad_file_comments(author_id);
CREATE INDEX idx_cad_file_comments_type ON cad_file_comments(comment_type);

CREATE INDEX idx_cad_production_links_cad_file_id ON cad_production_links(cad_file_id);
CREATE INDEX idx_cad_production_links_production_item_id ON cad_production_links(production_item_id);

CREATE INDEX idx_cad_file_permissions_cad_file_id ON cad_file_permissions(cad_file_id);
CREATE INDEX idx_cad_file_permissions_user_id ON cad_file_permissions(user_id);

CREATE INDEX idx_cad_file_changes_cad_file_id ON cad_file_changes(cad_file_id);
CREATE INDEX idx_cad_file_changes_type ON cad_file_changes(change_type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cad_files_updated_at BEFORE UPDATE ON cad_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_workflows_updated_at BEFORE UPDATE ON design_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cad_file_categories_updated_at BEFORE UPDATE ON cad_file_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cad_file_comments_updated_at BEFORE UPDATE ON cad_file_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cad_production_links_updated_at BEFORE UPDATE ON cad_production_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update version numbers
CREATE OR REPLACE FUNCTION update_cad_file_version()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new version (parent_file_id is set)
    IF NEW.parent_file_id IS NOT NULL THEN
        -- Get the latest version number from parent
        SELECT COALESCE(MAX(version_number), 0) + 1 
        INTO NEW.version_number 
        FROM cad_files 
        WHERE parent_file_id = NEW.parent_file_id;
        
        -- Set previous latest version to false
        UPDATE cad_files 
        SET is_latest_version = false 
        WHERE parent_file_id = NEW.parent_file_id AND is_latest_version = true;
        
        -- Set this as the latest version
        NEW.is_latest_version = true;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cad_file_version_trigger 
    BEFORE INSERT ON cad_files
    FOR EACH ROW EXECUTE FUNCTION update_cad_file_version();

-- Insert sample categories
INSERT INTO cad_file_categories (name, description, color, icon, sort_order) VALUES
('Rings', 'Ring designs and variations', '#FF6B6B', 'ring', 1),
('Necklaces', 'Necklace and pendant designs', '#4ECDC4', 'necklace', 2),
('Earrings', 'Earring designs and studs', '#45B7D1', 'earrings', 3),
('Bracelets', 'Bracelet and bangle designs', '#96CEB4', 'bracelet', 4),
('Pendants', 'Pendant and charm designs', '#FFEAA7', 'pendant', 5),
('Wedding Bands', 'Wedding and engagement rings', '#DDA0DD', 'wedding-ring', 6),
('Custom Designs', 'Custom and one-of-a-kind pieces', '#98D8C8', 'custom', 7),
('Prototypes', 'Prototype and test designs', '#F7DC6F', 'prototype', 8);

-- Insert subcategories
INSERT INTO cad_file_categories (name, description, parent_category_id, color, icon, sort_order) VALUES
('Solitaire Rings', 'Single stone ring designs', (SELECT id FROM cad_file_categories WHERE name = 'Rings'), '#FF8A80', 'solitaire', 1),
('Halo Rings', 'Halo setting ring designs', (SELECT id FROM cad_file_categories WHERE name = 'Rings'), '#FFAB91', 'halo', 2),
('Vintage Rings', 'Vintage and antique style rings', (SELECT id FROM cad_file_categories WHERE name = 'Rings'), '#FFCC02', 'vintage', 3),
('Modern Rings', 'Contemporary ring designs', (SELECT id FROM cad_file_categories WHERE name = 'Rings'), '#FF7043', 'modern', 4);

-- Row Level Security Policies
ALTER TABLE cad_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_file_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_file_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_production_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_file_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_file_changes ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON cad_files FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON cad_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON cad_files FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON design_workflows FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON design_workflows FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON design_workflows FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON workflow_steps FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON workflow_steps FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON workflow_steps FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON cad_file_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON cad_file_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON cad_file_categories FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON cad_file_comments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON cad_file_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON cad_file_comments FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON cad_production_links FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON cad_production_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON cad_production_links FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON cad_file_permissions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON cad_file_permissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON cad_file_permissions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON cad_file_changes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON cad_file_changes FOR INSERT WITH CHECK (true); 