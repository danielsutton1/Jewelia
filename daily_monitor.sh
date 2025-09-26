#!/bin/bash
# Daily Developer Monitoring Script
# Run this every day to check developer's progress

echo "🔍 DAILY DEVELOPER MONITORING - $(date)"
echo "=================================="

# Check what the developer committed today
echo "📊 COMMITS TODAY:"
git log --author="[developer-email]" --since="yesterday" --oneline

echo ""
echo "📁 FILES CHANGED TODAY:"
git log --author="[developer-email]" --since="yesterday" --name-only

echo ""
echo "🔍 DETAILED CHANGES:"
git log --author="[developer-email]" --since="yesterday" --stat

echo ""
echo "🌿 BRANCH STATUS:"
git branch -a | grep developer

echo ""
echo "⚠️  SECURITY CHECK:"
echo "Checking for sensitive file access..."
git log --author="[developer-email]" --since="yesterday" --name-only | grep -E "\.(env|config|secret)" || echo "✅ No sensitive files accessed"

echo ""
echo "📈 PROGRESS SUMMARY:"
echo "Total commits this week: $(git log --author="[developer-email]" --since="1 week ago" --oneline | wc -l)"
echo "Files modified this week: $(git log --author="[developer-email]" --since="1 week ago" --name-only | sort -u | wc -l)"
