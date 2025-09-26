#!/bin/bash

# 🚀 JEWELIA CRM Environment Setup Script
# This script helps you set up the environment variables for your Jewelia CRM

echo "🚀 Setting up Jewelia CRM Environment Variables..."

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# 🚀 JEWELIA CRM ENVIRONMENT CONFIGURATION

# =====================================================
# SUPABASE CONFIGURATION
# =====================================================

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://jplmmjcwwhjrltlevkoh.supabase.co

# Your Supabase anonymous key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbG1tamN3d2hqcmx0bGV2a29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTI1MDksImV4cCI6MjA2MzMyODUwOX0.PQTyBGcwNWCCnlDkjOUjKhfeys8kDLfYi_ohcw02vu0

# Your Supabase service role key (private - keep secret!)
# You'll need to get this from your Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# =====================================================
# OPTIONAL CONFIGURATION
# =====================================================

# NextAuth.js secret (generate a strong random string)
NEXTAUTH_SECRET=your_nextauth_secret_here

# Your production domain
NEXTAUTH_URL=http://localhost:3000

# JWT secret for custom tokens
JWT_SECRET=your_jwt_secret_here

# Encryption key for sensitive data
ENCRYPTION_KEY=your_encryption_key_here
EOF
    echo "✅ .env.local file created!"
else
    echo "⚠️  .env.local file already exists. Skipping creation."
fi

echo ""
echo "🔧 Next steps:"
echo "1. Get your Supabase service role key from your Supabase dashboard"
echo "2. Replace 'your_service_role_key_here' in .env.local with your actual service role key"
echo "3. Generate random strings for the other secrets if needed"
echo "4. Restart your development server"
echo ""
echo "📚 For more information, check the env.example file"
echo ""
echo "🎉 Environment setup complete!"
