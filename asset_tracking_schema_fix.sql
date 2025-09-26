-- Asset Tracking Schema Fix Migration
-- This migration fixes the schema mismatches between the service layer and database

-- 1. Add missing columns to asset_assignments table
ALTER TABLE asset_assignments 
ADD COLUMN IF NOT EXISTS assigned_to_type VARCHAR(50) CHECK (assigned_to_type IN (
    'customer', 'staff', 'vendor', 'repair_shop', 'appraiser'
));

ALTER TABLE asset_assignments 
ADD COLUMN IF NOT EXISTS assigned_to_id UUID;

-- 2. Add missing columns to inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS current_assignment_id UUID REFERENCES asset_assignments(id) ON DELETE SET NULL;

-- 3. Add missing columns to asset_movements table
ALTER TABLE asset_movements 
ADD COLUMN IF NOT EXISTS from_assignment_id UUID REFERENCES asset_assignments(id) ON DELETE SET NULL;

ALTER TABLE asset_movements 
ADD COLUMN IF NOT EXISTS to_assignment_id UUID REFERENCES asset_assignments(id) ON DELETE SET NULL;

-- 4. Update existing data to populate new columns
-- Set assigned_to_type and assigned_to_id based on assignment_type and assigned_to
UPDATE asset_assignments 
SET 
    assigned_to_type = CASE 
        WHEN assignment_type = 'customer' THEN 'customer'
        WHEN assignment_type = 'staff' THEN 'staff'
        WHEN assignment_type = 'work_order' THEN 'staff'
        WHEN assignment_type = 'repair' THEN 'repair_shop'
        WHEN assignment_type = 'display' THEN 'staff'
        WHEN assignment_type = 'temporary' THEN 'staff'
        ELSE 'staff'
    END,
    assigned_to_id = assigned_to
WHERE assigned_to_type IS NULL;

-- 5. Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_asset_assignments_assigned_to_type ON asset_assignments(assigned_to_type);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_assigned_to_id ON asset_assignments(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_current_assignment ON inventory_items(current_assignment_id);
CREATE INDEX IF NOT EXISTS idx_asset_movements_from_assignment ON asset_movements(from_assignment_id);
CREATE INDEX IF NOT EXISTS idx_asset_movements_to_assignment ON asset_movements(to_assignment_id);

-- 6. Add computed column for overdue status
ALTER TABLE asset_assignments 
ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN GENERATED ALWAYS AS (
    CASE 
        WHEN status = 'active' AND expected_return_at IS NOT NULL AND expected_return_at < NOW() 
        THEN true 
        ELSE false 
    END
) STORED;

-- 7. Create function to update assignment status based on overdue
CREATE OR REPLACE FUNCTION update_assignment_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status to overdue if past expected return date
    IF NEW.status = 'active' AND NEW.expected_return_at IS NOT NULL AND NEW.expected_return_at < NOW() THEN
        NEW.status = 'overdue';
    END IF;
    
    -- Update status back to active if returned before expected date
    IF NEW.actual_return_at IS NOT NULL AND NEW.status = 'overdue' THEN
        NEW.status = 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically update overdue status
DROP TRIGGER IF EXISTS trigger_update_assignment_overdue ON asset_assignments;
CREATE TRIGGER trigger_update_assignment_overdue
    BEFORE INSERT OR UPDATE ON asset_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_assignment_overdue_status();

-- 9. Update RLS policies to include new columns
DROP POLICY IF EXISTS "Enable read access for all users" ON asset_assignments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON asset_assignments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON asset_assignments;

CREATE POLICY "Enable read access for all users" ON asset_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON asset_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON asset_assignments FOR UPDATE USING (true);

-- 10. Add sample data for testing (if tables are empty)
INSERT INTO asset_assignments (
    inventory_item_id, 
    assigned_to, 
    assigned_by, 
    assignment_type, 
    assigned_to_type,
    assigned_to_id,
    status, 
    expected_return_at, 
    notes
) 
SELECT 
    ii.id,
    '00000000-0000-0000-0000-000000000001', -- Sample user ID
    '00000000-0000-0000-0000-000000000001', -- Sample user ID
    'staff',
    'staff',
    '00000000-0000-0000-0000-000000000001', -- Sample user ID
    'active',
    NOW() + INTERVAL '7 days',
    'Sample assignment for testing'
FROM inventory_items ii
WHERE NOT EXISTS (SELECT 1 FROM asset_assignments WHERE inventory_item_id = ii.id)
LIMIT 2;

-- 11. Update inventory_items to link to assignments
UPDATE inventory_items 
SET current_assignment_id = (
    SELECT id FROM asset_assignments 
    WHERE inventory_item_id = inventory_items.id 
    AND status = 'active' 
    LIMIT 1
)
WHERE current_assignment_id IS NULL;

-- 12. Create view for assignment details with related data
CREATE OR REPLACE VIEW assignment_details AS
SELECT 
    aa.id,
    aa.inventory_item_id,
    aa.assigned_to,
    aa.assigned_by,
    aa.assignment_type,
    aa.assigned_to_type,
    aa.assigned_to_id,
    aa.status,
    aa.assigned_at,
    aa.expected_return_at,
    aa.actual_return_at,
    aa.notes,
    aa.is_overdue,
    aa.created_at,
    aa.updated_at,
    -- Inventory item details
    ii.sku as item_sku,
    ii.name as item_name,
    ii.current_value as item_value,
    ii.status as item_status,
    -- Location details
    al.name as current_location_name,
    al.location_type as current_location_type,
    -- Assigned to user details (if exists)
    u.full_name as assigned_to_name,
    u.email as assigned_to_email
FROM asset_assignments aa
LEFT JOIN inventory_items ii ON aa.inventory_item_id = ii.id
LEFT JOIN asset_locations al ON ii.current_location_id = al.id
LEFT JOIN users u ON aa.assigned_to = u.id;

-- 13. Create function to get assignment analytics
CREATE OR REPLACE FUNCTION get_assignment_analytics()
RETURNS TABLE (
    total_assignments BIGINT,
    active_assignments BIGINT,
    overdue_assignments BIGINT,
    completed_assignments BIGINT,
    total_value DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE status = 'active') as active_assignments,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue_assignments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_assignments,
        COALESCE(SUM(ii.current_value), 0) as total_value
    FROM asset_assignments aa
    LEFT JOIN inventory_items ii ON aa.inventory_item_id = ii.id
    WHERE aa.status IN ('active', 'overdue');
END;
$$ LANGUAGE plpgsql;

-- 14. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON asset_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON asset_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON asset_locations TO authenticated;
GRANT SELECT ON assignment_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_assignment_analytics() TO authenticated;

-- 15. Add comments for documentation
COMMENT ON TABLE asset_assignments IS 'Tracks asset assignments to users, customers, or other entities';
COMMENT ON COLUMN asset_assignments.assigned_to_type IS 'Type of entity assigned to (customer, staff, vendor, etc.)';
COMMENT ON COLUMN asset_assignments.assigned_to_id IS 'ID of the entity assigned to';
COMMENT ON COLUMN asset_assignments.is_overdue IS 'Computed column indicating if assignment is overdue';
COMMENT ON VIEW assignment_details IS 'Detailed view of assignments with related inventory and user information';
COMMENT ON FUNCTION get_assignment_analytics() IS 'Returns analytics data for asset assignments'; 