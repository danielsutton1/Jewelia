#!/bin/bash

# Vercel Build Script for Jewelia CRM
# This script handles the build process with better error handling and retry logic

set -e

echo "🚀 Starting Vercel build process..."

# Set environment variables
export NODE_ENV=production
export NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
export NPM_CONFIG_FETCH_TIMEOUT=300000
export NPM_CONFIG_FETCH_RETRIES=5

# Function to retry commands
retry() {
    local -r -i max_attempts="$1"; shift
    local -r cmd="$@"
    local -i attempt_num=1

    until $cmd
    do
        if ((attempt_num==max_attempts))
        then
            echo "❌ Attempt $attempt_num failed and no more attempts left"
            return 1
        else
            echo "⚠️  Attempt $attempt_num failed! Trying again in 10 seconds..."
            ((attempt_num++))
            sleep 10
        fi
    done
}

# Clean up any existing node_modules
echo "🧹 Cleaning up existing node_modules..."
rm -rf node_modules
rm -rf .next

# Install dependencies with retry logic
echo "📦 Installing dependencies..."
retry 3 pnpm install --frozen-lockfile --prefer-offline --network-concurrency 1 --fetch-timeout 300000

# Verify critical packages are installed
echo "🔍 Verifying critical packages..."
if ! pnpm list react react-dom next; then
    echo "❌ Critical packages missing after installation"
    exit 1
fi

# Build the application
echo "🏗️  Building application..."
retry 2 pnpm build

# Verify build output
echo "✅ Build completed successfully!"
echo "📁 Build output directory: .next"

# List build artifacts
ls -la .next/

echo "🎉 Vercel build process completed successfully!"
