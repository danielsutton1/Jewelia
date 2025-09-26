# Fix Message Attachments Upload Issue

## Problem Description

When trying to send a message with attachments in the internal messaging system at `/dashboard/internal-messages`, users encounter the following error:

```
❌ Failed to upload Screenshot 2025-07-27 at 4.36.14 PM.png: 500
{"success":false,"error":"Failed to save file metadata: new row violates row-level security policy for table \"message_attachments\""}
```

## Root Cause

The issue is caused by a **Row Level Security (RLS) policy violation** when trying to insert into the `message_attachments` table. This happens because:

1. **Schema Mismatch**: The API endpoint was trying to insert fields that don't exist in the current table schema
2. **Missing RLS Policies**: The storage bucket and table policies weren't properly configured
3. **Authentication Issues**: The user's permission to insert attachments wasn't properly validated

## Solution Steps

### Step 1: Fix the API Endpoint

The API endpoint at `app/api/internal-messages/upload/route.ts` has been updated to:

- ✅ Use the correct table schema fields
- ✅ Properly validate user permissions
- ✅ Remove non-existent fields (`uploadedBy`, `metadata`)
- ✅ Clean up uploaded files if database insert fails

### Step 2: Set Up Storage Bucket and Policies

Run the following SQL script in your Supabase SQL Editor:

```sql
-- File: scripts/setup-message-attachments-storage.sql
-- This will create the storage bucket and proper policies
```

**Or manually in Supabase Dashboard:**

1. Go to **Storage** → **Create a new bucket**
2. Bucket name: `message-attachments`
3. Make it **private** (not public)
4. Set file size limit to 50MB
5. Add allowed MIME types for common file formats

### Step 3: Verify Storage Setup

Run the test script to verify everything is working:

```sql
-- File: scripts/test-storage-setup.sql
-- This will show the current status of your storage setup
```

### Step 4: Update Frontend Code

The frontend code has been updated to remove the `uploadedBy` field that was causing issues.

## Technical Details

### Current Table Schema

The `message_attachments` table has this structure:

```sql
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  mime_type TEXT,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### RLS Policies

The table has these RLS policies:

```sql
-- Users can view attachments for messages they can access
CREATE POLICY "Users can view attachments for messages they can access"
  ON message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE id = message_attachments.message_id 
      AND (auth.uid() = sender_id OR auth.uid() = recipient_id)
    )
  );

-- Users can insert attachments for their messages
CREATE POLICY "Users can insert attachments"
  ON message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE id = message_attachments.message_id 
      AND auth.uid() = sender_id
    )
  );
```

### Storage Policies

The storage bucket has these policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

-- Allow users to view attachments they have access to
CREATE POLICY "Users can view message attachments they have access to"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    -- Complex permission check based on message access
  );
```

## Testing the Fix

1. **Send a message without attachments** - should work normally
2. **Send a message with a small image file** - should upload successfully
3. **Check the database** - verify the attachment record was created
4. **Check storage** - verify the file exists in the storage bucket
5. **Refresh the page** - attachments should persist and be visible

## Troubleshooting

### If you still get RLS errors:

1. **Check user authentication**: Make sure the user is properly logged in
2. **Verify message ownership**: The user must be the sender of the message
3. **Check table permissions**: Ensure the user has access to the `message_attachments` table
4. **Verify storage policies**: Make sure the storage bucket policies are correct

### If files upload but don't display:

1. **Check file URLs**: Verify the `file_url` field in the database
2. **Check storage permissions**: Ensure the storage bucket allows viewing
3. **Verify MIME types**: Make sure the file type is supported

### If storage upload fails:

1. **Check bucket existence**: Verify the `message-attachments` bucket exists
2. **Check file size limits**: Ensure the file is under 50MB
3. **Check MIME type restrictions**: Verify the file type is allowed
4. **Check storage policies**: Ensure upload policies are configured

## File Locations

- **API Endpoint**: `app/api/internal-messages/upload/route.ts`
- **Frontend Component**: `app/dashboard/internal-messages/page.tsx`
- **Storage Setup Script**: `scripts/setup-message-attachments-storage.sql`
- **Test Script**: `scripts/test-storage-setup.sql`
- **Storage Configuration**: `supabase/storage.sql`

## Security Considerations

- ✅ Files are stored in a private bucket (not publicly accessible)
- ✅ RLS policies ensure users can only access their own attachments
- ✅ File size and type restrictions prevent abuse
- ✅ Authentication required for all operations
- ✅ Cleanup of orphaned files if database insert fails

## Performance Notes

- File uploads are processed sequentially to avoid overwhelming the server
- Maximum file size is 50MB per file
- Supported file types: images, PDFs, Word docs, Excel files, text files, ZIP archives
- Files are stored with unique names to prevent conflicts
- Database indexes exist for efficient querying of attachments
