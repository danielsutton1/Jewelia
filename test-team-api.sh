#!/bin/bash

# 🧪 TEAM MANAGEMENT API TEST SCRIPT
# This script tests the team management API endpoints

echo "🧪 Testing Team Management API..."
echo "=================================="

# Test 1: Test endpoint (no auth required)
echo ""
echo "1️⃣ Testing basic endpoint..."
curl -s "http://localhost:3000/api/team-management/test" | jq '.'

# Test 2: Create team (requires auth)
echo ""
echo "2️⃣ Testing team creation..."
echo "⚠️  You need to replace YOUR_JWT_TOKEN with a real token from Supabase"
echo "   Go to: Supabase Dashboard > Authentication > Users > Copy JWT"

# Test with real JWT token
curl -X POST "http://localhost:3000/api/team-management?action=create-team" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjVzUGozdHE5TFN3dWZNazciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2pwbG1tamN3d2hqcmx0bGV2a29oLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5NjQ4ZWMyZi03YjZjLTRmNTctOWZjNC04ZDRjOTIzMDI5NjQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU1MTc4NjM2LCJpYXQiOjE3NTUxNzUwMzYsImVtYWlsIjoiZGFuaWVsc3V0dG9uMUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc1NTE3NTAzNn1dLCJzZXNzaW9uX2lkIjoiZGE2NTBjODUtZjdhMy00ZDVlLThkYmQtYTI5NTAxNTc0NWUyIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.l4Gb5HuX2kyZ5zFXzKl5ws-7EK9HGiGhtVf-6uYmEaU" \
  -d '{
    "name": "Production Team",
    "description": "Jewelry production and quality control",
    "slug": "production-team",
    "is_public": false,
    "allow_self_join": false,
    "require_approval": true,
    "max_members": 15,
    "industry": "Jewelry Manufacturing",
    "location": "New York",
    "tags": ["production", "quality", "manufacturing"]
  }' | jq '.'

echo ""
echo "✅ Test script completed!"
echo "📝 Next steps:"
echo "   1. Get a JWT token from Supabase Dashboard"
echo "   2. Replace YOUR_JWT_TOKEN in the script"
echo "   3. Run the script again"
