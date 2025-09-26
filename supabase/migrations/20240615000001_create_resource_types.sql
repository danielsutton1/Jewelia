-- Resource Types Table
CREATE TABLE IF NOT EXISTS resource_types (
    id serial PRIMARY KEY,
    type text UNIQUE NOT NULL,
    description text
);

INSERT INTO resource_types (type, description) VALUES
  ('craftsperson', 'A person who crafts jewelry or other items'),
  ('equipment', 'A piece of equipment used in production'),
  ('workstation', 'A workstation or area in the workshop'),
  ('tool', 'A tool used by craftspeople'),
  ('other', 'Other resource type')
ON CONFLICT (type) DO NOTHING; 