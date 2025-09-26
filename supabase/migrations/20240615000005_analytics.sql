-- Analytics Tables

-- Production Analytics
CREATE TABLE IF NOT EXISTS production_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    product_category text NOT NULL,
    stage text NOT NULL,
    craftsperson_id uuid REFERENCES resources(id) ON DELETE SET NULL,
    cycle_time numeric NOT NULL,
    quality_score numeric NOT NULL,
    efficiency_score numeric NOT NULL,
    units_produced integer NOT NULL,
    defects integer NOT NULL DEFAULT 0,
    rework_count integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_production_metrics_date ON production_metrics(date);
CREATE INDEX IF NOT EXISTS idx_production_metrics_category ON production_metrics(product_category);
CREATE INDEX IF NOT EXISTS idx_production_metrics_stage ON production_metrics(stage);
CREATE INDEX IF NOT EXISTS idx_production_metrics_craftsperson ON production_metrics(craftsperson_id);

-- Efficiency Analytics
CREATE TABLE IF NOT EXISTS efficiency_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    process_type text NOT NULL,
    location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
    throughput_rate numeric NOT NULL,
    resource_utilization numeric NOT NULL,
    setup_time numeric NOT NULL,
    processing_time numeric NOT NULL,
    idle_time numeric NOT NULL DEFAULT 0,
    bottleneck_identified boolean NOT NULL DEFAULT false,
    bottleneck_details text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_efficiency_metrics_date ON efficiency_metrics(date);
CREATE INDEX IF NOT EXISTS idx_efficiency_metrics_process ON efficiency_metrics(process_type);
CREATE INDEX IF NOT EXISTS idx_efficiency_metrics_location ON efficiency_metrics(location_id);

-- General Analytics
CREATE TABLE IF NOT EXISTS general_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    metric_type text NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metric_unit text,
    comparison_value numeric,
    trend_direction text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_general_metrics_date ON general_metrics(date);
CREATE INDEX IF NOT EXISTS idx_general_metrics_type ON general_metrics(metric_type);

-- Analytics Alerts
CREATE TABLE IF NOT EXISTS analytics_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type text NOT NULL,
    metric_name text NOT NULL,
    threshold_value numeric NOT NULL,
    comparison_operator text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    notification_channels text[] NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_type ON analytics_alerts(alert_type);

-- Analytics Reports
CREATE TABLE IF NOT EXISTS analytics_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type text NOT NULL,
    report_name text NOT NULL,
    date_range_start date NOT NULL,
    date_range_end date NOT NULL,
    filters jsonb,
    generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_date ON analytics_reports(date_range_start, date_range_end);

-- Analytics Report Items
CREATE TABLE IF NOT EXISTS analytics_report_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id uuid REFERENCES analytics_reports(id) ON DELETE CASCADE,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metric_unit text,
    comparison_value numeric,
    trend_direction text,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_report_items_report ON analytics_report_items(report_id); 