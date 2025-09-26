-- Partner Relationships
CREATE TABLE IF NOT EXISTS partner_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_a UUID NOT NULL REFERENCES partners(id),
  partner_b UUID NOT NULL REFERENCES partners(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner Requests
CREATE TABLE IF NOT EXISTS partner_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_partner UUID NOT NULL REFERENCES partners(id),
  to_partner UUID NOT NULL REFERENCES partners(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partner_relationships_a ON partner_relationships(partner_a);
CREATE INDEX idx_partner_relationships_b ON partner_relationships(partner_b);
CREATE INDEX idx_partner_requests_from ON partner_requests(from_partner);
CREATE INDEX idx_partner_requests_to ON partner_requests(to_partner); 