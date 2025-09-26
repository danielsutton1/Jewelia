-- Production Batches & Scheduling System Migration
-- This migration creates all necessary tables, indexes, triggers, and RLS policies for production batch management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Production Batches Table
CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_start_date DATE,
    estimated_completion_date DATE,
    actual_start_date DATE,
    actual_completion_date DATE,
    total_estimated_hours DECIMAL(10,2) DEFAULT 0,
    total_actual_hours DECIMAL(10,2) DEFAULT 0,
    total_estimated_cost DECIMAL(15,4) DEFAULT 0,
    total_actual_cost DECIMAL(15,4) DEFAULT 0,
    notes TEXT,
    created_by UUID,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Batch Items Table (Production Orders within Batches)
CREATE TABLE IF NOT EXISTS batch_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    production_order_id UUID,
    order_id UUID,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    estimated_hours DECIMAL(10,2) DEFAULT 0,
    actual_hours DECIMAL(10,2) DEFAULT 0,
    estimated_cost DECIMAL(15,4) DEFAULT 0,
    actual_cost DECIMAL(15,4) DEFAULT 0,
    priority_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Production Schedules Table
CREATE TABLE IF NOT EXISTS production_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    shift VARCHAR(20) DEFAULT 'day' CHECK (shift IN ('morning', 'day', 'evening', 'night')),
    start_time TIME,
    end_time TIME,
    total_hours DECIMAL(5,2),
    capacity_utilization DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Work Orders Table
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    batch_item_id UUID REFERENCES batch_items(id) ON DELETE CASCADE,
    work_order_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_hours DECIMAL(10,2) DEFAULT 0,
    actual_hours DECIMAL(10,2) DEFAULT 0,
    assigned_to UUID,
    due_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    quality_requirements TEXT,
    materials_required JSONB,
    equipment_required JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Work Order Steps Table
CREATE TABLE IF NOT EXISTS work_order_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    estimated_duration_minutes INTEGER DEFAULT 0,
    actual_duration_minutes INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    equipment_id UUID,
    materials_required JSONB,
    quality_checkpoints JSONB,
    dependencies JSONB, -- Array of step IDs that must be completed first
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Batch Progress Tracking Table
CREATE TABLE IF NOT EXISTS batch_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    step_id UUID REFERENCES work_order_steps(id),
    progress_type VARCHAR(50) NOT NULL CHECK (progress_type IN ('batch_started', 'batch_completed', 'work_order_started', 'work_order_completed', 'step_started', 'step_completed', 'quality_check', 'issue_reported')),
    status VARCHAR(50) NOT NULL,
    description TEXT,
    hours_logged DECIMAL(5,2) DEFAULT 0,
    cost_incurred DECIMAL(15,4) DEFAULT 0,
    quality_score DECIMAL(3,2),
    issues_reported TEXT,
    resolution_notes TEXT,
    recorded_by UUID,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Resource Allocation Table
