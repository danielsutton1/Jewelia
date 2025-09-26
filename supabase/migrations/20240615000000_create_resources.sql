-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL, -- e.g., 'craftsperson', 'equipment', 'workstation', etc.
    status text NOT NULL DEFAULT 'active',
    description text,
    capacity integer,
    current_load integer,
    location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_location ON resources(location_id); 