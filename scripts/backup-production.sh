#!/bin/bash

# 🚀 Production Backup Script for Jewelia CRM
# This script creates comprehensive backups of your production system

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/backups/jewelia-crm"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="jewelia-backup-$DATE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if required environment variables are set
check_env() {
    log "Checking environment variables..."
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    if [ -z "$SUPABASE_URL" ]; then
        error "SUPABASE_URL environment variable is not set"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        error "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
        exit 1
    fi
    
    success "Environment variables are properly configured"
}

# Create backup directory
create_backup_dir() {
    log "Creating backup directory..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        success "Created backup directory: $BACKUP_DIR"
    else
        log "Backup directory already exists: $BACKUP_DIR"
    fi
    
    # Create date-specific backup directory
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$BACKUP_PATH"
    success "Created backup path: $BACKUP_PATH"
}

# Database backup
backup_database() {
    log "Starting database backup..."
    
    DB_BACKUP_FILE="$BACKUP_PATH/database.sql"
    
    # Extract database connection details from DATABASE_URL
    if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Create .pgpass file for password
        echo "$DB_HOST:$DB_PORT:$DB_NAME:$DB_USER:$DB_PASS" > ~/.pgpass
        chmod 600 ~/.pgpass
        
        # Perform database backup
        PGPASSFILE=~/.pgpass pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            --verbose --clean --no-owner --no-privileges \
            --exclude-table='*_audit_log' \
            --exclude-table='*_temp' \
            --exclude-table='*_cache' \
            > "$DB_BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            success "Database backup completed: $DB_BACKUP_FILE"
            log "Database backup size: $(du -h "$DB_BACKUP_FILE" | cut -f1)"
        else
            error "Database backup failed"
            exit 1
        fi
        
        # Clean up .pgpass file
        rm -f ~/.pgpass
    else
        error "Invalid DATABASE_URL format"
        exit 1
    fi
}

# File storage backup (Supabase)
backup_storage() {
    log "Starting file storage backup..."
    
    STORAGE_BACKUP_DIR="$BACKUP_PATH/storage"
    mkdir -p "$STORAGE_BACKUP_DIR"
    
    # Use Supabase CLI to download storage files
    if command -v supabase &> /dev/null; then
        log "Using Supabase CLI for storage backup..."
        
        # Set Supabase environment
        export SUPABASE_URL="$SUPABASE_URL"
        export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
        
        # Download storage files
        supabase storage download --project-ref "$SUPABASE_URL" --local-path "$STORAGE_BACKUP_DIR" || {
            warning "Supabase CLI storage backup failed, continuing with other backups..."
        }
    else
        warning "Supabase CLI not found, skipping storage backup"
        log "Install Supabase CLI: npm install -g supabase"
    fi
    
    success "Storage backup completed: $STORAGE_BACKUP_DIR"
}

