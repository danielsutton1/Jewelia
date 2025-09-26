-- Add file attachment fields to call_logs table
ALTER TABLE call_logs 
ADD COLUMN IF NOT EXISTS file_attachment TEXT,
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Create storage bucket for call log attachments if it doesn't exist
-- Note: This needs to be run in Supabase dashboard or via Supabase CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('call-log-attachments', 'call-log-attachments', true);

-- Add RLS policies for file attachments
CREATE POLICY "Users can view call log attachments" ON storage.objects
    FOR SELECT USING (bucket_id = 'call-log-attachments');

CREATE POLICY "Users can upload call log attachments" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'call-log-attachments');

CREATE POLICY "Users can update call log attachments" ON storage.objects
    FOR UPDATE USING (bucket_id = 'call-log-attachments');

CREATE POLICY "Users can delete call log attachments" ON storage.objects
    FOR DELETE USING (bucket_id = 'call-log-attachments'); 