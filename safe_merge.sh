#!/bin/bash
# Safe Merge Process for Developer Work
# Run this after approving a pull request

echo "🔄 SAFE MERGE PROCESS - $(date)"
echo "================================"

# Get the branch name from user
read -p "Enter developer branch name: " BRANCH_NAME

# Verify we're on the right branch
echo "🌿 Current branch: $(git branch --show-current)"
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Please switch to the correct branch first"
    exit 1
fi

# Create backup before merging
echo "💾 Creating backup..."
git tag "backup-before-merge-$(date +%Y%m%d-%H%M%S)"
git push origin --tags

# Test the changes
echo "🧪 Testing changes..."
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting merge."
    exit 1
fi

# Merge the changes
echo "🔀 Merging $BRANCH_NAME..."
git merge "origin/$BRANCH_NAME"

if [ $? -ne 0 ]; then
    echo "❌ Merge failed! Check for conflicts."
    exit 1
fi

# Push to repository
echo "📤 Pushing changes..."
git push origin sandbox-development

# Create post-merge backup
echo "💾 Creating post-merge backup..."
git tag "backup-after-merge-$(date +%Y%m%d-%H%M%S)"
git push origin --tags

echo "✅ Merge completed successfully!"
echo "📊 Summary:"
echo "  - Branch: $BRANCH_NAME"
echo "  - Merged to: sandbox-development"
echo "  - Backup created: backup-after-merge-$(date +%Y%m%d-%H%M%S)"
