-- Inventory Sharing System Migration
-- This migration creates the foundation for selective inventory sharing between jewelry professionals

-- =====================================================
-- STEP 1: CREATE INVENTORY SHARING TABLES
-- =====================================================

-- Create inventory sharing table
CREATE TABLE IF NOT EXISTS inventory_sharing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Sharing settings
    is_shared BOOLEAN DEFAULT false,
    visibility_level TEXT DEFAULT 'private' CHECK (visibility_level IN ('private', 'public', 'connections_only', 'specific_connections')),
    
    -- Pricing visibility
    show_pricing BOOLEAN DEFAULT true,
    pricing_tier TEXT DEFAULT 'standard' CHECK (pricing_tier IN ('wholesale', 'retail', 'negotiable', 'hidden')),
    
    -- B2B specific options
    b2b_enabled BOOLEAN DEFAULT false,
    b2b_minimum_order DECIMAL(10,2),
    b2b_payment_terms TEXT,
    b2b_shipping_terms TEXT,
    
    -- Metadata
    sharing_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory sharing connections table (who can see what)
CREATE TABLE IF NOT EXISTS inventory_sharing_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sharing_id UUID NOT NULL REFERENCES inventory_sharing(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Connection type
    connection_type TEXT DEFAULT 'connection' CHECK (connection_type IN ('connection', 'partner', 'customer', 'vendor')),
    
    -- Visibility permissions
    can_view_pricing BOOLEAN DEFAULT true,
    can_view_quantity BOOLEAN DEFAULT true,
    can_request_quote BOOLEAN DEFAULT true,
    can_place_order BOOLEAN DEFAULT false,
    
    -- Custom pricing for this connection
    custom_price DECIMAL(10,2),
    custom_discount_percent DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique sharing connections
    UNIQUE(sharing_id, viewer_id)
);

