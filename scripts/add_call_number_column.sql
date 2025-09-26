-- Add call_number column to call_logs table
ALTER TABLE call_logs 
ADD COLUMN IF NOT EXISTS call_number VARCHAR(13);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_call_logs_call_number ON call_logs(call_number);

-- Update existing records with sequential call numbers
DO $$
DECLARE
    call_record RECORD;
    year_val INTEGER;
    counter INTEGER := 1;
BEGIN
    year_val := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Update existing records with sequential call numbers
    FOR call_record IN 
        SELECT id, created_at 
        FROM call_logs 
        WHERE call_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        UPDATE call_logs 
        SET call_number = 'CL-' || year_val || '-' || LPAD(counter::TEXT, 4, '0')
        WHERE id = call_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$; 