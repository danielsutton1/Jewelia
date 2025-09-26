-- Quality Control System Enhancement
-- Phase 5.5, Priority 3: Quality Control Enhancement

-- Quality Alerts Table
CREATE TABLE IF NOT EXISTS quality_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('defect_rate', 'compliance_due', 'certificate_expiry', 'checkpoint_failure')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Quality Reports Table
CREATE TABLE IF NOT EXISTS quality_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed'))
);

-- Quality Metrics Table (if not exists)
CREATE TABLE IF NOT EXISTS quality_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('defect_rate', 'pass_rate', 'rework_rate', 'cost_of_quality')),
    value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    category VARCHAR(100),
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_quality_alerts_type ON quality_alerts(type);
CREATE INDEX idx_quality_alerts_severity ON quality_alerts(severity);
CREATE INDEX idx_quality_alerts_is_active ON quality_alerts(is_active);
CREATE INDEX idx_quality_alerts_created_at ON quality_alerts(created_at);
CREATE INDEX idx_quality_reports_type ON quality_reports(type);
CREATE INDEX idx_quality_reports_status ON quality_reports(status);
CREATE INDEX idx_quality_reports_generated_at ON quality_reports(generated_at);
CREATE INDEX idx_quality_metrics_date ON quality_metrics(metric_date);
CREATE INDEX idx_quality_metrics_type ON quality_metrics(metric_type);

-- Enable RLS
ALTER TABLE quality_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quality_alerts
CREATE POLICY "Users can view quality alerts"
    ON quality_alerts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create quality alerts"
    ON quality_alerts FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update quality alerts"
    ON quality_alerts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policies for quality_reports
CREATE POLICY "Users can view quality reports"
    ON quality_reports FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create quality reports"
    ON quality_reports FOR INSERT
    TO authenticated
    WITH CHECK (generated_by = auth.uid());

CREATE POLICY "Users can update quality reports"
    ON quality_reports FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policies for quality_metrics
CREATE POLICY "Users can view quality metrics"
    ON quality_metrics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create quality metrics"
    ON quality_metrics FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update quality metrics"
    ON quality_metrics FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert sample quality metrics
INSERT INTO quality_metrics (metric_date, metric_type, value, target_value, category) VALUES
('2024-07-01', 'pass_rate', 95.5, 95.0, 'overall'),
('2024-07-01', 'defect_rate', 2.1, 3.0, 'overall'),
('2024-07-02', 'pass_rate', 96.2, 95.0, 'overall'),
('2024-07-02', 'defect_rate', 1.8, 3.0, 'overall'),
('2024-07-03', 'pass_rate', 94.8, 95.0, 'overall'),
('2024-07-03', 'defect_rate', 2.5, 3.0, 'overall'),
('2024-07-04', 'pass_rate', 97.1, 95.0, 'overall'),
('2024-07-04', 'defect_rate', 1.2, 3.0, 'overall'),
('2024-07-05', 'pass_rate', 95.9, 95.0, 'overall'),
('2024-07-05', 'defect_rate', 2.3, 3.0, 'overall');

-- Insert sample quality alerts
INSERT INTO quality_alerts (type, severity, title, message, data) VALUES
('defect_rate', 'medium', 'Quality Pass Rate Below Threshold', 'Quality pass rate is 94.8% (below 95% threshold)', '{"pass_rate": 94.8, "threshold": 95.0}'),
('checkpoint_failure', 'high', 'Quality Inspection Failed', 'Inspection failed at casting checkpoint', '{"inspection_id": "sample-1", "checkpoint_id": "casting-1"}'),
('compliance_due', 'low', 'Compliance Audit Due', 'Monthly compliance audit is due in 3 days', '{"audit_date": "2024-07-20", "days_remaining": 3}'); 