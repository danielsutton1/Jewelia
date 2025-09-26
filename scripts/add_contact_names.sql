-- Add contact names to existing partners for better B2B partner display
-- This script adds realistic contact names to make the dropdown more searchable

UPDATE partners 
SET contact_name = 'Sarah Goldstein'
WHERE name = 'Gemstone Suppliers Inc.';

UPDATE partners 
SET contact_name = 'Michael Chen'
WHERE name = 'Precious Metals Co.';

UPDATE partners 
SET contact_name = 'Emma Rodriguez'
WHERE name = 'Jewelry Crafting Studio';

UPDATE partners 
SET contact_name = 'David Thompson'
WHERE name = 'Luxury Watch Partners';

-- Add some additional contact information
UPDATE partners 
SET contact_email = 'sarah.goldstein@gemstonesuppliers.com'
WHERE name = 'Gemstone Suppliers Inc.';

UPDATE partners 
SET contact_email = 'michael.chen@preciousmetals.com'
WHERE name = 'Precious Metals Co.';

UPDATE partners 
SET contact_email = 'emma.rodriguez@jewelrycrafting.com'
WHERE name = 'Jewelry Crafting Studio';

UPDATE partners 
SET contact_email = 'david.thompson@luxurywatch.com'
WHERE name = 'Luxury Watch Partners';
