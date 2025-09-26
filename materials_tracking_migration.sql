-- Materials Tracking System Migration
-- This migration creates all necessary tables, indexes, triggers, and RLS policies for materials tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Material Categories Table
CREATE TABLE IF NOT EXISTS material_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES material_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Material Types Table
CREATE TABLE IF NOT EXISTS material_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES material_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50) NOT NULL,
    density DECIMAL(10,4),
    melting_point DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Material Suppliers Table
CREATE TABLE IF NOT EXISTS material_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    payment_terms VARCHAR(100),
    lead_time_days INTEGER DEFAULT 0,
    minimum_order_quantity DECIMAL(15,4),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Materials Table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_id UUID NOT NULL REFERENCES material_types(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES material_suppliers(id),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    specifications JSONB,
    current_stock DECIMAL(15,4) DEFAULT 0,
    minimum_stock DECIMAL(15,4) DEFAULT 0,
    maximum_stock DECIMAL(15,4),
    reorder_point DECIMAL(15,4),
    unit_cost DECIMAL(15,4) DEFAULT 0,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Material Purchase Orders Table
CREATE TABLE IF NOT EXISTS material_purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES material_suppliers(id),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(15,4) DEFAULT 0,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Material Purchase Order Items Table
CREATE TABLE IF NOT EXISTS material_purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES material_purchase_orders(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4) NOT NULL,
    total_cost DECIMAL(15,4) NOT NULL,
    received_quantity DECIMAL(15,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Material Usage Tracking Table
CREATE TABLE IF NOT EXISTS material_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    production_order_id UUID,
    order_id UUID,
    quantity_used DECIMAL(15,4) NOT NULL,
    usage_date DATE NOT NULL,
    usage_type VARCHAR(50) DEFAULT 'production',
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Material Movements Table
CREATE TABLE IF NOT EXISTS material_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    movement_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    reference_id UUID,
    reference_type VARCHAR(50),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Material Cost History Table
CREATE TABLE IF NOT EXISTS material_cost_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    cost_change_date DATE NOT NULL,
    old_cost DECIMAL(15,4),
    new_cost DECIMAL(15,4) NOT NULL,
    reason VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_type_id ON materials(type_id);
CREATE INDEX IF NOT EXISTS idx_materials_supplier_id ON materials(supplier_id);
CREATE INDEX IF NOT EXISTS idx_materials_sku ON materials(sku);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);

CREATE INDEX IF NOT EXISTS idx_material_types_category_id ON material_types(category_id);

CREATE INDEX IF NOT EXISTS idx_material_purchase_orders_supplier_id ON material_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_material_purchase_orders_status ON material_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_material_purchase_orders_date ON material_purchase_orders(order_date);

CREATE INDEX IF NOT EXISTS idx_material_purchase_order_items_po_id ON material_purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_material_purchase_order_items_material_id ON material_purchase_order_items(material_id);

CREATE INDEX IF NOT EXISTS idx_material_usage_material_id ON material_usage(material_id);
CREATE INDEX IF NOT EXISTS idx_material_usage_date ON material_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_material_usage_production_order_id ON material_usage(production_order_id);

CREATE INDEX IF NOT EXISTS idx_material_movements_material_id ON material_movements(material_id);
CREATE INDEX IF NOT EXISTS idx_material_movements_type ON material_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_material_movements_date ON material_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_material_cost_history_material_id ON material_cost_history(material_id);
CREATE INDEX IF NOT EXISTS idx_material_cost_history_date ON material_cost_history(cost_change_date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_material_categories_updated_at BEFORE UPDATE ON material_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_types_updated_at BEFORE UPDATE ON material_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_suppliers_updated_at BEFORE UPDATE ON material_suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_purchase_orders_updated_at BEFORE UPDATE ON material_purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_purchase_order_items_updated_at BEFORE UPDATE ON material_purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update material stock on movements
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'in' THEN
        UPDATE materials 
        SET current_stock = current_stock + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.material_id;
    ELSIF NEW.movement_type = 'out' THEN
        UPDATE materials 
        SET current_stock = current_stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.material_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_material_stock_on_movement AFTER INSERT ON material_movements FOR EACH ROW EXECUTE FUNCTION update_material_stock();

-- Create trigger to update purchase order totals
CREATE OR REPLACE FUNCTION update_purchase_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE material_purchase_orders 
    SET total_amount = (
        SELECT COALESCE(SUM(total_cost), 0)
        FROM material_purchase_order_items
        WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_purchase_order_total_on_item_insert AFTER INSERT ON material_purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_purchase_order_total();
CREATE TRIGGER update_purchase_order_total_on_item_update AFTER UPDATE ON material_purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_purchase_order_total();
CREATE TRIGGER update_purchase_order_total_on_item_delete AFTER DELETE ON material_purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_purchase_order_total();

-- Enable Row Level Security (RLS)
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_cost_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON material_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON material_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON material_categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON material_types FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON material_types FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON material_types FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON material_suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_suppliers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON material_suppliers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON material_suppliers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON materials FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON materials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON materials FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON material_purchase_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_purchase_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON material_purchase_orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON material_purchase_orders FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON material_purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_purchase_order_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON material_purchase_order_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON material_purchase_order_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON material_usage FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_usage FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON material_usage FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON material_usage FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON material_movements FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON material_movements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON material_movements FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON material_cost_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_cost_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON material_cost_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON material_cost_history FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data for testing
INSERT INTO material_categories (name, description) VALUES 
('Metals', 'Precious and base metals used in jewelry making'),
('Gemstones', 'Natural and synthetic gemstones'),
('Tools', 'Jewelry making tools and equipment'),
('Chemicals', 'Chemicals and compounds for jewelry making');

INSERT INTO material_types (category_id, name, description, unit_of_measure, density) VALUES 
((SELECT id FROM material_categories WHERE name = 'Metals'), 'Gold 14K', '14 karat gold', 'grams', 13.6),
((SELECT id FROM material_categories WHERE name = 'Metals'), 'Silver 925', 'Sterling silver', 'grams', 10.49),
((SELECT id FROM material_categories WHERE name = 'Gemstones'), 'Diamond', 'Natural diamond', 'carats', 3.52),
((SELECT id FROM material_categories WHERE name = 'Gemstones'), 'Ruby', 'Natural ruby', 'carats', 4.0);

INSERT INTO material_suppliers (name, contact_person, email, phone, payment_terms) VALUES 
('Metals Plus', 'John Smith', 'john@metalsplus.com', '555-0101', 'Net 30'),
('Gemstone World', 'Sarah Johnson', 'sarah@gemstoneworld.com', '555-0102', 'Net 15'),
('Tool Supply Co', 'Mike Brown', 'mike@toolsupply.com', '555-0103', 'Net 30');

-- Migration completed successfully 