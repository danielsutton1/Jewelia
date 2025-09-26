#!/bin/bash
echo "🔍 CHECKING DEVELOPER WORK - $(date)"
echo "=================================="

# Check what they worked on today
echo "📊 TODAY'S COMMITS:"
git log --author="[developer-email]" --since="yesterday" --oneline

echo ""
echo "📁 FILES THEY CHANGED:"
git log --author="[developer-email]" --since="yesterday" --name-only

echo ""
echo "🔍 DETAILED CHANGES:"
git log --author="[developer-email]" --since="yesterday" --stat

echo ""
echo "⚠️  SECURITY CHECK:"
echo "Checking if they stayed in their assigned area..."
git log --author="[developer-email]" --since="yesterday" --name-only | grep -E "(customers|sales|orders|inventory)" || echo "❌ They worked outside their assigned area!"

echo ""
echo "✅ SAFE AREAS CHECK:"
git log --author="[developer-email]" --since="yesterday" --name-only | grep -E "(customers)" && echo "✅ Working in customers section" || echo "❌ Not working in assigned area"
