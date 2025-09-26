-- Create production_projects table
CREATE TABLE production_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  "end" TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT CHECK (status IN ('on-track', 'at-risk', 'delayed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_stages table
CREATE TABLE production_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES production_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (name IN ('Design', 'CAD', 'Casting', 'Setting', 'Polishing', 'QC', 'Delivery')),
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  "end" TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('completed', 'in-progress', 'pending', 'delayed', 'blocked')),
  partner TEXT NOT NULL,
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO production_projects (id, title, start, "end", priority, status) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'Diamond Ring', '2024-06-01', '2024-06-20', 'high', 'on-track'),
  ('223e4567-e89b-12d3-a456-426614174000', 'Gold Necklace', '2024-06-05', '2024-06-25', 'medium', 'at-risk'),
  ('323e4567-e89b-12d3-a456-426614174000', 'Custom Wedding Set', '2024-06-17', '2024-06-28', 'high', 'on-track'),
  ('423e4567-e89b-12d3-a456-426614174000', 'Pearl Anniversary Necklace', '2024-06-18', '2024-06-25', 'medium', 'delayed');

INSERT INTO production_stages (project_id, name, start, "end", status, partner, progress) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'Design', '2024-06-01', '2024-06-03', 'completed', 'Alice', 100),
  ('123e4567-e89b-12d3-a456-426614174000', 'CAD', '2024-06-04', '2024-06-06', 'in-progress', 'Bob', 60),
  ('123e4567-e89b-12d3-a456-426614174000', 'Casting', '2024-06-07', '2024-06-10', 'pending', 'Charlie', 0),
  
  ('223e4567-e89b-12d3-a456-426614174000', 'Design', '2024-06-05', '2024-06-07', 'completed', 'Alice', 100),
  ('223e4567-e89b-12d3-a456-426614174000', 'CAD', '2024-06-08', '2024-06-10', 'delayed', 'Bob', 30),
  ('223e4567-e89b-12d3-a456-426614174000', 'Casting', '2024-06-11', '2024-06-15', 'pending', 'Charlie', 0),
  
  ('323e4567-e89b-12d3-a456-426614174000', 'Design', '2024-06-17', '2024-06-19', 'completed', 'Alice', 100),
  ('323e4567-e89b-12d3-a456-426614174000', 'CAD', '2024-06-20', '2024-06-22', 'in-progress', 'David', 40),
  ('323e4567-e89b-12d3-a456-426614174000', 'Casting', '2024-06-23', '2024-06-25', 'pending', 'Charlie', 0),
  ('323e4567-e89b-12d3-a456-426614174000', 'Setting', '2024-06-26', '2024-06-27', 'pending', 'Bob', 0),
  ('323e4567-e89b-12d3-a456-426614174000', 'Polishing', '2024-06-28', '2024-06-28', 'pending', 'Alice', 0),
  
  ('423e4567-e89b-12d3-a456-426614174000', 'Design', '2024-06-18', '2024-06-20', 'in-progress', 'David', 50),
  ('423e4567-e89b-12d3-a456-426614174000', 'Setting', '2024-06-21', '2024-06-22', 'pending', 'Bob', 0),
  ('423e4567-e89b-12d3-a456-426614174000', 'Polishing', '2024-06-23', '2024-06-25', 'pending', 'Alice', 0); 