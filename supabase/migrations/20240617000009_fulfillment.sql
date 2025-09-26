-- Fulfillment System Database Schema
-- This creates the complete logistics and fulfillment infrastructure

-- Fulfillment orders table - tracks the fulfillment process for each order
CREATE TABLE IF NOT EXISTS fulfillment_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    fulfillment_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, picking, picked, packed, shipped, delivered, cancelled
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    assigned_to UUID, -- staff member assigned to fulfillment
    estimated_pick_date DATE,
    estimated_ship_date DATE,
    actual_pick_date TIMESTAMP WITH TIME ZONE,
    actual_ship_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    shipping_method VARCHAR(50),
    shipping_carrier VARCHAR(50),
    tracking_number VARCHAR(100),
    shipping_cost DECIMAL(10,2),
    insurance_amount DECIMAL(10,2),
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fulfillment items table - tracks individual items in fulfillment
CREATE TABLE IF NOT EXISTS fulfillment_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fulfillment_order_id UUID REFERENCES fulfillment_orders(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventory(id),
    sku VARCHAR(50),
    product_name VARCHAR(255),
    quantity_ordered INTEGER NOT NULL,
    quantity_picked INTEGER DEFAULT 0,
    quantity_packed INTEGER DEFAULT 0,
    quantity_shipped INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    location_code VARCHAR(50), -- warehouse location
    bin_number VARCHAR(50), -- specific bin/location
    picked_by UUID,
    picked_at TIMESTAMP WITH TIME ZONE,
    packed_by UUID,
    packed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping packages table - tracks individual packages for multi-package shipments
CREATE TABLE IF NOT EXISTS shipping_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fulfillment_order_id UUID REFERENCES fulfillment_orders(id) ON DELETE CASCADE,
    package_number VARCHAR(50) NOT NULL,
    weight DECIMAL(8,2),
    dimensions VARCHAR(50), -- "LxWxH" format
    shipping_method VARCHAR(50),
    shipping_carrier VARCHAR(50),
    tracking_number VARCHAR(100),
    label_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping rates table - stores shipping rate information
CREATE TABLE IF NOT EXISTS shipping_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carrier VARCHAR(50) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    service_code VARCHAR(50) NOT NULL,
    origin_zip VARCHAR(20),
    destination_zip VARCHAR(20),
    weight_min DECIMAL(8,2),
    weight_max DECIMAL(8,2),
    rate DECIMAL(10,2) NOT NULL,
    delivery_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fulfillment status history table - tracks all status changes
CREATE TABLE IF NOT EXISTS fulfillment_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fulfillment_order_id UUID REFERENCES fulfillment_orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    changed_by UUID,
    notes TEXT,
    metadata JSONB, -- additional data about the status change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warehouse locations table - manages inventory locations
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location_code VARCHAR(50) UNIQUE NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50), -- shelf, bin, pallet, etc.
    aisle VARCHAR(50),
    shelf VARCHAR(50),
    bin VARCHAR(50),
    zone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    capacity INTEGER,
    current_utilization INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_fulfillment_orders_order_id ON fulfillment_orders(order_id);
CREATE INDEX idx_fulfillment_orders_status ON fulfillment_orders(status);
CREATE INDEX idx_fulfillment_orders_fulfillment_number ON fulfillment_orders(fulfillment_number);
CREATE INDEX idx_fulfillment_orders_assigned_to ON fulfillment_orders(assigned_to);
CREATE INDEX idx_fulfillment_orders_estimated_ship_date ON fulfillment_orders(estimated_ship_date);

CREATE INDEX idx_fulfillment_items_fulfillment_order_id ON fulfillment_items(fulfillment_order_id);
CREATE INDEX idx_fulfillment_items_inventory_id ON fulfillment_items(inventory_id);
CREATE INDEX idx_fulfillment_items_sku ON fulfillment_items(sku);
CREATE INDEX idx_fulfillment_items_location_code ON fulfillment_items(location_code);

CREATE INDEX idx_shipping_packages_fulfillment_order_id ON shipping_packages(fulfillment_order_id);
CREATE INDEX idx_shipping_packages_tracking_number ON shipping_packages(tracking_number);
CREATE INDEX idx_shipping_packages_carrier ON shipping_packages(shipping_carrier);