CREATE TABLE IF NOT EXISTS resource_allocation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('equipment', 'labor', 'material', 'space')),
    resource_id UUID,
    resource_name VARCHAR(255) NOT NULL,
    allocation_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    hours_allocated DECIMAL(5,2) DEFAULT 0,
    hours_used DECIMAL(5,2) DEFAULT 0,
    cost_per_hour DECIMAL(10,4) DEFAULT 0,
    total_cost DECIMAL(15,4) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'allocated' CHECK (status IN ('allocated', 'in_use', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Production Dependencies Table
CREATE TABLE IF NOT EXISTS production_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dependent_batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
    prerequisite_batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_days INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batches_dates ON production_batches(estimated_start_date, estimated_completion_date);
CREATE INDEX IF NOT EXISTS idx_production_batches_assigned_to ON production_batches(assigned_to);
CREATE INDEX IF NOT EXISTS idx_production_batches_batch_number ON production_batches(batch_number);

CREATE INDEX IF NOT EXISTS idx_batch_items_batch_id ON batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_items_status ON batch_items(status);
CREATE INDEX IF NOT EXISTS idx_batch_items_production_order_id ON batch_items(production_order_id);
CREATE INDEX IF NOT EXISTS idx_batch_items_order_id ON batch_items(order_id);

CREATE INDEX IF NOT EXISTS idx_production_schedules_batch_id ON production_schedules(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_schedules_date ON production_schedules(schedule_date);

CREATE INDEX IF NOT EXISTS idx_work_orders_batch_id ON work_orders(batch_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_number ON work_orders(work_order_number);

CREATE INDEX IF NOT EXISTS idx_work_order_steps_work_order_id ON work_order_steps(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_steps_status ON work_order_steps(status);
CREATE INDEX IF NOT EXISTS idx_work_order_steps_step_number ON work_order_steps(work_order_id, step_number);

CREATE INDEX IF NOT EXISTS idx_batch_progress_batch_id ON batch_progress(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_progress_work_order_id ON batch_progress(work_order_id);
CREATE INDEX IF NOT EXISTS idx_batch_progress_recorded_at ON batch_progress(recorded_at);

CREATE INDEX IF NOT EXISTS idx_resource_allocation_batch_id ON resource_allocation(batch_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocation_date ON resource_allocation(allocation_date);
CREATE INDEX IF NOT EXISTS idx_resource_allocation_resource_type ON resource_allocation(resource_type);

CREATE INDEX IF NOT EXISTS idx_production_dependencies_dependent ON production_dependencies(dependent_batch_id);
CREATE INDEX IF NOT EXISTS idx_production_dependencies_prerequisite ON production_dependencies(prerequisite_batch_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON production_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batch_items_updated_at BEFORE UPDATE ON batch_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_schedules_updated_at BEFORE UPDATE ON production_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_order_steps_updated_at BEFORE UPDATE ON work_order_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_allocation_updated_at BEFORE UPDATE ON resource_allocation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update batch totals when items change
CREATE OR REPLACE FUNCTION update_batch_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE production_batches 
    SET 
        total_estimated_hours = (
            SELECT COALESCE(SUM(estimated_hours), 0)
            FROM batch_items
            WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
        ),
        total_actual_hours = (
            SELECT COALESCE(SUM(actual_hours), 0)
            FROM batch_items
            WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
        ),
        total_estimated_cost = (
            SELECT COALESCE(SUM(estimated_cost), 0)
            FROM batch_items
            WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
        ),
        total_actual_cost = (
            SELECT COALESCE(SUM(actual_cost), 0)
            FROM batch_items
            WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.batch_id, OLD.batch_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_batch_totals_on_item_insert AFTER INSERT ON batch_items FOR EACH ROW EXECUTE FUNCTION update_batch_totals();
CREATE TRIGGER update_batch_totals_on_item_update AFTER UPDATE ON batch_items FOR EACH ROW EXECUTE FUNCTION update_batch_totals();
CREATE TRIGGER update_batch_totals_on_item_delete AFTER DELETE ON batch_items FOR EACH ROW EXECUTE FUNCTION update_batch_totals();

-- Create trigger to update work order totals when steps change
CREATE OR REPLACE FUNCTION update_work_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE work_orders 
    SET 
        estimated_hours = (
            SELECT COALESCE(SUM(estimated_duration_minutes), 0) / 60.0
            FROM work_order_steps
            WHERE work_order_id = COALESCE(NEW.work_order_id, OLD.work_order_id)
        ),
        actual_hours = (
            SELECT COALESCE(SUM(actual_duration_minutes), 0) / 60.0
            FROM work_order_steps
            WHERE work_order_id = COALESCE(NEW.work_order_id, OLD.work_order_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.work_order_id, OLD.work_order_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_order_totals_on_step_insert AFTER INSERT ON work_order_steps FOR EACH ROW EXECUTE FUNCTION update_work_order_totals();
CREATE TRIGGER update_work_order_totals_on_step_update AFTER UPDATE ON work_order_steps FOR EACH ROW EXECUTE FUNCTION update_work_order_totals();
CREATE TRIGGER update_work_order_totals_on_step_delete AFTER DELETE ON work_order_steps FOR EACH ROW EXECUTE FUNCTION update_work_order_totals();

-- Enable Row Level Security (RLS)
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_dependencies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON production_batches FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON production_batches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON production_batches FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON production_batches FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON batch_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON batch_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON batch_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON batch_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON production_schedules FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON production_schedules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON production_schedules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON production_schedules FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON work_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON work_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON work_orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON work_orders FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON work_order_steps FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON work_order_steps FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON work_order_steps FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON work_order_steps FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON batch_progress FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON batch_progress FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON batch_progress FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON batch_progress FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON resource_allocation FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON resource_allocation FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON resource_allocation FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON resource_allocation FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON production_dependencies FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON production_dependencies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON production_dependencies FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON production_dependencies FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data for testing
INSERT INTO production_batches (batch_number, name, description, status, priority, estimated_start_date, estimated_completion_date, total_estimated_hours, total_estimated_cost) VALUES 
('BATCH-2024-001', 'Gold Ring Production Batch', 'Production batch for custom gold rings', 'planned', 'high', '2024-01-15', '2024-01-20', 40.0, 2500.00),
('BATCH-2024-002', 'Silver Necklace Batch', 'Production batch for silver necklaces', 'scheduled', 'medium', '2024-01-18', '2024-01-25', 60.0, 1800.00);

-- Migration completed successfully 