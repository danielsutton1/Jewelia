-- Equipment Management System Migration
-- This migration creates all necessary tables, indexes, triggers, and RLS policies for equipment management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Equipment Categories Table
CREATE TABLE IF NOT EXISTS equipment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES equipment_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES equipment_categories(id),
    asset_id UUID, -- Link to asset tracking system
    equipment_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    serial_number VARCHAR(255),
    description TEXT,
    specifications JSONB,
    purchase_date DATE,
    purchase_cost DECIMAL(15,4),
    current_value DECIMAL(15,4),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired', 'broken')),
    condition VARCHAR(50) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'critical')),
    capacity_per_hour DECIMAL(10,2),
    power_consumption DECIMAL(10,2),
    maintenance_interval_hours INTEGER,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_operating_hours DECIMAL(10,2) DEFAULT 0,
    total_maintenance_cost DECIMAL(15,4) DEFAULT 0,
    hourly_operating_cost DECIMAL(10,4) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Equipment Maintenance Schedule Table
CREATE TABLE IF NOT EXISTS equipment_maintenance_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency', 'inspection')),
    scheduled_date DATE NOT NULL,
    estimated_duration_hours DECIMAL(5,2),
    actual_duration_hours DECIMAL(5,2),
    estimated_cost DECIMAL(15,4),
    actual_cost DECIMAL(15,4),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
    description TEXT,
    work_performed TEXT,
    parts_used JSONB,
    technician_notes TEXT,
    performed_by UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Equipment Usage Tracking Table
CREATE TABLE IF NOT EXISTS equipment_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES production_batches(id),
    work_order_id UUID,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_hours DECIMAL(5,2),
    operator_id UUID,
    operation_type VARCHAR(100),
    production_quantity INTEGER,
    quality_score DECIMAL(3,2),
    energy_consumed DECIMAL(10,2),
    cost_incurred DECIMAL(15,4),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Equipment Availability Table
CREATE TABLE IF NOT EXISTS equipment_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shift VARCHAR(20) DEFAULT 'day' CHECK (shift IN ('morning', 'day', 'evening', 'night')),
    start_time TIME,
    end_time TIME,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'scheduled', 'maintenance', 'broken', 'reserved')),
    reserved_by UUID,
    reserved_for_batch_id UUID REFERENCES production_batches(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Equipment Performance Metrics Table
CREATE TABLE IF NOT EXISTS equipment_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_operating_hours DECIMAL(5,2) DEFAULT 0,
    productive_hours DECIMAL(5,2) DEFAULT 0,
    downtime_hours DECIMAL(5,2) DEFAULT 0,
    maintenance_hours DECIMAL(5,2) DEFAULT 0,
    production_quantity INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2),
    energy_consumption DECIMAL(10,2) DEFAULT 0,
    operating_cost DECIMAL(15,4) DEFAULT 0,
    efficiency_percentage DECIMAL(5,2),
    utilization_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Equipment Issues Table