-- Create inventory sharing requests table
CREATE TABLE IF NOT EXISTS inventory_sharing_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    
    -- Request details
    request_type TEXT DEFAULT 'view' CHECK (request_type IN ('view', 'quote', 'order', 'partnership')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    
    -- Request message
    message TEXT,
    requested_quantity INTEGER,
    requested_price DECIMAL(10,2),
    
    -- Response
    response_message TEXT,
    response_price DECIMAL(10,2),
    response_quantity INTEGER,
    
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory sharing analytics table
CREATE TABLE IF NOT EXISTS inventory_sharing_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sharing_id UUID NOT NULL REFERENCES inventory_sharing(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- View metrics
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Interaction metrics
    quote_requests INTEGER DEFAULT 0,
    order_requests INTEGER DEFAULT 0,
    partnership_requests INTEGER DEFAULT 0,
    
    -- Engagement metrics
    time_spent_seconds INTEGER DEFAULT 0,
    shared_with_others INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(sharing_id, viewer_id)
);

-- =====================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Inventory sharing indexes
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_inventory_id ON inventory_sharing(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_owner_id ON inventory_sharing(owner_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_visibility ON inventory_sharing(visibility_level);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_b2b ON inventory_sharing(b2b_enabled);

-- Inventory sharing connections indexes
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_connections_sharing_id ON inventory_sharing_connections(sharing_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_connections_viewer_id ON inventory_sharing_connections(viewer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_connections_type ON inventory_sharing_connections(connection_type);

-- Inventory sharing requests indexes
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_requests_requester_id ON inventory_sharing_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_requests_owner_id ON inventory_sharing_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_requests_inventory_id ON inventory_sharing_requests(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_requests_status ON inventory_sharing_requests(status);

-- Inventory sharing analytics indexes
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_analytics_sharing_id ON inventory_sharing_analytics(sharing_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sharing_analytics_viewer_id ON inventory_sharing_analytics(viewer_id);

-- =====================================================
-- STEP 3: CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE inventory_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sharing_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sharing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sharing_analytics ENABLE ROW LEVEL SECURITY;

-- Inventory sharing policies
CREATE POLICY "Users can view their own inventory sharing settings"
    ON inventory_sharing FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own inventory sharing settings"
    ON inventory_sharing FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own inventory sharing settings"
    ON inventory_sharing FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

-- Inventory sharing connections policies
CREATE POLICY "Users can view connections to their shared inventory"
    ON inventory_sharing_connections FOR SELECT
    TO authenticated
    USING (
        sharing_id IN (
            SELECT id FROM inventory_sharing WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view connections they are part of"
    ON inventory_sharing_connections FOR SELECT
    TO authenticated
    USING (viewer_id = auth.uid());

CREATE POLICY "Users can manage connections to their shared inventory"
    ON inventory_sharing_connections FOR ALL
    TO authenticated
    USING (
        sharing_id IN (
            SELECT id FROM inventory_sharing WHERE owner_id = auth.uid()
        )
    );

-- Inventory sharing requests policies
CREATE POLICY "Users can view requests they sent"
    ON inventory_sharing_requests FOR SELECT
    TO authenticated
    USING (requester_id = auth.uid());

CREATE POLICY "Users can view requests for their inventory"
    ON inventory_sharing_requests FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Users can create requests"
    ON inventory_sharing_requests FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update requests for their inventory"
    ON inventory_sharing_requests FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());

-- Inventory sharing analytics policies
CREATE POLICY "Users can view analytics for their shared inventory"
    ON inventory_sharing_analytics FOR SELECT
    TO authenticated
    USING (
        sharing_id IN (
            SELECT id FROM inventory_sharing WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own analytics"
    ON inventory_sharing_analytics FOR SELECT
    TO authenticated
    USING (viewer_id = auth.uid());

-- =====================================================
-- STEP 4: CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_sharing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically create sharing record when inventory is created
CREATE OR REPLACE FUNCTION create_inventory_sharing_record()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO inventory_sharing (inventory_id, owner_id)
    VALUES (NEW.id, NEW.created_by);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to track inventory views
CREATE OR REPLACE FUNCTION track_inventory_view(sharing_id UUID, viewer_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO inventory_sharing_analytics (sharing_id, viewer_id, view_count, last_viewed_at)
    VALUES (sharing_id, viewer_id, 1, NOW())
    ON CONFLICT (sharing_id, viewer_id)
    DO UPDATE SET
        view_count = inventory_sharing_analytics.view_count + 1,
        last_viewed_at = NOW(),
        updated_at = NOW();
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_inventory_sharing_updated_at
    BEFORE UPDATE ON inventory_sharing
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_sharing_updated_at();

CREATE TRIGGER update_inventory_sharing_connections_updated_at
    BEFORE UPDATE ON inventory_sharing_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_sharing_updated_at();

CREATE TRIGGER update_inventory_sharing_requests_updated_at
    BEFORE UPDATE ON inventory_sharing_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_sharing_updated_at();

CREATE TRIGGER update_inventory_sharing_analytics_updated_at
    BEFORE UPDATE ON inventory_sharing_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_sharing_updated_at();

-- =====================================================
-- STEP 5: CREATE VIEWS FOR EASY QUERYING
-- =====================================================

-- View for shared inventory with visibility rules
CREATE OR REPLACE VIEW shared_inventory_view AS
SELECT 
    i.*,
    is.visibility_level,
    is.show_pricing,
    is.pricing_tier,
    is.b2b_enabled,
    is.b2b_minimum_order,
    is.b2b_payment_terms,
    is.b2b_shipping_terms,
    is.sharing_notes,
    u.full_name as owner_name,
    u.email as owner_email
FROM inventory i
JOIN inventory_sharing is ON i.id = is.inventory_id
JOIN users u ON is.owner_id = u.id
WHERE is.is_shared = true;

-- View for inventory sharing analytics summary
CREATE OR REPLACE VIEW inventory_sharing_analytics_summary AS
SELECT 
    is.inventory_id,
    i.name as inventory_name,
    is.owner_id,
    u.full_name as owner_name,
    COUNT(DISTINCT isa.viewer_id) as total_viewers,
    SUM(isa.view_count) as total_views,
    SUM(isa.quote_requests) as total_quote_requests,
    SUM(isa.order_requests) as total_order_requests,
    MAX(isa.last_viewed_at) as last_activity
FROM inventory_sharing is
JOIN inventory i ON is.inventory_id = i.id
JOIN users u ON is.owner_id = u.id
LEFT JOIN inventory_sharing_analytics isa ON is.id = isa.sharing_id
WHERE is.is_shared = true
GROUP BY is.inventory_id, i.name, is.owner_id, u.full_name;

-- =====================================================
-- STEP 6: INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample inventory sharing records for existing inventory
INSERT INTO inventory_sharing (inventory_id, owner_id, is_shared, visibility_level, show_pricing, b2b_enabled)
SELECT 
    id,
    (SELECT id FROM users LIMIT 1), -- Use first user as owner
    false, -- Default to not shared
    'private',
    true,
    false
FROM inventory
WHERE id NOT IN (SELECT inventory_id FROM inventory_sharing);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE inventory_sharing IS 'Controls which inventory items are shared and with whom';
COMMENT ON TABLE inventory_sharing_connections IS 'Defines who can access shared inventory and their permissions';
COMMENT ON TABLE inventory_sharing_requests IS 'Tracks requests for access to shared inventory';
COMMENT ON TABLE inventory_sharing_analytics IS 'Analytics on how shared inventory is being viewed and used';
