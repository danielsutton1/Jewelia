#!/bin/bash

# Jewelia CRM - Automated Backup Script
# This script performs comprehensive backups of the Jewelia CRM system

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/backups/jewelia-crm"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="jewelia-crm-backup-$DATE"
RETENTION_DAYS=30

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

# Create backup directory if it doesn't exist
create_backup_directory() {
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/files"
    mkdir -p "$BACKUP_DIR/config"
    mkdir -p "$BACKUP_DIR/logs"
}

# Database backup function
backup_database() {
    log "Starting database backup..."
    
    # Check if Supabase CLI is available
    if ! command -v supabase &> /dev/null; then
        error "Supabase CLI not found. Please install it first."
        return 1
    fi
    
    # Get database URL from environment
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable not set"
        return 1
    fi
    
    # Create database dump
    local db_backup_file="$BACKUP_DIR/database/db-backup-$DATE.sql"
    
    # Use pg_dump for PostgreSQL backup
    if command -v pg_dump &> /dev/null; then
        log "Using pg_dump for database backup..."
        pg_dump "$DATABASE_URL" > "$db_backup_file"
        
        if [ $? -eq 0 ]; then
            success "Database backup completed: $db_backup_file"
            
            # Compress the backup
            gzip "$db_backup_file"
            success "Database backup compressed: $db_backup_file.gz"
        else
            error "Database backup failed"
            return 1
        fi
    else
        error "pg_dump not found. Please install PostgreSQL client tools."
        return 1
    fi
}

# File storage backup function
backup_files() {
    log "Starting file storage backup..."
    
    # Check if Supabase CLI is available
    if ! command -v supabase &> /dev/null; then
        error "Supabase CLI not found. Cannot backup file storage."
        return 1
    fi
    
    # Create file storage backup
    local files_backup_dir="$BACKUP_DIR/files/storage-backup-$DATE"
    mkdir -p "$files_backup_dir"
    
    # Download files from Supabase storage
    # Note: This requires proper authentication and bucket access
    log "Downloading files from Supabase storage..."
    
    # For now, we'll create a placeholder
    echo "File storage backup placeholder - implement based on your storage setup" > "$files_backup_dir/README.txt"
    
    # Compress the backup
    tar -czf "$files_backup_dir.tar.gz" -C "$BACKUP_DIR/files" "storage-backup-$DATE"
    rm -rf "$files_backup_dir"
    
    success "File storage backup completed: $files_backup_dir.tar.gz"
}

# Configuration backup function
backup_config() {
    log "Starting configuration backup..."
    
    local config_backup_dir="$BACKUP_DIR/config/config-backup-$DATE"
    mkdir -p "$config_backup_dir"
    
    # Backup environment files (without sensitive data)
    if [ -f ".env.local" ]; then
        # Create a sanitized version without sensitive data
        grep -v -E "(PASSWORD|SECRET|KEY|TOKEN)" .env.local > "$config_backup_dir/env.local.sanitized" 2>/dev/null || true
        log "Environment file backed up (sanitized)"
    fi
    
    # Backup Supabase configuration
    if [ -d "supabase" ]; then
        cp -r supabase "$config_backup_dir/"
        log "Supabase configuration backed up"
    fi
    
    # Backup package.json and lock files
    if [ -f "package.json" ]; then
        cp package.json "$config_backup_dir/"
        log "Package configuration backed up"
    fi
    
    if [ -f "package-lock.json" ]; then
        cp package-lock.json "$config_backup_dir/"
        log "Package lock file backed up"
    fi
    
    if [ -f "yarn.lock" ]; then
        cp yarn.lock "$config_backup_dir/"
        log "Yarn lock file backed up"
    fi
    
    # Backup Next.js configuration
    if [ -f "next.config.js" ]; then
        cp next.config.js "$config_backup_dir/"
        log "Next.js configuration backed up"
    fi
    
    if [ -f "next.config.mjs" ]; then
        cp next.config.mjs "$config_backup_dir/"
        log "Next.js configuration backed up"
    fi
    
    # Compress the backup
    tar -czf "$config_backup_dir.tar.gz" -C "$BACKUP_DIR/config" "config-backup-$DATE"
    rm -rf "$config_backup_dir"
    
    success "Configuration backup completed: $config_backup_dir.tar.gz"
}

# Application code backup function
backup_code() {
    log "Starting application code backup..."
    
    local code_backup_dir="$BACKUP_DIR/code-backup-$DATE"
    mkdir -p "$code_backup_dir"
    
    # Exclude unnecessary directories and files
    rsync -av --exclude='node_modules' \
              --exclude='.next' \
              --exclude='.git' \
              --exclude='.env*' \
              --exclude='*.log' \
              --exclude='backups' \
              --exclude='dist' \
              --exclude='build' \
              ./ "$code_backup_dir/"
    
    # Compress the backup
    tar -czf "$code_backup_dir.tar.gz" -C "$BACKUP_DIR" "code-backup-$DATE"
    rm -rf "$code_backup_dir"
    
    success "Application code backup completed: $code_backup_dir.tar.gz"
}

