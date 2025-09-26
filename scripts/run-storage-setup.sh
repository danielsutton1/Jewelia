#!/bin/bash

# Script to set up message attachments storage in Supabase
# This script will help you run the necessary SQL commands

echo "🔧 Setting up message attachments storage for Jewelia CRM..."
echo ""

echo "📋 Instructions:"
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Run the following scripts in order:"
echo ""

echo "📁 Step 1: Check the current table structure"
echo "   File: scripts/check-table-structure.sql"
echo "   This will show you what columns actually exist in message_attachments"
echo ""

echo "📁 Step 2: Run the simplified storage setup script"
echo "   File: scripts/setup-message-attachments-storage-simple.sql"
echo "   This will create the storage bucket and simple policies"
echo ""

echo "📁 Step 3: Verify the setup"
echo "   File: scripts/test-storage-setup.sql"
echo "   This will show you the current status"
echo ""

echo "🔍 Step 4: Check the results"
echo "   Look for ✅ marks indicating success"
echo "   Look for ❌ marks indicating issues that need fixing"
echo ""

echo "📝 Alternative manual setup:"
echo "1. Go to Storage in Supabase Dashboard"
echo "2. Create a new bucket called 'message-attachments'"
echo "3. Make it private (not public)"
echo "4. Set file size limit to 50MB"
echo "5. Add allowed MIME types for common file formats"
echo ""

echo "🚀 After setup, test by:"
echo "1. Going to /dashboard/internal-messages"
echo "2. Starting a conversation"
echo "3. Attaching a file and sending a message"
echo "4. Refreshing the page to verify persistence"
echo ""

echo "❓ If you encounter issues:"
echo "1. Check the console logs for detailed error messages"
echo "2. Verify the storage bucket exists and has correct policies"
echo "3. Ensure the user is authenticated and has proper permissions"
echo "4. Check the database RLS policies are enabled"
echo "5. Run the check-table-structure.sql script first to see actual schema"
echo ""

echo "🔧 Important Notes:"
echo "- The simplified setup uses basic storage policies for reliability"
echo "- Access control is handled at the application level, not storage level"
echo "- This approach avoids complex SQL joins that might fail"
echo ""

echo "📚 For more details, see: docs/FIX_MESSAGE_ATTACHMENTS_UPLOAD.md"
echo ""

echo "✅ Setup instructions complete!"
