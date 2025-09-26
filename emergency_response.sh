#!/bin/bash
# Emergency Response Script
# Run this if you suspect security violations

echo "🚨 EMERGENCY RESPONSE - $(date)"
echo "=============================="

# Get developer email
read -p "Enter developer email: " DEV_EMAIL

echo "🔍 INVESTIGATING DEVELOPER ACTIVITY..."
echo "Developer: $DEV_EMAIL"
echo "Date: $(date)"

# Check all their commits
echo ""
echo "📊 ALL COMMITS BY DEVELOPER:"
git log --author="$DEV_EMAIL" --all --oneline

echo ""
echo "📁 ALL FILES MODIFIED:"
git log --author="$DEV_EMAIL" --all --name-only

echo ""
echo "🔍 SENSITIVE FILE ACCESS CHECK:"
git log --author="$DEV_EMAIL" --all --name-only | grep -E "\.(env|config|secret|production)" || echo "✅ No sensitive files accessed"

echo ""
echo "⚠️  SECURITY VIOLATIONS FOUND:"
git log --author="$DEV_EMAIL" --all --name-only | grep -E "\.(env|config|secret|production)" && echo "❌ POTENTIAL SECURITY VIOLATION!" || echo "✅ No violations detected"

echo ""
echo "📋 RECOMMENDED ACTIONS:"
echo "1. Review the commits above"
echo "2. Check if any sensitive files were accessed"
echo "3. If violations found, remove developer access immediately"
echo "4. Change any passwords they might have seen"
echo "5. Review all their code contributions"
echo "6. Contact them to discuss the violation"