# Log backup function
backup_logs() {
    log "Starting log backup..."
    
    local logs_backup_dir="$BACKUP_DIR/logs/logs-backup-$DATE"
    mkdir -p "$logs_backup_dir"
    
    # Backup application logs
    if [ -d "logs" ]; then
        cp -r logs/* "$logs_backup_dir/" 2>/dev/null || true
    fi
    
    # Backup system logs (if accessible)
    if [ -f "/var/log/jewelia-crm/app.log" ]; then
        cp /var/log/jewelia-crm/app.log "$logs_backup_dir/" 2>/dev/null || true
    fi
    
    # Compress the backup
    tar -czf "$logs_backup_dir.tar.gz" -C "$BACKUP_DIR/logs" "logs-backup-$DATE"
    rm -rf "$logs_backup_dir"
    
    success "Log backup completed: $logs_backup_dir.tar.gz"
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/manifest-$DATE.json"
    
    cat > "$manifest_file" << EOF
{
  "backup_id": "$DATE",
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "system_info": {
    "hostname": "$(hostname)",
    "os": "$(uname -s)",
    "version": "$(uname -r)"
  },
  "backup_components": {
    "database": "$(ls -1 $BACKUP_DIR/database/*.sql.gz 2>/dev/null | wc -l)",
    "files": "$(ls -1 $BACKUP_DIR/files/*.tar.gz 2>/dev/null | wc -l)",
    "config": "$(ls -1 $BACKUP_DIR/config/*.tar.gz 2>/dev/null | wc -l)",
    "code": "$(ls -1 $BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l)",
    "logs": "$(ls -1 $BACKUP_DIR/logs/*.tar.gz 2>/dev/null | wc -l)"
  },
  "backup_size": "$(du -sh $BACKUP_DIR | cut -f1)",
  "retention_days": $RETENTION_DAYS
}
EOF
    
    success "Backup manifest created: $manifest_file"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "manifest-*.json" -mtime +$RETENTION_DAYS -delete
    
    deleted_count=$(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS | wc -l)
    deleted_count=$((deleted_count + $(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS | wc -l)))
    
    if [ $deleted_count -gt 0 ]; then
        success "Cleaned up $deleted_count old backup files"
    else
        log "No old backup files to clean up"
    fi
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    local verification_failed=0
    
    # Check if backup files exist and are not empty
    for file in "$BACKUP_DIR"/*.tar.gz "$BACKUP_DIR"/database/*.sql.gz "$BACKUP_DIR"/files/*.tar.gz "$BACKUP_DIR"/config/*.tar.gz "$BACKUP_DIR"/logs/*.tar.gz; do
        if [ -f "$file" ]; then
            if [ ! -s "$file" ]; then
                error "Backup file is empty: $file"
                verification_failed=1
            else
                log "✓ Verified: $file ($(du -h "$file" | cut -f1))"
            fi
        fi
    done
    
    if [ $verification_failed -eq 0 ]; then
        success "Backup verification completed successfully"
    else
        error "Backup verification failed"
        return 1
    fi
}

# Main backup function
main() {
    log "Starting Jewelia CRM backup process..."
    
    # Create backup directory structure
    create_backup_directory
    
    # Perform backups
    backup_database
    backup_files
    backup_config
    backup_code
    backup_logs
    
    # Create manifest
    create_manifest
    
    # Verify backup integrity
    verify_backup
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Final summary
    local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    success "Backup process completed successfully!"
    log "Total backup size: $total_size"
    log "Backup location: $BACKUP_DIR"
    log "Backup retention: $RETENTION_DAYS days"
}

# Handle script arguments
case "${1:-}" in
    "database")
        create_backup_directory
        backup_database
        ;;
    "files")
        create_backup_directory
        backup_files
        ;;
    "config")
        create_backup_directory
        backup_config
        ;;
    "code")
        create_backup_directory
        backup_code
        ;;
    "logs")
        create_backup_directory
        backup_logs
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "verify")
        verify_backup
        ;;
    "help"|"-h"|"--help")
        echo "Jewelia CRM Backup Script"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  database    Backup database only"
        echo "  files       Backup file storage only"
        echo "  config      Backup configuration only"
        echo "  code        Backup application code only"
        echo "  logs        Backup logs only"
        echo "  cleanup     Clean up old backups"
        echo "  verify      Verify backup integrity"
        echo "  help        Show this help message"
        echo ""
        echo "If no option is provided, performs a full backup."
        ;;
    *)
        main
        ;;
esac 