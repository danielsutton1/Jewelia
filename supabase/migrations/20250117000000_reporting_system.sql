-- Reporting System Database Schema
-- Phase 5.5, Priority 1: Analytics & Reporting Enhancement

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('dashboard', 'customer', 'sales', 'inventory', 'production', 'financial', 'custom')),
    parameters JSONB NOT NULL DEFAULT '[]',
    schedule JSONB, -- ReportSchedule object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Generated Reports Table
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES report_templates(id),
    name VARCHAR(255) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    data JSONB, -- Generated report data
    format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'excel', 'csv')),
    file_url TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    error_message TEXT
);

-- Report Executions Table (for tracking long-running reports)
CREATE TABLE IF NOT EXISTS report_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES generated_reports(id),
    template_id UUID REFERENCES report_templates(id),
    parameters JSONB NOT NULL DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    result JSONB,
    error TEXT
);

-- Create indexes for performance
CREATE INDEX idx_report_templates_type ON report_templates(type);
CREATE INDEX idx_report_templates_created_by ON report_templates(created_by);
CREATE INDEX idx_report_templates_is_active ON report_templates(is_active);
CREATE INDEX idx_generated_reports_template_id ON generated_reports(template_id);
CREATE INDEX idx_generated_reports_generated_by ON generated_reports(generated_by);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);
CREATE INDEX idx_generated_reports_generated_at ON generated_reports(generated_at);
CREATE INDEX idx_report_executions_report_id ON report_executions(report_id);
CREATE INDEX idx_report_executions_status ON report_executions(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_report_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_report_templates_updated_at
    BEFORE UPDATE ON report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_report_templates_updated_at();

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_templates
CREATE POLICY "Users can view report templates"
    ON report_templates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create report templates"
    ON report_templates FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own report templates"
    ON report_templates FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own report templates"
    ON report_templates FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- RLS Policies for generated_reports
CREATE POLICY "Users can view generated reports"
    ON generated_reports FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create generated reports"
    ON generated_reports FOR INSERT
    TO authenticated
    WITH CHECK (generated_by = auth.uid());

CREATE POLICY "Users can update generated reports"
    ON generated_reports FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policies for report_executions
CREATE POLICY "Users can view report executions"
    ON report_executions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create report executions"
    ON report_executions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update report executions"
    ON report_executions FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert default report templates
INSERT INTO report_templates (name, description, type, parameters, created_by, is_active) VALUES
(
    'Daily Sales Summary',
    'Daily sales metrics and performance summary',
    'sales',
    '[
        {
            "name": "date",
            "type": "date",
            "required": true,
            "description": "Report date"
        }
    ]',
    (SELECT id FROM auth.users LIMIT 1),
    true
),
(
    'Customer Activity Report',
    'Customer engagement and activity analysis',
    'customer',
    '[
        {
            "name": "start_date",
            "type": "date",
            "required": true,
            "description": "Start date for analysis"
        },
        {
            "name": "end_date",
            "type": "date",
            "required": true,
            "description": "End date for analysis"
        }
    ]',
    (SELECT id FROM auth.users LIMIT 1),
    true
),
(
    'Inventory Status Report',
    'Current inventory levels and stock status',
    'inventory',
    '[
        {
            "name": "category",
            "type": "select",
            "required": false,
            "options": ["all", "rings", "necklaces", "earrings", "bracelets"],
            "description": "Product category filter"
        }
    ]',
    (SELECT id FROM auth.users LIMIT 1),
    true
),
(
    'Production Pipeline Report',
    'Production workflow and pipeline status',
    'production',
    '[
        {
            "name": "stage",
            "type": "select",
            "required": false,
            "options": ["all", "design", "casting", "setting", "polishing", "qc"],
            "description": "Production stage filter"
        }
    ]',
    (SELECT id FROM auth.users LIMIT 1),
    true
),
(
    'Monthly Financial Summary',
    'Monthly financial performance and metrics',
    'financial',
    '[
        {
            "name": "month",
            "type": "string",
            "required": true,
            "description": "Month (YYYY-MM format)"
        }
    ]',
    (SELECT id FROM auth.users LIMIT 1),
    true
); 