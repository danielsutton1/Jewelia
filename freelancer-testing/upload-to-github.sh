#!/bin/bash

# GitHub Repository Upload Script
# This script will help you upload all files to your GitHub repository

echo "🚀 GitHub Repository Upload Script"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the freelancer-testing folder"
    echo "   Current directory: $(pwd)"
    echo "   Expected files: README.md, package.json, etc."
    exit 1
fi

echo "✅ Found freelancer-testing folder"
echo ""

# Initialize git repository
echo "📁 Initializing git repository..."
git init

# Add all files
echo "📄 Adding all files to git..."
git add .

# Commit files
echo "💾 Committing files..."
git commit -m "Initial setup: Add freelancer testing challenges"

echo ""
echo "🎉 Files are ready to upload!"
echo ""
echo "Next steps:"
echo "1. Go to your GitHub repository: https://github.com/danielsutton1/jewelry-crm-freelancer-testing"
echo "2. Click 'uploading an existing file'"
echo "3. Drag and drop all files from this folder"
echo "4. Commit message: 'Initial setup: Add freelancer testing challenges'"
echo "5. Click 'Commit changes'"
echo ""
echo "Or use the command line method below:"
echo ""
echo "Command line method:"
echo "git remote add origin https://github.com/danielsutton1/jewelry-crm-freelancer-testing.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "Files ready for upload:"
ls -la
