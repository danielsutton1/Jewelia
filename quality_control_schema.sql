-- Quality Control System Database Schema
-- Phase 5.5, Priority 4: Quality Control System

-- Quality Standards Table
CREATE TABLE IF NOT EXISTS quality_standards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'incoming', 'in_process', 'final', 'packaging'
    criteria JSONB NOT NULL, -- Detailed quality criteria
    pass_threshold DECIMAL(5,2) NOT NULL, -- Minimum score to pass
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Quality Checkpoints Table
CREATE TABLE IF NOT EXISTS quality_checkpoints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    standard_id UUID REFERENCES quality_standards(id),
    production_step VARCHAR(100), -- Integration with production workflow
    equipment_id UUID REFERENCES equipment(id), -- Integration with equipment
    inspector_role VARCHAR(100), -- Required role for inspection
    estimated_duration INTEGER, -- Minutes
    is_required BOOLEAN DEFAULT true,
    order_sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Quality Inspections Table
CREATE TABLE IF NOT EXISTS quality_inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inspection_number VARCHAR(50) UNIQUE NOT NULL,
    checkpoint_id UUID REFERENCES quality_checkpoints(id),
    batch_id UUID REFERENCES production_batches(id), -- Integration with production
    order_id UUID REFERENCES orders(id), -- Integration with orders
    inspector_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'passed', 'failed', 'rework'
    score DECIMAL(5,2),
    notes TEXT,
    photos JSONB, -- Array of photo URLs
    evidence JSONB, -- Additional evidence data
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Quality Defects Table
CREATE TABLE IF NOT EXISTS quality_defects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inspection_id UUID REFERENCES quality_inspections(id),
    defect_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'minor', 'major', 'critical'
    description TEXT NOT NULL,
    location VARCHAR(255), -- Where the defect was found
    photos JSONB, -- Array of defect photo URLs
    root_cause TEXT,
    corrective_action TEXT,
    supplier_id UUID REFERENCES suppliers(id), -- If supplier-related
    cost_impact DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
    assigned_to UUID REFERENCES auth.users(id),
    due_date DATE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Quality Certificates Table
CREATE TABLE IF NOT EXISTS quality_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    certificate_type VARCHAR(100) NOT NULL, -- 'authenticity', 'quality', 'compliance'
    order_id UUID REFERENCES orders(id),
    batch_id UUID REFERENCES production_batches(id),
    issued_by UUID REFERENCES auth.users(id),
    issued_date DATE NOT NULL,
    expiry_date DATE,
    certificate_data JSONB, -- Certificate details and specifications
    digital_signature TEXT,
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Quality Compliance Records Table
CREATE TABLE IF NOT EXISTS quality_compliance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    standard_name VARCHAR(255) NOT NULL,
    compliance_type VARCHAR(100) NOT NULL, -- 'ISO', 'industry', 'custom'
    audit_date DATE NOT NULL,
    auditor_id UUID REFERENCES auth.users(id),
    score DECIMAL(5,2),
    status VARCHAR(50) NOT NULL, -- 'compliant', 'non_compliant', 'pending'
    findings TEXT,
    corrective_actions TEXT,
    next_audit_date DATE,
    documentation JSONB, -- Audit documentation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Quality Metrics Table (for analytics)
CREATE TABLE IF NOT EXISTS quality_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'defect_rate', 'pass_rate', 'rework_rate'
    value DECIMAL(10,4) NOT NULL,
    target_value DECIMAL(10,4),
    category VARCHAR(100), -- 'overall', 'by_product', 'by_supplier'
    category_id UUID, -- Product ID, Supplier ID, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quality_inspections_batch_id ON quality_inspections(batch_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_order_id ON quality_inspections(order_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_status ON quality_inspections(status);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_inspector_id ON quality_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_created_at ON quality_inspections(created_at);

CREATE INDEX IF NOT EXISTS idx_quality_defects_inspection_id ON quality_defects(inspection_id);
CREATE INDEX IF NOT EXISTS idx_quality_defects_status ON quality_defects(status);
CREATE INDEX IF NOT EXISTS idx_quality_defects_severity ON quality_defects(severity);
CREATE INDEX IF NOT EXISTS idx_quality_defects_supplier_id ON quality_defects(supplier_id);

CREATE INDEX IF NOT EXISTS idx_quality_certificates_order_id ON quality_certificates(order_id);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_batch_id ON quality_certificates(batch_id);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_issued_date ON quality_certificates(issued_date);

CREATE INDEX IF NOT EXISTS idx_quality_metrics_date ON quality_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_type ON quality_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_category ON quality_metrics(category);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quality_standards_updated_at BEFORE UPDATE ON quality_standards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_checkpoints_updated_at BEFORE UPDATE ON quality_checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_inspections_updated_at BEFORE UPDATE ON quality_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_defects_updated_at BEFORE UPDATE ON quality_defects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_certificates_updated_at BEFORE UPDATE ON quality_certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_compliance_updated_at BEFORE UPDATE ON quality_compliance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate inspection numbers
CREATE OR REPLACE FUNCTION generate_inspection_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.inspection_number := 'QC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('inspection_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for inspection numbers
CREATE SEQUENCE IF NOT EXISTS inspection_sequence START 1;

-- Create trigger for inspection numbers
CREATE TRIGGER generate_inspection_number_trigger BEFORE INSERT ON quality_inspections FOR EACH ROW EXECUTE FUNCTION generate_inspection_number();

-- Create function to generate certificate numbers
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.certificate_number := 'CERT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('certificate_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for certificate numbers
CREATE SEQUENCE IF NOT EXISTS certificate_sequence START 1;

-- Create trigger for certificate numbers
CREATE TRIGGER generate_certificate_number_trigger BEFORE INSERT ON quality_certificates FOR EACH ROW EXECUTE FUNCTION generate_certificate_number();

-- Enable Row Level Security
ALTER TABLE quality_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view quality standards" ON quality_standards FOR SELECT USING (true);
CREATE POLICY "Quality managers can manage standards" ON quality_standards FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('quality_manager', 'admin'))
);