CREATE INDEX idx_shipping_rates_carrier_service ON shipping_rates(carrier, service_code);
CREATE INDEX idx_shipping_rates_origin_destination ON shipping_rates(origin_zip, destination_zip);

CREATE INDEX idx_fulfillment_status_history_fulfillment_order_id ON fulfillment_status_history(fulfillment_order_id);
CREATE INDEX idx_fulfillment_status_history_status ON fulfillment_status_history(status);
CREATE INDEX idx_fulfillment_status_history_created_at ON fulfillment_status_history(created_at);

CREATE INDEX idx_warehouse_locations_location_code ON warehouse_locations(location_code);
CREATE INDEX idx_warehouse_locations_zone ON warehouse_locations(zone);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_fulfillment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_fulfillment_orders_updated_at
    BEFORE UPDATE ON fulfillment_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_fulfillment_updated_at();

CREATE TRIGGER update_fulfillment_items_updated_at
    BEFORE UPDATE ON fulfillment_items
    FOR EACH ROW
    EXECUTE FUNCTION update_fulfillment_updated_at();

CREATE TRIGGER update_shipping_packages_updated_at
    BEFORE UPDATE ON shipping_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_fulfillment_updated_at();

CREATE TRIGGER update_shipping_rates_updated_at
    BEFORE UPDATE ON shipping_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_fulfillment_updated_at();

CREATE TRIGGER update_warehouse_locations_updated_at
    BEFORE UPDATE ON warehouse_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_fulfillment_updated_at();

-- Function to generate fulfillment number
CREATE OR REPLACE FUNCTION generate_fulfillment_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    fulfillment_number VARCHAR(50);
BEGIN
    -- Get the next number
    SELECT COALESCE(MAX(CAST(SUBSTRING(fulfillment_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM fulfillment_orders
    WHERE fulfillment_number LIKE 'FUL-%';
    
    -- Format the fulfillment number
    fulfillment_number := 'FUL-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN fulfillment_number;
END;
$$ language 'plpgsql';

-- Function to generate package number
CREATE OR REPLACE FUNCTION generate_package_number(fulfillment_order_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    package_number VARCHAR(50);
BEGIN
    -- Get the next package number for this fulfillment order
    SELECT COALESCE(MAX(CAST(SUBSTRING(package_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM shipping_packages
    WHERE fulfillment_order_id = $1 AND package_number LIKE 'PKG-%';
    
    -- Format the package number
    package_number := 'PKG-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN package_number;
END;
$$ language 'plpgsql';

-- Enable RLS on all tables
ALTER TABLE fulfillment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fulfillment_orders
CREATE POLICY "Authenticated users can view fulfillment orders"
    ON fulfillment_orders FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert fulfillment orders"
    ON fulfillment_orders FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update fulfillment orders"
    ON fulfillment_orders FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fulfillment orders"
    ON fulfillment_orders FOR DELETE
    TO authenticated
    USING (true);

-- Create RLS policies for fulfillment_items
CREATE POLICY "Authenticated users can view fulfillment items"
    ON fulfillment_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert fulfillment items"
    ON fulfillment_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update fulfillment items"
    ON fulfillment_items FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fulfillment items"
    ON fulfillment_items FOR DELETE
    TO authenticated
    USING (true);

-- Create RLS policies for shipping_packages
CREATE POLICY "Authenticated users can view shipping packages"
    ON shipping_packages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert shipping packages"
    ON shipping_packages FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update shipping packages"
    ON shipping_packages FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete shipping packages"
    ON shipping_packages FOR DELETE
    TO authenticated
    USING (true);

-- Create RLS policies for shipping_rates
CREATE POLICY "Authenticated users can view shipping rates"
    ON shipping_rates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert shipping rates"
    ON shipping_rates FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update shipping rates"
    ON shipping_rates FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete shipping rates"
    ON shipping_rates FOR DELETE
    TO authenticated
    USING (true);

-- Create RLS policies for fulfillment_status_history
CREATE POLICY "Authenticated users can view fulfillment status history"
    ON fulfillment_status_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert fulfillment status history"
    ON fulfillment_status_history FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create RLS policies for warehouse_locations
CREATE POLICY "Authenticated users can view warehouse locations"
    ON warehouse_locations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert warehouse locations"
    ON warehouse_locations FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update warehouse locations"
    ON warehouse_locations FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete warehouse locations"
    ON warehouse_locations FOR DELETE
    TO authenticated
    USING (true); 