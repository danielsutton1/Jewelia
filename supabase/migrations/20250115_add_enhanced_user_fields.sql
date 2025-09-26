-- Migration: Add Enhanced User Profile Fields
-- Date: 2025-01-15
-- Description: Add professional and social profile fields to users table

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS company VARCHAR(255),
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN users.bio IS 'User biography or description';
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile picture';
COMMENT ON COLUMN users.cover_image_url IS 'URL to user cover/banner image';
COMMENT ON COLUMN users.location IS 'User location (city, state, country)';
COMMENT ON COLUMN users.website IS 'User personal or business website';
COMMENT ON COLUMN users.company IS 'Company or organization name';
COMMENT ON COLUMN users.job_title IS 'Job title or position';
COMMENT ON COLUMN users.phone IS 'Contact phone number';
COMMENT ON COLUMN users.experience_years IS 'Years of professional experience';
COMMENT ON COLUMN users.is_verified IS 'Whether user account is verified';
COMMENT ON COLUMN users.social_links IS 'JSON object containing social media links';
COMMENT ON COLUMN users.specialties IS 'Array of user specialties or skills';
COMMENT ON COLUMN users.certifications IS 'Array of professional certifications';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_job_title ON users(job_title);
CREATE INDEX IF NOT EXISTS idx_users_experience_years ON users(experience_years);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_specialties ON users USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_users_certifications ON users USING GIN(certifications);

-- Update existing users with some sample data (optional)
UPDATE users 
SET 
  bio = 'Professional jewelry industry expert with years of experience in design and sales.',
  location = 'San Francisco, CA',
  company = 'Jewelia CRM',
  job_title = 'Senior Developer',
  experience_years = 5,
  specialties = ARRAY['Jewelry Design', 'CRM Systems', 'Web Development'],
  certifications = ARRAY['Certified Jewelry Professional', 'Full Stack Developer'],
  is_verified = TRUE
WHERE email = 'test@jewelia.com';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

