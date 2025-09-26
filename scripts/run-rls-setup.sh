#!/bin/bash

echo "🔐 Setting up RLS policies for message_attachments table..."
echo "This will fix the 'new row violates row-level security policy' error"
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/setup-message-attachments-rls.sql" ]; then
    echo "❌ Error: setup-message-attachments-rls.sql not found!"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "📋 Running RLS setup script..."
echo ""

# Run the SQL script
psql "$DATABASE_URL" -f scripts/setup-message-attachments-rls.sql

echo ""
echo "✅ RLS setup complete!"
echo ""
echo "🧪 Now try uploading a file again in your application"
echo "The RLS policy violation error should be resolved"
