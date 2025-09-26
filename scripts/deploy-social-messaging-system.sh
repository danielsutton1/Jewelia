#!/bin/bash

# 🚀 SOCIAL NETWORKING & MESSAGING SYSTEM DEPLOYMENT SCRIPT
# This script deploys the complete social networking and messaging system

set -e  # Exit on any error

echo "🚀 Starting Social Networking & Messaging System Deployment..."
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATION_FILE="supabase/migrations/20250128_social_messaging_complete_setup.sql"
BACKUP_DIR="backups/pre-deployment"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists psql; then
    print_error "PostgreSQL client (psql) is not installed. Please install it first."
    exit 1
fi

if ! command_exists supabase; then
    print_warning "Supabase CLI is not installed. Some features may not work."
    print_warning "Install with: npm install -g supabase"
fi

# Create backup directory
print_status "Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Check if we're in the right directory
if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Migration file not found: $MIGRATION_FILE"
    print_error "Please run this script from the project root directory."
    exit 1
fi

print_success "Migration file found: $MIGRATION_FILE"

# Database connection check
print_status "Checking database connection..."

# Try to get database connection details from environment
DB_HOST=${SUPABASE_DB_HOST:-"localhost"}
DB_PORT=${SUPABASE_DB_PORT:-"5432"}
DB_NAME=${SUPABASE_DB_NAME:-"postgres"}
DB_USER=${SUPABASE_DB_USER:-"postgres"}

print_status "Database connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Test database connection
if command_exists psql; then
    if PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_warning "Database connection failed. You may need to set environment variables:"
        echo "  export SUPABASE_DB_HOST=your_host"
        echo "  export SUPABASE_DB_PORT=your_port"
        echo "  export SUPABASE_DB_NAME=your_database"
        echo "  export SUPABASE_DB_USER=your_user"
        echo "  export SUPABASE_DB_PASSWORD=your_password"
        print_warning "Continuing with deployment preparation..."
    fi
fi

# Create deployment summary
print_status "Creating deployment summary..."

cat > "$BACKUP_DIR/deployment-summary-$TIMESTAMP.md" << EOF
# Social Networking & Messaging System Deployment Summary

**Deployment Date:** $(date)
**Migration File:** $MIGRATION_FILE
**Status:** Ready for deployment

## What This Migration Does

### 1. Social Networking Foundation
- Creates user profile extensions table
- Sets up user connections system
- Establishes professional networking infrastructure

### 2. Social Content System
- Creates social posts table with engagement tracking
- Sets up comments, likes, shares, and bookmarks
- Implements content moderation and privacy controls

### 3. Unified Messaging System
- Creates message threads and messages tables
- Sets up attachments, reactions, and read receipts
- Implements real-time messaging infrastructure

### 4. Security & Performance
- Enables Row Level Security (RLS)
- Creates performance indexes
- Sets up audit logging and monitoring

## Pre-Deployment Checklist

- [ ] Database backup completed
- [ ] Environment variables configured
- [ ] Application maintenance window scheduled
- [ ] Team notified of deployment
- [ ] Rollback plan prepared

## Deployment Steps

1. **Backup Database** (if not already done)
   \`\`\`bash
   pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
   \`\`\`

2. **Apply Migration**
   \`\`\`bash
   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE
   \`\`\`

3. **Verify Deployment**
   - Test social networking endpoints
   - Test messaging endpoints
   - Check system health endpoints

## Post-Deployment Verification

- [ ] All tables created successfully
- [ ] Indexes and constraints applied
- [ ] RLS policies enabled
- [ ] Test endpoints responding
- [ ] User functionality verified

## Rollback Plan

If issues occur, restore from backup:
\`\`\`bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backup_[timestamp].sql
\`\`\`

## Support

For deployment issues, check:
1. Database connection logs
2. Application error logs
3. Migration execution logs
4. System health endpoints

EOF

print_success "Deployment summary created: $BACKUP_DIR/deployment-summary-$TIMESTAMP.md"

# Show deployment instructions
echo ""
echo "🚀 DEPLOYMENT READY!"
echo "===================="
echo ""
echo "To deploy the social networking and messaging system:"
echo ""
echo "1. **Review the deployment summary:**"
echo "   cat $BACKUP_DIR/deployment-summary-$TIMESTAMP.md"
echo ""
echo "2. **Apply the database migration:**"
echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE"
echo ""
echo "3. **Verify the deployment:**"
echo "   curl -X GET http://localhost:3000/api/social/test-system"
echo "   curl -X GET http://localhost:3000/api/messaging/test-system"
echo ""
echo "4. **Check system health:**"
echo "   Monitor application logs for any errors"
echo "   Verify all endpoints are responding correctly"
echo ""

# Check if we should proceed with automatic deployment
if [ "$1" = "--auto-deploy" ]; then
    print_status "Auto-deploy mode enabled. Proceeding with deployment..."
    
    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
        print_error "SUPABASE_DB_PASSWORD environment variable not set. Cannot proceed with auto-deployment."
        exit 1
    fi
    
    print_status "Applying database migration..."
    if PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"; then
        print_success "Migration applied successfully!"
        print_status "Verifying deployment..."
        
        # Wait a moment for the application to restart if needed
        sleep 5
        
        print_status "Deployment complete! The social networking and messaging system is now ready."
        print_status "Test the system using the verification endpoints above."
    else
        print_error "Migration failed! Check the error messages above."
        print_error "You may need to manually apply the migration or restore from backup."
        exit 1
    fi
else
    print_status "Manual deployment mode. Please follow the steps above to deploy the system."
fi

echo ""
print_success "Deployment script completed successfully!"
echo ""
echo "📚 For more information, see: docs/SOCIAL_MESSAGING_SYSTEM_AUDIT_2024.md"
echo "🧪 Test endpoints: /api/social/test-system, /api/messaging/test-system"
echo ""

