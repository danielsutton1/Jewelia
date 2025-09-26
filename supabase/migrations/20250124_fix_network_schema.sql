-- 🔧 NETWORKING SCHEMA FIXES MIGRATION
-- This migration fixes schema issues and ensures proper table structure
-- for the networking and messaging system

-- =====================================================
-- 1. FIX PARTNER RELATIONSHIPS TABLE
-- =====================================================

-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS partner_relationships CASCADE;

-- Recreate partner_relationships table with correct structure
CREATE TABLE partner_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Partner IDs (using consistent naming)
    partner_a UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    partner_b UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    
    -- Relationship details
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_partner_relationship UNIQUE(partner_a, partner_b),
    CONSTRAINT different_partners CHECK (partner_a != partner_b)
);

-- Create indexes for better performance
CREATE INDEX idx_partner_relationships_partner_a ON partner_relationships(partner_a);
CREATE INDEX idx_partner_relationships_partner_b ON partner_relationships(partner_b);
CREATE INDEX idx_partner_relationships_status ON partner_relationships(status);
CREATE INDEX idx_partner_relationships_created_at ON partner_relationships(created_at);

-- =====================================================
-- 2. ENHANCE PARTNERS TABLE
-- =====================================================

-- Add missing columns to partners table
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS connection_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS compatibility_score DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_partners_location ON partners(location);
CREATE INDEX IF NOT EXISTS idx_partners_industry ON partners(industry);
CREATE INDEX IF NOT EXISTS idx_partners_category ON partners(category);
CREATE INDEX IF NOT EXISTS idx_partners_specialties ON partners USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_partners_rating ON partners(rating);
CREATE INDEX IF NOT EXISTS idx_partners_is_online ON partners(is_online);
CREATE INDEX IF NOT EXISTS idx_partners_last_active_at ON partners(last_active_at);

-- =====================================================
-- 3. CREATE SYSTEM LOGS TABLE
-- =====================================================

-- Create system logs table for comprehensive logging
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Log classification
    level VARCHAR(20) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    category VARCHAR(50) NOT NULL,
    
    -- Log content
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    
    -- Context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(255) NOT NULL,
    stack_trace TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for system logs
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_request_id ON system_logs(request_id);

-- =====================================================
-- 4. CREATE NETWORK ANALYTICS VIEWS
-- =====================================================

-- Create view for connection statistics
CREATE OR REPLACE VIEW network_connection_stats AS
SELECT 
    p.id as partner_id,
    p.name,
    p.company,
    p.industry,
    p.location,
    COUNT(pr.id) as total_connections,
    COUNT(CASE WHEN pr.status = 'accepted' THEN 1 END) as accepted_connections,
    COUNT(CASE WHEN pr.status = 'pending' THEN 1 END) as pending_connections,
    COUNT(CASE WHEN pr.status = 'rejected' THEN 1 END) as rejected_connections,
    p.rating,
    p.review_count,
    p.is_online,
    p.last_active_at
FROM partners p
LEFT JOIN partner_relationships pr ON (p.id = pr.partner_a OR p.id = pr.partner_b)
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.company, p.industry, p.location, p.rating, p.review_count, p.is_online, p.last_active_at;

-- Create view for mutual connections
CREATE OR REPLACE VIEW mutual_connections AS
SELECT 
    pr1.partner_a as user_id,
    pr2.partner_a as mutual_partner_id,
    COUNT(*) as mutual_connection_count
FROM partner_relationships pr1
JOIN partner_relationships pr2 ON (
    (pr1.partner_b = pr2.partner_a OR pr1.partner_b = pr2.partner_b) AND
    pr1.partner_a != pr2.partner_a AND pr1.partner_a != pr2.partner_b
)
WHERE pr1.status = 'accepted' AND pr2.status = 'accepted'
GROUP BY pr1.partner_a, pr2.partner_a;

-- =====================================================
-- 5. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_partner_relationships_updated_at 
    BEFORE UPDATE ON partner_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update connection count
CREATE OR REPLACE FUNCTION update_connection_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update partner_a connection count
    UPDATE partners 
    SET connection_count = (
        SELECT COUNT(*) 
        FROM partner_relationships 
        WHERE (partner_a = NEW.partner_a OR partner_b = NEW.partner_a) 
        AND status = 'accepted'
    )
    WHERE id = NEW.partner_a;
    
    -- Update partner_b connection count
    UPDATE partners 
    SET connection_count = (
        SELECT COUNT(*) 
        FROM partner_relationships 
        WHERE (partner_a = NEW.partner_b OR partner_b = NEW.partner_b) 
        AND status = 'accepted'
    )
    WHERE id = NEW.partner_b;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for connection count updates
CREATE TRIGGER update_connection_count_insert
    AFTER INSERT ON partner_relationships
    FOR EACH ROW EXECUTE FUNCTION update_connection_count();

CREATE TRIGGER update_connection_count_update
    AFTER UPDATE ON partner_relationships
    FOR EACH ROW EXECUTE FUNCTION update_connection_count();

CREATE TRIGGER update_connection_count_delete
    AFTER DELETE ON partner_relationships
    FOR EACH ROW EXECUTE FUNCTION update_connection_count();

-- =====================================================
-- 6. INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample partners if table is empty
INSERT INTO partners (name, company, email, phone, type, status, rating, location, industry, category, specialties)
SELECT 
    'Diamond Experts Inc',
    'Diamond Experts Inc',
    'info@diamondexperts.com',
    '+1-555-0101',
    'supplier',
    'active',
    4.8,
    'New York, NY',
    'Jewelry',
    'Diamond Specialists',
    ARRAY['Diamond Grading', 'Certification', 'Appraisal']
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Diamond Experts Inc');