CREATE POLICY "Users can view quality checkpoints" ON quality_checkpoints FOR SELECT USING (true);
CREATE POLICY "Quality managers can manage checkpoints" ON quality_checkpoints FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('quality_manager', 'admin'))
);

CREATE POLICY "Users can view quality inspections" ON quality_inspections FOR SELECT USING (true);
CREATE POLICY "Inspectors can manage their inspections" ON quality_inspections FOR ALL USING (
    inspector_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('quality_manager', 'admin'))
);

CREATE POLICY "Users can view quality defects" ON quality_defects FOR SELECT USING (true);
CREATE POLICY "Quality managers can manage defects" ON quality_defects FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('quality_manager', 'admin'))
);

CREATE POLICY "Users can view quality certificates" ON quality_certificates FOR SELECT USING (true);
CREATE POLICY "Quality managers can manage certificates" ON quality_certificates FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('quality_manager', 'admin'))
);

CREATE POLICY "Users can view quality compliance" ON quality_compliance FOR SELECT USING (true);
CREATE POLICY "Quality managers can manage compliance" ON quality_compliance FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('quality_manager', 'admin'))
);

CREATE POLICY "Users can view quality metrics" ON quality_metrics FOR SELECT USING (true);
CREATE POLICY "Quality managers can manage metrics" ON quality_metrics FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('quality_manager', 'admin'))
);

-- Insert sample data
INSERT INTO quality_standards (name, description, category, criteria, pass_threshold, created_by) VALUES
('Diamond Clarity Inspection', 'Inspection of diamond clarity and inclusions', 'in_process', '{"clarity_grade": "VS2 or better", "inclusion_check": true, "fluorescence": "none to faint"}', 95.0, (SELECT id FROM auth.users LIMIT 1)),
('Metal Purity Verification', 'Verification of metal purity and composition', 'incoming', '{"gold_purity": "14K or 18K", "platinum_purity": "950", "silver_purity": "925"}', 100.0, (SELECT id FROM auth.users LIMIT 1)),
('Setting Quality Check', 'Inspection of stone setting quality and security', 'final', '{"setting_security": "secure", "stone_alignment": "perfect", "finish_quality": "excellent"}', 98.0, (SELECT id FROM auth.users LIMIT 1)),
('Packaging Inspection', 'Final packaging and presentation check', 'packaging', '{"box_condition": "perfect", "certificate_included": true, "cleaning_quality": "excellent"}', 100.0, (SELECT id FROM auth.users LIMIT 1));

INSERT INTO quality_checkpoints (name, description, standard_id, production_step, inspector_role, estimated_duration, order_sequence, created_by) VALUES
('Material Receiving', 'Inspect incoming materials for quality', (SELECT id FROM quality_standards WHERE name = 'Metal Purity Verification'), 'material_receiving', 'quality_inspector', 30, 1, (SELECT id FROM auth.users LIMIT 1)),
('Stone Setting', 'Check stone setting quality during production', (SELECT id FROM quality_standards WHERE name = 'Setting Quality Check'), 'stone_setting', 'quality_inspector', 45, 2, (SELECT id FROM auth.users LIMIT 1)),
('Final Inspection', 'Comprehensive final quality check', (SELECT id FROM quality_standards WHERE name = 'Diamond Clarity Inspection'), 'final_inspection', 'senior_inspector', 60, 3, (SELECT id FROM auth.users LIMIT 1)),
('Packaging Check', 'Final packaging and presentation verification', (SELECT id FROM quality_standards WHERE name = 'Packaging Inspection'), 'packaging', 'quality_inspector', 15, 4, (SELECT id FROM auth.users LIMIT 1));

-- Insert sample compliance records
INSERT INTO quality_compliance (standard_name, compliance_type, audit_date, auditor_id, score, status, findings, next_audit_date, created_by) VALUES
('ISO 9001:2015', 'ISO', CURRENT_DATE - INTERVAL '30 days', (SELECT id FROM auth.users LIMIT 1), 95.5, 'compliant', 'All requirements met with minor observations', CURRENT_DATE + INTERVAL '11 months', (SELECT id FROM auth.users LIMIT 1)),
('Jewelry Industry Standards', 'industry', CURRENT_DATE - INTERVAL '60 days', (SELECT id FROM auth.users LIMIT 1), 98.0, 'compliant', 'Excellent compliance with industry standards', CURRENT_DATE + INTERVAL '6 months', (SELECT id FROM auth.users LIMIT 1));

-- Insert sample metrics
INSERT INTO quality_metrics (metric_date, metric_type, value, target_value, category) VALUES
(CURRENT_DATE - INTERVAL '30 days', 'defect_rate', 2.5, 3.0, 'overall'),
(CURRENT_DATE - INTERVAL '30 days', 'pass_rate', 97.5, 95.0, 'overall'),
(CURRENT_DATE - INTERVAL '30 days', 'rework_rate', 1.8, 2.0, 'overall'),
(CURRENT_DATE - INTERVAL '29 days', 'defect_rate', 2.3, 3.0, 'overall'),
(CURRENT_DATE - INTERVAL '29 days', 'pass_rate', 97.7, 95.0, 'overall'),
(CURRENT_DATE - INTERVAL '29 days', 'rework_rate', 1.6, 2.0, 'overall'); 