# Configuration backup
backup_config() {
    log "Starting configuration backup..."
    
    CONFIG_BACKUP_DIR="$BACKUP_PATH/config"
    mkdir -p "$CONFIG_BACKUP_DIR"
    
    # Backup environment files
    if [ -f ".env.production" ]; then
        cp .env.production "$CONFIG_BACKUP_DIR/"
        success "Backed up production environment file"
    fi
    
    if [ -f ".env.local" ]; then
        cp .env.local "$CONFIG_BACKUP_DIR/"
        success "Backed up local environment file"
    fi
    
    # Backup configuration files
    if [ -f "next.config.mjs" ]; then
        cp next.config.mjs "$CONFIG_BACKUP_DIR/"
    fi
    
    if [ -f "tsconfig.json" ]; then
        cp tsconfig.json "$CONFIG_BACKUP_DIR/"
    fi
    
    if [ -f "package.json" ]; then
        cp package.json "$CONFIG_BACKUP_DIR/"
    fi
    
    # Backup database schema
    log "Backing up database schema..."
    SCHEMA_FILE="$CONFIG_BACKUP_DIR/schema.sql"
    
    if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Create .pgpass file for password
        echo "$DB_HOST:$DB_PORT:$DB_NAME:$DB_USER:$DB_PASS" > ~/.pgpass
        chmod 600 ~/.pgpass
        
        # Export schema only (no data)
        PGPASSFILE=~/.pgpass pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            --schema-only --no-owner --no-privileges \
            > "$SCHEMA_FILE"
        
        # Clean up .pgpass file
        rm -f ~/.pgpass
        
        success "Database schema backup completed: $SCHEMA_FILE"
    fi
    
    success "Configuration backup completed: $CONFIG_BACKUP_DIR"
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    MANIFEST_FILE="$BACKUP_PATH/manifest.json"
    
    cat > "$MANIFEST_FILE" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0",
  "system": {
    "hostname": "$(hostname)",
    "os": "$(uname -s)",
    "architecture": "$(uname -m)"
  },
  "backup_contents": {
    "database": {
      "file": "database.sql",
      "size": "$(du -h "$BACKUP_PATH/database.sql" 2>/dev/null | cut -f1 || echo 'N/A')",
      "tables": "$(grep -c 'CREATE TABLE' "$BACKUP_PATH/database.sql" 2>/dev/null || echo 'N/A')"
    },
    "storage": {
      "directory": "storage/",
      "size": "$(du -sh "$BACKUP_PATH/storage" 2>/dev/null | cut -f1 || echo 'N/A')"
    },
    "configuration": {
      "directory": "config/",
      "files": "$(ls -1 "$BACKUP_PATH/config" 2>/dev/null | wc -l || echo '0')"
    }
  },
  "verification": {
    "database_backup": "$([ -f "$BACKUP_PATH/database.sql" ] && echo 'success' || echo 'failed')",
    "storage_backup": "$([ -d "$BACKUP_PATH/storage" ] && echo 'success' || echo 'failed')",
    "config_backup": "$([ -d "$BACKUP_PATH/config" ] && echo 'success' || echo 'failed')"
  }
}
EOF
    
    success "Backup manifest created: $MANIFEST_FILE"
}

# Compress backup
compress_backup() {
    log "Compressing backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    
    if [ $? -eq 0 ]; then
        success "Backup compressed: $BACKUP_NAME.tar.gz"
        log "Compressed backup size: $(du -h "$BACKUP_NAME.tar.gz" | cut -f1)"
        
        # Remove uncompressed directory
        rm -rf "$BACKUP_NAME"
        log "Removed uncompressed backup directory"
    else
        error "Backup compression failed"
        exit 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Keep backups for 30 days
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
    
    # Keep only the last 10 backups
    ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm
    
    success "Old backups cleaned up"
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
    
    if [ -f "$BACKUP_FILE" ]; then
        # Test tar file integrity
        if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
            success "Backup integrity verified: $BACKUP_FILE"
        else
            error "Backup integrity check failed"
            exit 1
        fi
        
        # Check file size
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log "Final backup size: $BACKUP_SIZE"
    else
        error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
}

# Main backup function
main() {
    log "🚀 Starting Jewelia CRM production backup..."
    log "Backup name: $BACKUP_NAME"
    log "Backup directory: $BACKUP_DIR"
    
    # Check environment
    check_env
    
    # Create backup directory
    create_backup_dir
    
    # Perform backups
    backup_database
    backup_storage
    backup_config
    
    # Create manifest
    create_manifest
    
    # Compress backup
    compress_backup
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Verify backup
    verify_backup
    
    success "🎉 Production backup completed successfully!"
    log "Backup location: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
    
    # Display backup summary
    echo
    echo "📊 BACKUP SUMMARY"
    echo "=================="
    echo "Backup Name: $BACKUP_NAME"
    echo "Location: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
    echo "Size: $(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)"
    echo "Timestamp: $(date)"
    echo "Status: ✅ SUCCESS"
    echo
}

# Run main function
main "$@" 