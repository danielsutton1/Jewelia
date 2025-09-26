-- Asset Tracking System Migration
-- Creates tables for asset locations, movements, assignments, and enhanced inventory items

-- Asset Locations Table
CREATE TABLE IF NOT EXISTS asset_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_type VARCHAR(50) NOT NULL CHECK (location_type IN (
        'store', 'warehouse', 'department', 'section', 'shelf', 
        'display_case', 'vault', 'repair_shop', 'offsite', 'customer', 'staff'
    )),
    parent_location_id UUID REFERENCES asset_locations(id) ON DELETE SET NULL,
    address TEXT,
    capacity INTEGER,
    current_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Movements Table
CREATE TABLE IF NOT EXISTS asset_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    from_location_id UUID REFERENCES asset_locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES asset_locations(id) ON DELETE SET NULL,
    moved_by UUID, -- References users table if exists
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN (
        'transfer', 'storage', 'display', 'repair', 'shipping', 'return', 'checkout', 'checkin'
    )),
    movement_reason TEXT,
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_return_at TIMESTAMP WITH TIME ZONE,
    actual_return_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Assignments Table
CREATE TABLE IF NOT EXISTS asset_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    assigned_to UUID, -- References users table if exists
    assigned_by UUID, -- References users table if exists
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN (
        'work_order', 'repair', 'display', 'customer', 'staff', 'temporary'
    )),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'completed', 'cancelled', 'overdue'
    )),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_return_at TIMESTAMP WITH TIME ZONE,
    actual_return_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Inventory Items Table (extends existing inventory table)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    condition VARCHAR(50) CHECK (condition IN (
        'new', 'excellent', 'good', 'fair', 'poor', 'damaged'
    )),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN (
        'available', 'in_use', 'maintenance', 'lost', 'damaged', 'retired'
    )),
    current_location_id UUID REFERENCES asset_locations(id) ON DELETE SET NULL,
    assigned_to UUID, -- References users table if exists
    current_value DECIMAL(12,2),
    purchase_price DECIMAL(12,2),
    purchase_date DATE,
    warranty_expiry DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    is_tracked BOOLEAN DEFAULT true,
    tracking_number VARCHAR(100),
    barcode VARCHAR(100),
    rfid_tag VARCHAR(100),
    dimensions VARCHAR(100), -- "LxWxH" format
    weight DECIMAL(8,2),
    manufacturer VARCHAR(255),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    metadata JSONB, -- Additional flexible data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_asset_locations_parent_id ON asset_locations(parent_location_id);
CREATE INDEX idx_asset_locations_type ON asset_locations(location_type);
CREATE INDEX idx_asset_locations_active ON asset_locations(is_active);

CREATE INDEX idx_asset_movements_item_id ON asset_movements(inventory_item_id);
CREATE INDEX idx_asset_movements_from_location ON asset_movements(from_location_id);
CREATE INDEX idx_asset_movements_to_location ON asset_movements(to_location_id);
CREATE INDEX idx_asset_movements_type ON asset_movements(movement_type);
CREATE INDEX idx_asset_movements_date ON asset_movements(moved_at);

CREATE INDEX idx_asset_assignments_item_id ON asset_assignments(inventory_item_id);
CREATE INDEX idx_asset_assignments_assigned_to ON asset_assignments(assigned_to);
CREATE INDEX idx_asset_assignments_status ON asset_assignments(status);
CREATE INDEX idx_asset_assignments_type ON asset_assignments(assignment_type);

