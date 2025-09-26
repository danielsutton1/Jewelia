-- Create tasks table for top navigation
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT NOT NULL DEFAULT 'general',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    tenant_id UUID NOT NULL DEFAULT 'c5e33bb2-4811-4042-bd4e-97b1ffec7c38',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tasks in their tenant" ON public.tasks
    FOR SELECT USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR
        assigned_to = auth.uid() OR
        created_by = auth.uid()
    );

CREATE POLICY "Users can insert tasks in their tenant" ON public.tasks
    FOR INSERT WITH CHECK (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    );

CREATE POLICY "Users can update tasks in their tenant" ON public.tasks
    FOR UPDATE USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR
        assigned_to = auth.uid() OR
        created_by = auth.uid()
    );

CREATE POLICY "Users can delete tasks in their tenant" ON public.tasks
    FOR DELETE USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR
        created_by = auth.uid()
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();

-- Insert sample tasks (without user references for now)
INSERT INTO public.tasks (id, title, description, status, priority, category, due_date, tenant_id)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Review customer orders', 'Check pending orders and update status', 'pending', 'high', 'sales', NOW() + INTERVAL '2 days', 'c5e33bb2-4811-4042-bd4e-97b1ffec7c38'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Update inventory levels', 'Sync inventory with latest sales data', 'in_progress', 'medium', 'inventory', NOW() + INTERVAL '1 day', 'c5e33bb2-4811-4042-bd4e-97b1ffec7c38'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Prepare production schedule', 'Plan next week production tasks', 'pending', 'low', 'production', NOW() + INTERVAL '3 days', 'c5e33bb2-4811-4042-bd4e-97b1ffec7c38')
ON CONFLICT (id) DO NOTHING;
