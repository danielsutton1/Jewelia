-- Partner Inventory Access Integration Migration
-- This migration creates the bridge between business partner network and inventory sharing

-- =====================================================
-- CREATE PARTNER INVENTORY ACCESS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS partner_inventory_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Partner and requester IDs
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    
    -- Access details
    access_type TEXT DEFAULT 'view' CHECK (access_type IN ('view', 'quote', 'order', 'full')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    
    -- Request/Response messages
    message TEXT,
    response_message TEXT,
    
    -- Permissions (stored as JSONB for flexibility)
    permissions JSONB DEFAULT '{
        "can_view_pricing": false,
        "can_view_quantity": false,
        "can_request_quote": false,
        "can_place_order": false
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_partner_inventory_access UNIQUE(partner_id, requester_id, inventory_id)
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_partner_inventory_access_partner_id ON partner_inventory_access(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_inventory_access_requester_id ON partner_inventory_access(requester_id);
CREATE INDEX IF NOT EXISTS idx_partner_inventory_access_inventory_id ON partner_inventory_access(inventory_id);
CREATE INDEX IF NOT EXISTS idx_partner_inventory_access_status ON partner_inventory_access(status);
CREATE INDEX IF NOT EXISTS idx_partner_inventory_access_created_at ON partner_inventory_access(created_at);

-- =====================================================
-- CREATE UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_partner_inventory_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_partner_inventory_access_updated_at
    BEFORE UPDATE ON partner_inventory_access
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_inventory_access_updated_at();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE partner_inventory_access ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Partners can view requests for their inventory
CREATE POLICY "Partners can view their inventory access requests"
    ON partner_inventory_access FOR SELECT
    TO authenticated
    USING (
        partner_id IN (
            SELECT id FROM partners 
            WHERE id IN (
                SELECT partner_b FROM partner_relationships 
                WHERE partner_a = auth.uid()::text::uuid AND status = 'accepted'
                UNION
                SELECT partner_a FROM partner_relationships 
                WHERE partner_b = auth.uid()::text::uuid AND status = 'accepted'
            )
        )
    );

-- Users can view their own access requests
CREATE POLICY "Users can view their own access requests"
    ON partner_inventory_access FOR SELECT
    TO authenticated
    USING (requester_id = auth.uid());

-- Partners can insert access requests for their inventory
CREATE POLICY "Partners can manage access requests for their inventory"
    ON partner_inventory_access FOR ALL
    TO authenticated
    USING (
        partner_id IN (
            SELECT id FROM partners 
            WHERE id IN (
                SELECT partner_b FROM partner_relationships 
                WHERE partner_a = auth.uid()::text::uuid AND status = 'accepted'
                UNION
                SELECT partner_a FROM partner_relationships 
                WHERE partner_b = auth.uid()::text::uuid AND status = 'accepted'
            )
        )
    );

-- Users can insert their own access requests
CREATE POLICY "Users can create their own access requests"
    ON partner_inventory_access FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

-- =====================================================
-- CREATE HELPER VIEW FOR PARTNER INVENTORY
-- =====================================================

CREATE OR REPLACE VIEW partner_inventory_view AS
SELECT 
    pia.*,
    p.name as partner_name,
    p.company as partner_company,
    p.avatar_url as partner_avatar,
    p.location as partner_location,
    u.full_name as requester_name,
    u.email as requester_email,
    u.company as requester_company,
    i.name as inventory_name,
    i.sku as inventory_sku,
    i.category as inventory_category,
    i.price as inventory_price,
    i.photo_urls as inventory_photos
FROM partner_inventory_access pia
LEFT JOIN partners p ON pia.partner_id = p.id
LEFT JOIN users u ON pia.requester_id = u.id
LEFT JOIN inventory i ON pia.inventory_id = i.id;

-- =====================================================
-- CREATE FUNCTION TO AUTO-APPROVE CONNECTED PARTNERS
-- =====================================================

CREATE OR REPLACE FUNCTION auto_approve_connected_partner_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- When a partner relationship is accepted, automatically create inventory access
    -- for shared inventory items (with default permissions)
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- Insert inventory access for partner A's shared inventory to partner B
        INSERT INTO partner_inventory_access (
            partner_id, 
            requester_id, 
            inventory_id, 
            access_type, 
            status, 
            permissions
        )
        SELECT 
            NEW.partner_a,
            NEW.partner_b,
            is.inventory_id,
            'view',
            'approved',
            jsonb_build_object(
                'can_view_pricing', is.show_pricing,
                'can_view_quantity', true,
                'can_request_quote', true,
                'can_place_order', is.b2b_enabled
            )
        FROM inventory_sharing is
        WHERE is.owner_id = NEW.partner_a 
        AND is.is_shared = true
        AND is.visibility_level IN ('public', 'connections_only')
        ON CONFLICT (partner_id, requester_id, inventory_id) DO NOTHING;

        -- Insert inventory access for partner B's shared inventory to partner A
        INSERT INTO partner_inventory_access (
            partner_id, 
            requester_id, 
            inventory_id, 
            access_type, 
            status, 
            permissions
        )
        SELECT 
            NEW.partner_b,
            NEW.partner_a,
            is.inventory_id,
            'view',
            'approved',
            jsonb_build_object(
                'can_view_pricing', is.show_pricing,
                'can_view_quantity', true,
                'can_request_quote', true,
                'can_place_order', is.b2b_enabled
            )
        FROM inventory_sharing is
        WHERE is.owner_id = NEW.partner_b 
        AND is.is_shared = true
        AND is.visibility_level IN ('public', 'connections_only')
        ON CONFLICT (partner_id, requester_id, inventory_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-approve connected partners
CREATE TRIGGER auto_approve_connected_partner_inventory_trigger
    AFTER UPDATE ON partner_relationships
    FOR EACH ROW
    EXECUTE FUNCTION auto_approve_connected_partner_inventory();

-- =====================================================
-- CREATE FUNCTION TO EXPIRE OLD REQUESTS
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_inventory_access_requests()
RETURNS void AS $$
BEGIN
    UPDATE partner_inventory_access 
    SET status = 'expired'
    WHERE status = 'pending' 
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ language 'plpgsql';

-- Create a scheduled job to expire old requests (this would need to be set up in your cron system)
-- SELECT cron.schedule('expire-inventory-access-requests', '0 0 * * *', 'SELECT expire_old_inventory_access_requests();');