INSERT INTO partners (name, company, email, phone, type, status, rating, location, industry, category, specialties)
SELECT 
    'Gemstone Masters',
    'Gemstone Masters LLC',
    'contact@gemstonemasters.com',
    '+1-555-0102',
    'supplier',
    'active',
    4.6,
    'Los Angeles, CA',
    'Jewelry',
    'Gemstone Specialists',
    ARRAY['Colored Stones', 'Pearls', 'Emeralds']
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Gemstone Masters');

INSERT INTO partners (name, company, email, phone, type, status, rating, location, industry, category, specialties)
SELECT 
    'Jewelry Design Studio',
    'Jewelry Design Studio',
    'hello@jewelrydesignstudio.com',
    '+1-555-0103',
    'service_provider',
    'active',
    4.9,
    'Miami, FL',
    'Jewelry',
    'Design Services',
    ARRAY['Custom Design', 'CAD Modeling', '3D Printing']
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Jewelry Design Studio');

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE partner_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Partner relationships policies
CREATE POLICY "Users can view their own connections" ON partner_relationships
    FOR SELECT USING (
        auth.uid()::text = partner_a::text OR 
        auth.uid()::text = partner_b::text
    );

CREATE POLICY "Users can create connection requests" ON partner_relationships
    FOR INSERT WITH CHECK (
        auth.uid()::text = partner_a::text
    );

CREATE POLICY "Users can update their own connections" ON partner_relationships
    FOR UPDATE USING (
        auth.uid()::text = partner_a::text OR 
        auth.uid()::text = partner_b::text
    );

CREATE POLICY "Users can delete their own connections" ON partner_relationships
    FOR DELETE USING (
        auth.uid()::text = partner_a::text OR 
        auth.uid()::text = partner_b::text
    );

-- System logs policies (admin only)
CREATE POLICY "Only admins can view system logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- 8. CREATE FUNCTIONS FOR NETWORK OPERATIONS
-- =====================================================

-- Function to get partner recommendations
CREATE OR REPLACE FUNCTION get_partner_recommendations(
    user_id UUID,
    min_compatibility DECIMAL DEFAULT 0.7,
    location_filter TEXT DEFAULT NULL,
    industry_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    partner_id UUID,
    name TEXT,
    company TEXT,
    location TEXT,
    industry TEXT,
    rating DECIMAL,
    compatibility_score DECIMAL,
    mutual_connections INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.company,
        p.location,
        p.industry,
        p.rating,
        COALESCE(p.compatibility_score, 0.5) as compatibility_score,
        COALESCE(mc.mutual_connection_count, 0) as mutual_connections
    FROM partners p
    LEFT JOIN mutual_connections mc ON p.id = mc.mutual_partner_id
    WHERE p.id != user_id
    AND p.status = 'active'
    AND COALESCE(p.compatibility_score, 0.5) >= min_compatibility
    AND (location_filter IS NULL OR p.location ILIKE '%' || location_filter || '%')
    AND (industry_filter IS NULL OR p.industry = industry_filter)
    AND NOT EXISTS (
        SELECT 1 FROM partner_relationships pr
        WHERE (pr.partner_a = user_id AND pr.partner_b = p.id) OR
              (pr.partner_a = p.id AND pr.partner_b = user_id)
    )
    ORDER BY p.compatibility_score DESC, p.rating DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get network analytics
CREATE OR REPLACE FUNCTION get_network_analytics(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalConnections', (
            SELECT COUNT(*) FROM partner_relationships 
            WHERE (partner_a = user_id OR partner_b = user_id)
        ),
        'acceptedConnections', (
            SELECT COUNT(*) FROM partner_relationships 
            WHERE (partner_a = user_id OR partner_b = user_id) AND status = 'accepted'
        ),
        'pendingRequests', (
            SELECT COUNT(*) FROM partner_relationships 
            WHERE (partner_a = user_id OR partner_b = user_id) AND status = 'pending'
        ),
        'mutualConnections', (
            SELECT COUNT(*) FROM mutual_connections WHERE user_id = user_id
        ),
        'topIndustries', (
            SELECT json_agg(json_build_object(
                'industry', p.industry,
                'count', COUNT(*),
                'percentage', ROUND(COUNT(*) * 100.0 / (
                    SELECT COUNT(*) FROM partner_relationships 
                    WHERE (partner_a = user_id OR partner_b = user_id) AND status = 'accepted'
                ), 2)
            ))
            FROM partner_relationships pr
            JOIN partners p ON (p.id = pr.partner_a OR p.id = pr.partner_b)
            WHERE (pr.partner_a = user_id OR pr.partner_b = user_id) 
            AND pr.status = 'accepted'
            AND p.id != user_id
            GROUP BY p.industry
            ORDER BY COUNT(*) DESC
            LIMIT 5
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log the migration completion
INSERT INTO system_logs (level, category, message, details, source, timestamp)
VALUES (
    'info',
    'system',
    'Network schema fixes migration completed',
    '{"migration": "20250124_fix_network_schema", "tables_created": ["partner_relationships", "system_logs"], "views_created": ["network_connection_stats", "mutual_connections"], "functions_created": ["get_partner_recommendations", "get_network_analytics"]}',
    'Migration',
    NOW()
);