CREATE TABLE IF NOT EXISTS equipment_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN ('breakdown', 'performance', 'safety', 'quality', 'other')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reported_by UUID,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    downtime_hours DECIMAL(5,2) DEFAULT 0,
    cost_impact DECIMAL(15,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Equipment Calibration Table
CREATE TABLE IF NOT EXISTS equipment_calibration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    calibration_date DATE NOT NULL,
    next_calibration_date DATE,
    calibration_type VARCHAR(100),
    calibration_standard VARCHAR(255),
    calibration_result VARCHAR(50) CHECK (calibration_result IN ('pass', 'fail', 'conditional')),
    accuracy_before DECIMAL(10,6),
    accuracy_after DECIMAL(10,6),
    calibration_cost DECIMAL(15,4),
    performed_by VARCHAR(255),
    certificate_number VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Equipment Parts Inventory Table
CREATE TABLE IF NOT EXISTS equipment_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    part_number VARCHAR(100),
    part_name VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(255),
    supplier VARCHAR(255),
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    unit_cost DECIMAL(15,4),
    last_ordered_date DATE,
    lead_time_days INTEGER,
    location VARCHAR(255),
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Equipment Documentation Table
CREATE TABLE IF NOT EXISTS equipment_documentation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('manual', 'warranty', 'certificate', 'schematic', 'procedure', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size INTEGER,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_category_id ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_condition ON equipment(condition);
CREATE INDEX IF NOT EXISTS idx_equipment_code ON equipment(equipment_code);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location);

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_equipment_id ON equipment_maintenance_schedule(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_date ON equipment_maintenance_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_status ON equipment_maintenance_schedule(status);

CREATE INDEX IF NOT EXISTS idx_equipment_usage_equipment_id ON equipment_usage(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_usage_start_time ON equipment_usage(start_time);
CREATE INDEX IF NOT EXISTS idx_equipment_usage_batch_id ON equipment_usage(batch_id);

CREATE INDEX IF NOT EXISTS idx_equipment_availability_equipment_id ON equipment_availability(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_availability_date ON equipment_availability(date);
CREATE INDEX IF NOT EXISTS idx_equipment_availability_status ON equipment_availability(status);

CREATE INDEX IF NOT EXISTS idx_equipment_performance_equipment_id ON equipment_performance(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_performance_date ON equipment_performance(metric_date);

CREATE INDEX IF NOT EXISTS idx_equipment_issues_equipment_id ON equipment_issues(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_issues_status ON equipment_issues(status);
CREATE INDEX IF NOT EXISTS idx_equipment_issues_severity ON equipment_issues(severity);

CREATE INDEX IF NOT EXISTS idx_equipment_calibration_equipment_id ON equipment_calibration(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_calibration_date ON equipment_calibration(calibration_date);

CREATE INDEX IF NOT EXISTS idx_equipment_parts_equipment_id ON equipment_parts(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_parts_stock ON equipment_parts(current_stock);

CREATE INDEX IF NOT EXISTS idx_equipment_documentation_equipment_id ON equipment_documentation(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_documentation_type ON equipment_documentation(document_type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_categories_updated_at BEFORE UPDATE ON equipment_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_maintenance_schedule_updated_at BEFORE UPDATE ON equipment_maintenance_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_availability_updated_at BEFORE UPDATE ON equipment_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_issues_updated_at BEFORE UPDATE ON equipment_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_parts_updated_at BEFORE UPDATE ON equipment_parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update equipment operating hours
CREATE OR REPLACE FUNCTION update_equipment_operating_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.duration_hours IS NOT NULL THEN
        UPDATE equipment 
        SET 
            total_operating_hours = total_operating_hours + NEW.duration_hours,
            updated_at = NOW()
        WHERE id = NEW.equipment_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_operating_hours_on_usage AFTER INSERT ON equipment_usage FOR EACH ROW EXECUTE FUNCTION update_equipment_operating_hours();

-- Create trigger to update equipment maintenance costs
CREATE OR REPLACE FUNCTION update_equipment_maintenance_costs()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.actual_cost IS NOT NULL THEN
        UPDATE equipment 
        SET 
            total_maintenance_cost = total_maintenance_cost + NEW.actual_cost,
            updated_at = NOW()
        WHERE id = NEW.equipment_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_maintenance_costs_on_completion AFTER UPDATE ON equipment_maintenance_schedule FOR EACH ROW EXECUTE FUNCTION update_equipment_maintenance_costs();

-- Enable Row Level Security (RLS)
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_calibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_documentation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON equipment_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment_maintenance_schedule FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_maintenance_schedule FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_maintenance_schedule FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_maintenance_schedule FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment_usage FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_usage FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_usage FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_usage FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment_availability FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_availability FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_availability FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_availability FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment_performance FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_performance FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_performance FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_performance FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment_issues FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_issues FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_issues FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_issues FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment_calibration FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_calibration FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_calibration FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_calibration FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment_parts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_parts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_parts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_parts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON equipment_documentation FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON equipment_documentation FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON equipment_documentation FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON equipment_documentation FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data for testing
INSERT INTO equipment_categories (name, description) VALUES 
('Jewelry Making Tools', 'Hand tools and equipment for jewelry making'),
('Casting Equipment', 'Equipment for metal casting and molding'),
('Polishing Equipment', 'Equipment for finishing and polishing'),
('Quality Control Equipment', 'Equipment for testing and quality assurance');

INSERT INTO equipment (equipment_code, name, model, manufacturer, category_id, status, condition, capacity_per_hour, location, purchase_cost, current_value) VALUES 
('EQ-001', 'Gold Casting Machine', 'GC-2000', 'JewelTech', (SELECT id FROM equipment_categories WHERE name = 'Casting Equipment'), 'active', 'good', 10.0, 'Workshop A', 15000.00, 12000.00),
('EQ-002', 'Diamond Polishing Wheel', 'DP-500', 'Precision Tools', (SELECT id FROM equipment_categories WHERE name = 'Polishing Equipment'), 'active', 'excellent', 25.0, 'Workshop B', 8000.00, 7500.00),
('EQ-003', 'Laser Welding Machine', 'LW-1000', 'Advanced Laser', (SELECT id FROM equipment_categories WHERE name = 'Jewelry Making Tools'), 'active', 'good', 15.0, 'Workshop A', 25000.00, 22000.00);

-- Migration completed successfully 