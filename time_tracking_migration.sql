-- Time Tracking System Migration
-- This migration creates all necessary tables, indexes, triggers, and RLS policies for time tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Employee Shifts Table
CREATE TABLE IF NOT EXISTS employee_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Time Entries Table (Clock In/Out Records)
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    device_id VARCHAR(100),
    notes TEXT,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Work Sessions Table (Complete work periods)
CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    clock_in_entry_id UUID REFERENCES time_entries(id),
    clock_out_entry_id UUID REFERENCES time_entries(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(5,2),
    regular_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    break_hours DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    hourly_rate DECIMAL(10,4),
    total_cost DECIMAL(15,4),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Break Records Table
CREATE TABLE IF NOT EXISTS break_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_session_id UUID REFERENCES work_sessions(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    break_start_entry_id UUID REFERENCES time_entries(id),
    break_end_entry_id UUID REFERENCES time_entries(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    break_type VARCHAR(20) DEFAULT 'lunch' CHECK (break_type IN ('lunch', 'coffee', 'restroom', 'other')),
    is_paid BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Project Time Allocations Table
CREATE TABLE IF NOT EXISTS project_time_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_session_id UUID REFERENCES work_sessions(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    batch_id UUID REFERENCES production_batches(id),
    work_order_id UUID,
    task_id UUID,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_hours DECIMAL(5,2),
    hourly_rate DECIMAL(10,4),
    total_cost DECIMAL(15,4),
    activity_type VARCHAR(50) CHECK (activity_type IN ('casting', 'polishing', 'setting', 'assembly', 'quality_check', 'packaging', 'other')),
    description TEXT,
    is_billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Overtime Records Table
CREATE TABLE IF NOT EXISTS overtime_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    work_session_id UUID REFERENCES work_sessions(id),
    date DATE NOT NULL,
    regular_hours DECIMAL(5,2) DEFAULT 8.0,
    actual_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    overtime_rate_multiplier DECIMAL(3,2) DEFAULT 1.5,
    total_overtime_cost DECIMAL(15,4),
    reason TEXT,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Shift Schedules Table
CREATE TABLE IF NOT EXISTS shift_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    date DATE NOT NULL,
    shift_id UUID REFERENCES employee_shifts(id),
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    scheduled_end_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'absent', 'late')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Employee Pay Rates Table
CREATE TABLE IF NOT EXISTS employee_pay_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    base_hourly_rate DECIMAL(10,4) NOT NULL,
    overtime_rate_multiplier DECIMAL(3,2) DEFAULT 1.5,
    effective_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Time Tracking Settings Table
CREATE TABLE IF NOT EXISTS time_tracking_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_shifts_employee_id ON employee_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_active ON employee_shifts(is_active);

CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_timestamp ON time_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_time_entries_type ON time_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_time_entries_approved ON time_entries(is_approved);

CREATE INDEX IF NOT EXISTS idx_work_sessions_employee_id ON work_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_start_time ON work_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_work_sessions_status ON work_sessions(status);

CREATE INDEX IF NOT EXISTS idx_break_records_work_session_id ON break_records(work_session_id);
CREATE INDEX IF NOT EXISTS idx_break_records_employee_id ON break_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_break_records_start_time ON break_records(start_time);

CREATE INDEX IF NOT EXISTS idx_project_time_allocations_work_session_id ON project_time_allocations(work_session_id);
CREATE INDEX IF NOT EXISTS idx_project_time_allocations_employee_id ON project_time_allocations(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_time_allocations_batch_id ON project_time_allocations(batch_id);
CREATE INDEX IF NOT EXISTS idx_project_time_allocations_work_order_id ON project_time_allocations(work_order_id);
CREATE INDEX IF NOT EXISTS idx_project_time_allocations_start_time ON project_time_allocations(start_time);

CREATE INDEX IF NOT EXISTS idx_overtime_records_employee_id ON overtime_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_records_date ON overtime_records(date);
CREATE INDEX IF NOT EXISTS idx_overtime_records_approved ON overtime_records(is_approved);

CREATE INDEX IF NOT EXISTS idx_shift_schedules_employee_id ON shift_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_date ON shift_schedules(date);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_status ON shift_schedules(status);

CREATE INDEX IF NOT EXISTS idx_employee_pay_rates_employee_id ON employee_pay_rates(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_pay_rates_effective_date ON employee_pay_rates(effective_date);
CREATE INDEX IF NOT EXISTS idx_employee_pay_rates_active ON employee_pay_rates(is_active);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employee_shifts_updated_at BEFORE UPDATE ON employee_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_sessions_updated_at BEFORE UPDATE ON work_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_time_allocations_updated_at BEFORE UPDATE ON project_time_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_overtime_records_updated_at BEFORE UPDATE ON overtime_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_schedules_updated_at BEFORE UPDATE ON shift_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_pay_rates_updated_at BEFORE UPDATE ON employee_pay_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_tracking_settings_updated_at BEFORE UPDATE ON time_tracking_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically calculate work session hours
CREATE OR REPLACE FUNCTION calculate_work_session_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        -- Calculate total hours
        NEW.total_hours = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;
        
        -- Calculate regular vs overtime hours (assuming 8-hour workday)
        IF NEW.total_hours <= 8 THEN
            NEW.regular_hours = NEW.total_hours;
            NEW.overtime_hours = 0;
        ELSE
            NEW.regular_hours = 8;
            NEW.overtime_hours = NEW.total_hours - 8;
        END IF;
        
        -- Calculate total cost if hourly rate is available
        IF NEW.hourly_rate IS NOT NULL THEN
            NEW.total_cost = (NEW.regular_hours * NEW.hourly_rate) + (NEW.overtime_hours * NEW.hourly_rate * 1.5);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_work_session_hours_on_update BEFORE UPDATE ON work_sessions FOR EACH ROW EXECUTE FUNCTION calculate_work_session_hours();

-- Create trigger to automatically calculate project time allocation costs
CREATE OR REPLACE FUNCTION calculate_project_time_cost()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.duration_hours IS NOT NULL AND NEW.hourly_rate IS NOT NULL THEN
        NEW.total_cost = NEW.duration_hours * NEW.hourly_rate;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_project_time_cost_on_update BEFORE UPDATE ON project_time_allocations FOR EACH ROW EXECUTE FUNCTION calculate_project_time_cost();

-- Enable Row Level Security (RLS)
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_time_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_pay_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON employee_shifts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON employee_shifts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON employee_shifts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON employee_shifts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON time_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON time_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON time_entries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON time_entries FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON work_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON work_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON work_sessions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON work_sessions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON break_records FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON break_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON break_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON break_records FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON project_time_allocations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON project_time_allocations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON project_time_allocations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON project_time_allocations FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON overtime_records FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON overtime_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON overtime_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON overtime_records FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON shift_schedules FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON shift_schedules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON shift_schedules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON shift_schedules FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON employee_pay_rates FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON employee_pay_rates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON employee_pay_rates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON employee_pay_rates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON time_tracking_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON time_tracking_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON time_tracking_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON time_tracking_settings FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data for testing
INSERT INTO employee_shifts (employee_id, shift_name, start_time, end_time, break_duration_minutes) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Morning Shift', '08:00:00', '16:00:00', 30),
('550e8400-e29b-41d4-a716-446655440001', 'Afternoon Shift', '16:00:00', '00:00:00', 30),
('550e8400-e29b-41d4-a716-446655440002', 'Night Shift', '00:00:00', '08:00:00', 30);

INSERT INTO employee_pay_rates (employee_id, base_hourly_rate, overtime_rate_multiplier, effective_date) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 25.00, 1.5, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440001', 22.50, 1.5, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440002', 28.00, 1.5, CURRENT_DATE);

INSERT INTO time_tracking_settings (setting_key, setting_value, description) VALUES 
('default_workday_hours', '8', 'Default number of hours in a workday'),
('overtime_threshold', '8', 'Hours after which overtime applies'),
('break_duration', '30', 'Default break duration in minutes'),
('auto_approve_entries', 'false', 'Whether to auto-approve time entries'),
('require_location', 'true', 'Whether location is required for clock in/out');

-- Migration completed successfully 