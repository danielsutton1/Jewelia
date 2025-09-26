-- ============================================================================
-- MATERIALS TRACKING SYSTEM
-- Comprehensive materials management for jewelry production
-- ============================================================================

-- ============================================================================
-- MATERIAL TYPES AND CATEGORIES
-- ============================================================================

-- Material categories (metals, gems, findings, etc.)
CREATE TABLE IF NOT EXISTS material_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color for UI
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material types within categories
CREATE TABLE IF NOT EXISTS material_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES material_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20) NOT NULL, -- grams, carats, pieces, etc.
    density DECIMAL(10,4), -- g/cm³ for metals
    hardness DECIMAL(5,2), -- Mohs scale for gems
    melting_point DECIMAL(8,2), -- Celsius for metals
    color VARCHAR(50),
    finish_options TEXT[], -- Array of available finishes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- ============================================================================
-- SUPPLIERS AND CONTACTS
-- ============================================================================

-- Supplier information
CREATE TABLE IF NOT EXISTS material_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12,2),
    quality_rating DECIMAL(3,2), -- 0.00 to 5.00
    reliability_rating DECIMAL(3,2), -- 0.00 to 5.00
    certifications TEXT[], -- Array of certifications
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MATERIALS INVENTORY
-- ============================================================================

-- Individual materials in inventory
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_type_id UUID REFERENCES material_types(id) ON DELETE RESTRICT,
    supplier_id UUID REFERENCES material_suppliers(id) ON DELETE SET NULL,
    
    -- Basic information
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    lot_number VARCHAR(100),
    certificate_number VARCHAR(100),
    
    -- Specifications
    weight DECIMAL(10,4), -- in grams
    dimensions TEXT, -- JSON or text description
    color VARCHAR(50),
    finish VARCHAR(100),
    purity DECIMAL(5,2), -- percentage for metals
    clarity VARCHAR(50), -- for gems
    cut VARCHAR(50), -- for gems
    
    -- Inventory management
    current_stock DECIMAL(12,4) DEFAULT 0,
    minimum_stock DECIMAL(12,4) DEFAULT 0,
    reorder_point DECIMAL(12,4) DEFAULT 0,
    reorder_quantity DECIMAL(12,4) DEFAULT 0,
    location VARCHAR(100),
    
    -- Cost information
    unit_cost DECIMAL(10,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    markup_percentage DECIMAL(5,2) DEFAULT 0,
    selling_price DECIMAL(10,4),
    
    -- Status and tracking
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, discontinued
    condition VARCHAR(50) DEFAULT 'new', -- new, used, damaged
    expiry_date DATE,
    last_audit_date DATE,
    
    -- Metadata
    tags TEXT[],
    images TEXT[], -- Array of image URLs
    documents TEXT[], -- Array of document URLs
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PURCHASE ORDERS AND RECEIVING
-- ============================================================================

-- Purchase orders for materials
CREATE TABLE IF NOT EXISTS material_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES material_suppliers(id) ON DELETE RESTRICT,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- Order details
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, confirmed, received, cancelled
    
    -- Financial information
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Shipping information
    shipping_address TEXT,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    
    -- Notes and approval
    notes TEXT,
    approved_by UUID, -- Reference to users table
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase order line items
CREATE TABLE IF NOT EXISTS material_purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES material_purchase_orders(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE RESTRICT,
    
    -- Item details
    quantity DECIMAL(12,4) NOT NULL,
    unit_cost DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    
    -- Receiving information
    received_quantity DECIMAL(12,4) DEFAULT 0,
    received_date DATE,
    quality_check_passed BOOLEAN,
    quality_notes TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ordered', -- ordered, partially_received, received, cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MATERIAL USAGE TRACKING
-- ============================================================================

-- Material usage records (consumption per production item)
CREATE TABLE IF NOT EXISTS material_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materials(id) ON DELETE RESTRICT,
    production_item_id UUID, -- Reference to production items (flexible)
    order_id UUID, -- Reference to orders (flexible)
    project_id VARCHAR(100), -- Project identifier
    
    -- Usage details
    quantity_used DECIMAL(12,4) NOT NULL,
    quantity_waste DECIMAL(12,4) DEFAULT 0,
    total_quantity DECIMAL(12,4) NOT NULL, -- used + waste
    
    -- Cost information
    unit_cost_at_time DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    waste_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Usage context
    usage_type VARCHAR(50) DEFAULT 'production', -- production, repair, sample, testing
    usage_notes TEXT,
    
    -- Tracking
    used_by UUID, -- Reference to users table
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MATERIAL MOVEMENTS AND TRANSFERS
-- ============================================================================

-- Material movements (in, out, transfer, adjustment)
CREATE TABLE IF NOT EXISTS material_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materials(id) ON DELETE RESTRICT,
    
    -- Movement details
    movement_type VARCHAR(50) NOT NULL, -- in, out, transfer, adjustment, loss
    quantity DECIMAL(12,4) NOT NULL,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    
    -- Reference information
    reference_type VARCHAR(50), -- purchase_order, usage, transfer, adjustment
    reference_id UUID, -- ID of the referenced record
    
    -- Cost impact
    unit_cost DECIMAL(10,4),
    total_cost DECIMAL(12,2),
    
    -- Notes and approval
    notes TEXT,
    approved_by UUID, -- Reference to users table
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    moved_by UUID, -- Reference to users table
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COST ANALYSIS AND PRICING
-- ============================================================================

-- Material cost history for trend analysis
CREATE TABLE IF NOT EXISTS material_cost_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES material_suppliers(id) ON DELETE SET NULL,
    
    -- Cost information
    unit_cost DECIMAL(10,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    effective_date DATE NOT NULL,
    
    -- Context
    source VARCHAR(50), -- purchase, adjustment, market_update
    reference_id UUID, -- ID of the source record
    
    -- Market data
    market_price DECIMAL(10,4),
    price_change_percentage DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Material categories
CREATE INDEX IF NOT EXISTS idx_material_categories_active ON material_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_material_categories_sort ON material_categories(sort_order);

-- Material types
CREATE INDEX IF NOT EXISTS idx_material_types_category ON material_types(category_id);
CREATE INDEX IF NOT EXISTS idx_material_types_active ON material_types(is_active);

-- Suppliers
CREATE INDEX IF NOT EXISTS idx_material_suppliers_active ON material_suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_material_suppliers_name ON material_suppliers(name);

-- Materials
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type_id);
CREATE INDEX IF NOT EXISTS idx_materials_supplier ON materials(supplier_id);
CREATE INDEX IF NOT EXISTS idx_materials_sku ON materials(sku);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_stock ON materials(current_stock);
CREATE INDEX IF NOT EXISTS idx_materials_location ON materials(location);

-- Purchase orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON material_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON material_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON material_purchase_orders(order_date);

-- Purchase order items
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON material_purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_material ON material_purchase_order_items(material_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_status ON material_purchase_order_items(status);

-- Material usage
CREATE INDEX IF NOT EXISTS idx_material_usage_material ON material_usage(material_id);
CREATE INDEX IF NOT EXISTS idx_material_usage_production ON material_usage(production_item_id);
CREATE INDEX IF NOT EXISTS idx_material_usage_order ON material_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_material_usage_date ON material_usage(used_at);

-- Material movements
CREATE INDEX IF NOT EXISTS idx_material_movements_material ON material_movements(material_id);
CREATE INDEX IF NOT EXISTS idx_material_movements_type ON material_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_material_movements_date ON material_movements(moved_at);

-- Cost history
CREATE INDEX IF NOT EXISTS idx_material_cost_history_material ON material_cost_history(material_id);
CREATE INDEX IF NOT EXISTS idx_material_cost_history_date ON material_cost_history(effective_date);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update material stock when movements occur
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update material stock based on movement type
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_material_stock
    AFTER INSERT ON material_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_material_stock();

-- Update material stock when usage is recorded
CREATE OR REPLACE FUNCTION update_material_stock_from_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Decrease stock when material is used
        UPDATE materials 
        SET current_stock = current_stock - NEW.total_quantity,
            updated_at = NOW()
        WHERE id = NEW.material_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_material_stock_from_usage
    AFTER INSERT ON material_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_material_stock_from_usage();

-- Update material stock when purchase order items are received
CREATE OR REPLACE FUNCTION update_material_stock_from_receiving()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- If received quantity changed, update stock
        IF OLD.received_quantity != NEW.received_quantity THEN
            UPDATE materials 
            SET current_stock = current_stock + (NEW.received_quantity - OLD.received_quantity),
                updated_at = NOW()
            WHERE id = NEW.material_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_material_stock_from_receiving
    AFTER UPDATE ON material_purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_material_stock_from_receiving();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_cost_history ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your authentication system)
CREATE POLICY "Enable read access for all users" ON material_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON material_categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON material_categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON material_types FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON material_types FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON material_types FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON material_suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON material_suppliers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON material_suppliers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON materials FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON materials FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON materials FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON material_purchase_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON material_purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON material_purchase_orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON material_purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_purchase_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON material_purchase_order_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON material_purchase_order_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON material_usage FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON material_usage FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON material_usage FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON material_movements FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON material_movements FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON material_movements FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON material_cost_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON material_cost_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON material_cost_history FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON material_cost_history FOR DELETE USING (true);

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample material categories
INSERT INTO material_categories (name, description, color, icon, sort_order) VALUES
('Metals', 'Precious and base metals for jewelry making', '#FFD700', 'metal', 1),
('Gemstones', 'Natural and synthetic gemstones', '#FF69B4', 'gem', 2),
('Findings', 'Clasps, jump rings, and other components', '#4169E1', 'finding', 3),
('Tools & Equipment', 'Jewelry making tools and equipment', '#32CD32', 'tool', 4),
('Chemicals', 'Soldering, cleaning, and finishing chemicals', '#FF4500', 'chemical', 5);

-- Insert sample material types
INSERT INTO material_types (category_id, name, description, unit_of_measure, density, hardness, color, finish_options) VALUES
((SELECT id FROM material_categories WHERE name = 'Metals'), 'Sterling Silver', '92.5% silver alloy', 'grams', 10.49, 2.5, 'Silver', ARRAY['Polished', 'Brushed', 'Hammered', 'Oxidized']),
((SELECT id FROM material_categories WHERE name = 'Metals'), '14K Yellow Gold', '58.3% gold alloy', 'grams', 13.8, 2.5, 'Yellow', ARRAY['Polished', 'Brushed', 'Hammered']),
((SELECT id FROM material_categories WHERE name = 'Metals'), 'Platinum', '95% platinum alloy', 'grams', 21.45, 4.5, 'White', ARRAY['Polished', 'Brushed', 'Hammered']),
((SELECT id FROM material_categories WHERE name = 'Gemstones'), 'Diamond', 'Natural diamond', 'carats', 3.52, 10.0, 'White', ARRAY['Brilliant Cut', 'Princess Cut', 'Oval Cut']),
((SELECT id FROM material_categories WHERE name = 'Gemstones'), 'Ruby', 'Natural ruby', 'carats', 4.0, 9.0, 'Red', ARRAY['Faceted', 'Cabochon']),
((SELECT id FROM material_categories WHERE name = 'Findings'), 'Lobster Clasp', 'Standard lobster clasp', 'pieces', NULL, NULL, 'Silver', ARRAY['Polished', 'Brushed']),
((SELECT id FROM material_categories WHERE name = 'Findings'), 'Jump Ring', 'Standard jump ring', 'pieces', NULL, NULL, 'Silver', ARRAY['Polished', 'Brushed']);

-- Insert sample suppliers
INSERT INTO material_suppliers (name, contact_person, email, phone, website, address, city, state, country, quality_rating, reliability_rating) VALUES
('Precious Metals Co.', 'John Smith', 'john@preciousmetals.com', '+1-555-0123', 'https://preciousmetals.com', '123 Metal St', 'New York', 'NY', 'USA', 4.8, 4.9),
('Gemstone World', 'Sarah Johnson', 'sarah@gemstoneworld.com', '+1-555-0456', 'https://gemstoneworld.com', '456 Gem Ave', 'Los Angeles', 'CA', 'USA', 4.6, 4.7),
('Findings Plus', 'Mike Davis', 'mike@findingsplus.com', '+1-555-0789', 'https://findingsplus.com', '789 Finding Blvd', 'Chicago', 'IL', 'USA', 4.5, 4.6);

-- Insert sample materials
INSERT INTO materials (material_type_id, supplier_id, name, description, sku, current_stock, unit_cost, selling_price, location) VALUES
((SELECT id FROM material_types WHERE name = 'Sterling Silver'), (SELECT id FROM material_suppliers WHERE name = 'Precious Metals Co.'), 'Sterling Silver Sheet 0.8mm', '0.8mm thick sterling silver sheet', 'SS-SHEET-08', 5000.0, 0.85, 1.20, 'Warehouse A - Shelf 1'),
((SELECT id FROM material_types WHERE name = '14K Yellow Gold'), (SELECT id FROM material_suppliers WHERE name = 'Precious Metals Co.'), '14K Yellow Gold Wire 1.2mm', '1.2mm round wire', 'YG-WIRE-12', 2500.0, 45.50, 65.00, 'Warehouse A - Shelf 2'),
((SELECT id FROM material_types WHERE name = 'Diamond'), (SELECT id FROM material_suppliers WHERE name = 'Gemstone World'), 'Diamond 0.5ct VS1', '0.5 carat diamond, VS1 clarity', 'DIAM-05-VS1', 50.0, 1200.00, 1800.00, 'Safe 1'),
((SELECT id FROM material_types WHERE name = 'Lobster Clasp'), (SELECT id FROM material_suppliers WHERE name = 'Findings Plus'), 'Sterling Silver Lobster Clasp 12mm', '12mm sterling silver lobster clasp', 'LC-SS-12', 1000.0, 2.50, 4.00, 'Warehouse B - Box 1');

COMMIT; 