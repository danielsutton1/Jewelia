-- Create repair items table
CREATE TABLE repair_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    material TEXT,
    condition TEXT,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create repair photos table
CREATE TABLE repair_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    item_id UUID REFERENCES repair_items(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT NOT NULL, -- 'before', 'after', 'during', 'other'
    description TEXT,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create repair estimates table
CREATE TABLE repair_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    estimated_cost DECIMAL(10,2) NOT NULL,
    estimated_completion_date DATE NOT NULL,
    parts_list JSONB,
    labor_hours DECIMAL(5,2),
    labor_rate DECIMAL(10,2),
    notes TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create repair history table
CREATE TABLE repair_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create triggers for updated_at
CREATE TRIGGER update_repair_items_updated_at
    BEFORE UPDATE ON repair_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repair_estimates_updated_at
    BEFORE UPDATE ON repair_estimates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_repair_items_repair_id ON repair_items(repair_id);
CREATE INDEX idx_repair_photos_repair_id ON repair_photos(repair_id);
CREATE INDEX idx_repair_photos_item_id ON repair_photos(item_id);
CREATE INDEX idx_repair_estimates_repair_id ON repair_estimates(repair_id);
CREATE INDEX idx_repair_estimates_status ON repair_estimates(status);
CREATE INDEX idx_repair_history_repair_id ON repair_history(repair_id);
CREATE INDEX idx_repair_history_user_id ON repair_history(user_id); 