CREATE INDEX idx_inventory_items_inventory_id ON inventory_items(inventory_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_location ON inventory_items(current_location_id);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_tracked ON inventory_items(is_tracked);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_asset_locations_updated_at BEFORE UPDATE ON asset_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_movements_updated_at BEFORE UPDATE ON asset_movements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_assignments_updated_at BEFORE UPDATE ON asset_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update location current_count
CREATE OR REPLACE FUNCTION update_location_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update from_location count (decrease)
    IF TG_OP = 'INSERT' AND NEW.from_location_id IS NOT NULL THEN
        UPDATE asset_locations 
        SET current_count = current_count - 1 
        WHERE id = NEW.from_location_id;
    END IF;
    
    -- Update to_location count (increase)
    IF TG_OP = 'INSERT' AND NEW.to_location_id IS NOT NULL THEN
        UPDATE asset_locations 
        SET current_count = current_count + 1 
        WHERE id = NEW.to_location_id;
    END IF;
    
    -- Handle updates
    IF TG_OP = 'UPDATE' THEN
        -- Decrease old from_location
        IF OLD.from_location_id IS NOT NULL AND OLD.from_location_id != NEW.from_location_id THEN
            UPDATE asset_locations 
            SET current_count = current_count - 1 
            WHERE id = OLD.from_location_id;
        END IF;
        
        -- Increase new from_location
        IF NEW.from_location_id IS NOT NULL AND OLD.from_location_id != NEW.from_location_id THEN
            UPDATE asset_locations 
            SET current_count = current_count + 1 
            WHERE id = NEW.from_location_id;
        END IF;
        
        -- Decrease old to_location
        IF OLD.to_location_id IS NOT NULL AND OLD.to_location_id != NEW.to_location_id THEN
            UPDATE asset_locations 
            SET current_count = current_count - 1 
            WHERE id = OLD.to_location_id;
        END IF;
        
        -- Increase new to_location
        IF NEW.to_location_id IS NOT NULL AND OLD.to_location_id != NEW.to_location_id THEN
            UPDATE asset_locations 
            SET current_count = current_count + 1 
            WHERE id = NEW.to_location_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_location_count_trigger 
    AFTER INSERT OR UPDATE ON asset_movements
    FOR EACH ROW EXECUTE FUNCTION update_location_count();

-- Insert some sample locations
INSERT INTO asset_locations (name, description, location_type, address) VALUES
('Main Vault', 'Primary secure storage for high-value items', 'vault', 'Store Room A'),
('Display Case A', 'Front showcase for customer viewing', 'display_case', 'Showroom Front'),
('Workbench 1', 'Primary workbench for repairs and maintenance', 'repair_shop', 'Workshop Area'),
('Storage Shelf B', 'General storage shelf', 'shelf', 'Storage Room B'),
('Customer Location - John Smith', 'Customer pickup location', 'customer', '123 Main St, City, State'),
('Staff Assignment - Sarah Johnson', 'Staff member assignment', 'staff', 'Employee Area');

-- Insert sample inventory items (linking to existing inventory)
INSERT INTO inventory_items (inventory_id, sku, name, description, category, condition, status, current_location_id, current_value, is_tracked) 
SELECT 
    id,
    sku,
    name,
    description,
    category,
    'excellent',
    'available',
    (SELECT id FROM asset_locations WHERE name = 'Main Vault' LIMIT 1),
    unit_price,
    true
FROM inventory 
WHERE id IN (
    SELECT id FROM inventory LIMIT 2
);

-- Insert sample movements
INSERT INTO asset_movements (inventory_item_id, to_location_id, movement_type, movement_reason, notes)
SELECT 
    ii.id,
    al.id,
    'storage',
    'Initial placement in secure storage',
    'High-value item moved to safe for security'
FROM inventory_items ii
CROSS JOIN asset_locations al
WHERE al.name = 'Main Vault'
LIMIT 1;

INSERT INTO asset_movements (inventory_item_id, to_location_id, movement_type, movement_reason, notes)
SELECT 
    ii.id,
    al.id,
    'display',
    'Moving to display for customer viewing',
    'High-value item for front display'
FROM inventory_items ii
CROSS JOIN asset_locations al
WHERE al.name = 'Display Case A'
LIMIT 1;

-- Row Level Security Policies
ALTER TABLE asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON asset_locations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON asset_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON asset_locations FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON asset_movements FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON asset_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON asset_movements FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON asset_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON asset_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON asset_assignments FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON inventory_items FOR UPDATE USING (true); 