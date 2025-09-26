-- Add resource_type_id to resources and migrate data
ALTER TABLE resources ADD COLUMN IF NOT EXISTS resource_type_id integer REFERENCES resource_types(id);

-- Optionally, migrate existing type data to resource_type_id
UPDATE resources r
SET resource_type_id = rt.id
FROM resource_types rt
WHERE r.type = rt.type;

-- Optionally, set type column to nullable or remove it after migration
-- ALTER TABLE resources ALTER COLUMN type DROP NOT NULL; 