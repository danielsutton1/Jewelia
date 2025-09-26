-- Quote and Order Request System Migration
-- This migration creates tables for managing quote requests and order requests between partners

-- =====================================================
-- CREATE QUOTE REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Partner and requester IDs
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    
    -- Quote details
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    requested_price DECIMAL(10,2),
    message TEXT,
    
    -- Response details
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'expired')),
    response_price DECIMAL(10,2),
    response_message TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE ORDER REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS order_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Partner and requester IDs
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    
    -- Order details
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    agreed_price DECIMAL(10,2) NOT NULL,
    
    -- Shipping and billing
    shipping_address TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    payment_terms TEXT NOT NULL,
    special_instructions TEXT,
    
    -- Order status and tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    tracking_number TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Quote requests indexes
CREATE INDEX IF NOT EXISTS idx_quote_requests_requester_id ON quote_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_partner_id ON quote_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_inventory_id ON quote_requests(inventory_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at);

-- Order requests indexes
CREATE INDEX IF NOT EXISTS idx_order_requests_requester_id ON order_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_partner_id ON order_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_inventory_id ON order_requests(inventory_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_status ON order_requests(status);
CREATE INDEX IF NOT EXISTS idx_order_requests_created_at ON order_requests(created_at);

-- =====================================================
-- CREATE UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_quote_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quote_requests_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_quote_requests_updated_at();

CREATE OR REPLACE FUNCTION update_order_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_order_requests_updated_at
    BEFORE UPDATE ON order_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_order_requests_updated_at();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES FOR QUOTE REQUESTS
-- =====================================================

-- Users can view their own quote requests
CREATE POLICY "Users can view their own quote requests"
    ON quote_requests FOR SELECT
    TO authenticated
    USING (requester_id = auth.uid());

-- Partners can view quote requests for their inventory
CREATE POLICY "Partners can view quote requests for their inventory"
    ON quote_requests FOR SELECT
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

-- Users can create their own quote requests
CREATE POLICY "Users can create their own quote requests"
    ON quote_requests FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

-- Partners can update quote requests for their inventory
CREATE POLICY "Partners can update quote requests for their inventory"
    ON quote_requests FOR UPDATE
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

-- =====================================================
-- CREATE RLS POLICIES FOR ORDER REQUESTS
-- =====================================================

-- Users can view their own order requests
CREATE POLICY "Users can view their own order requests"
    ON order_requests FOR SELECT
    TO authenticated
    USING (requester_id = auth.uid());

-- Partners can view order requests for their inventory
CREATE POLICY "Partners can view order requests for their inventory"
    ON order_requests FOR SELECT
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

-- Users can create their own order requests
CREATE POLICY "Users can create their own order requests"
    ON order_requests FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

-- Partners can update order requests for their inventory
CREATE POLICY "Partners can update order requests for their inventory"
    ON order_requests FOR UPDATE
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

-- =====================================================
-- CREATE HELPER VIEWS
-- =====================================================

CREATE OR REPLACE VIEW quote_requests_view AS
SELECT 
    qr.*,
    u.full_name as requester_name,
    u.email as requester_email,
    u.company as requester_company,
    p.name as partner_name,
    p.company as partner_company,
    p.avatar_url as partner_avatar,
    i.name as inventory_name,
    i.sku as inventory_sku,
    i.category as inventory_category,
    i.price as inventory_price,
    i.photo_urls as inventory_photos
FROM quote_requests qr
LEFT JOIN users u ON qr.requester_id = u.id
LEFT JOIN partners p ON qr.partner_id = p.id
LEFT JOIN inventory i ON qr.inventory_id = i.id;

CREATE OR REPLACE VIEW order_requests_view AS
SELECT 
    or.*,
    u.full_name as requester_name,
    u.email as requester_email,
    u.company as requester_company,
    p.name as partner_name,
    p.company as partner_company,
    p.avatar_url as partner_avatar,
    i.name as inventory_name,
    i.sku as inventory_sku,
    i.category as inventory_category,
    i.price as inventory_price,
    i.photo_urls as inventory_photos
FROM order_requests or
LEFT JOIN users u ON or.requester_id = u.id
LEFT JOIN partners p ON or.partner_id = p.id
LEFT JOIN inventory i ON or.inventory_id = i.id;

-- =====================================================
-- CREATE FUNCTION TO EXPIRE OLD QUOTE REQUESTS
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_quote_requests()
RETURNS void AS $$
BEGIN
    UPDATE quote_requests 
    SET status = 'expired'
    WHERE status = 'pending' 
    AND valid_until < NOW();
END;
$$ language 'plpgsql';

-- Create a scheduled job to expire old quote requests (this would need to be set up in your cron system)
-- SELECT cron.schedule('expire-quote-requests', '0 0 * * *', 'SELECT expire_old_quote_requests();');
