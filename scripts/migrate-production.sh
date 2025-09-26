#!/bin/bash

# =====================================================
# PRODUCTION DATABASE MIGRATION SCRIPT
# =====================================================
# This script handles production database migrations
# for the Jewelia CRM system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/supabase/migrations"
BACKUP_DIR="$PROJECT_ROOT/backups/database_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$PROJECT_ROOT/logs/migration_$(date +%Y%m%d_%H%M%S).log"

# Logging
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# =====================================================
# PRE-MIGRATION CHECKS
# =====================================================

check_prerequisites() {
    log "🔍 Checking migration prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        error "Not in project root directory. Please run from project root."
    fi
    
    # Check if .env.production exists
    if [[ ! -f "$PROJECT_ROOT/.env.production" ]]; then
        error ".env.production file not found. Please create it first."
    fi
    
    # Check if migrations directory exists
    if [[ ! -d "$MIGRATIONS_DIR" ]]; then
        error "Migrations directory not found: $MIGRATIONS_DIR"
    fi
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        error "PostgreSQL client (psql) not found. Please install it first."
    fi
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        error "Node.js not found. Please install it first."
    fi
    
    success "Prerequisites check completed"
}

load_environment() {
    log "📋 Loading production environment variables..."
    
    # Source the production environment file
    if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        set -a  # Export all variables
        source "$PROJECT_ROOT/.env.production"
        set +a  # Stop exporting
        
        # Verify required variables
        if [[ -z "$DATABASE_URL" ]]; then
            error "DATABASE_URL not found in .env.production"
        fi
        
        if [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
            error "SUPABASE_SERVICE_ROLE_KEY not found in .env.production"
        fi
        
        success "Environment variables loaded successfully"
    else
        error ".env.production file not found"
    fi
}

# =====================================================
# DATABASE BACKUP
# =====================================================

create_database_backup() {
    log "💾 Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Extract database connection details
    if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        log "Database: $DB_NAME on $DB_HOST:$DB_PORT"
        
        # Create schema backup
        log "Creating schema backup..."
        PGPASSWORD="$DB_PASS" pg_dump \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --schema-only \
            --no-owner \
            --no-privileges \
            "$DB_NAME" > "$BACKUP_DIR/schema_backup.sql"
        
        # Create data backup (excluding large tables)
        log "Creating data backup..."
        PGPASSWORD="$DB_PASS" pg_dump \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --data-only \
            --exclude-table="system_logs" \
            --exclude-table="message_attachments" \
            --exclude-table="file_uploads" \
            "$DB_NAME" > "$BACKUP_DIR/data_backup.sql"
        
        # Create full backup info
        cat > "$BACKUP_DIR/backup_info.txt" << EOF
Database Backup Information
==========================
Timestamp: $(date)
Database: $DB_NAME
Host: $DB_HOST
Port: $DB_PORT
User: $DB_USER

Backup Files:
- schema_backup.sql: Database schema only
- data_backup.sql: Data only (excluding large tables)
- backup_info.txt: This file

Restore Commands:
1. Restore schema: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < schema_backup.sql
2. Restore data: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < data_backup.sql

Note: This backup excludes large tables to reduce size and backup time.
EOF
        
        success "Database backup created at: $BACKUP_DIR"
    else
        error "Invalid DATABASE_URL format"
    fi
}

# =====================================================
# MIGRATION VALIDATION
# =====================================================

validate_migrations() {
    log "🔍 Validating migration files..."
    
    # Check for migration files
    MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)
    
    if [[ -z "$MIGRATION_FILES" ]]; then
        error "No migration files found in $MIGRATIONS_DIR"
    fi
    
    log "Found $(echo "$MIGRATION_FILES" | wc -l) migration files"
    
    # Validate each migration file
    for migration_file in $MIGRATION_FILES; do
        log "Validating: $(basename "$migration_file")"
        
        # Check SQL syntax (basic validation)
        if ! psql --set ON_ERROR_STOP=on --quiet --file="$migration_file" --dry-run 2>/dev/null; then
            warning "SQL syntax validation failed for: $(basename "$migration_file")"
        fi
    done
    
    success "Migration validation completed"
}

# =====================================================
# DATABASE CONNECTIVITY TEST
# =====================================================

test_database_connection() {
    log "🔌 Testing database connectivity..."
    
    # Extract database connection details
    if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Test connection
        if PGPASSWORD="$DB_PASS" psql \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --command="SELECT version();" \
            --quiet > /dev/null 2>&1; then
            success "Database connection successful"
        else
            error "Database connection failed"
        fi
        
        # Check if database exists and is accessible
        if PGPASSWORD="$DB_PASS" psql \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --command="SELECT current_database();" \
            --quiet | grep -q "$DB_NAME"; then
            success "Database access verified"
        else
            error "Database access failed"
        fi
    else
        error "Invalid DATABASE_URL format"
    fi
}

# =====================================================
# MIGRATION EXECUTION
# =====================================================

run_migrations() {
    log "🚀 Running database migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Check if Supabase CLI is available
    if command -v supabase &> /dev/null; then
        log "Using Supabase CLI for migrations..."
        
        # Set Supabase environment
        export SUPABASE_ACCESS_TOKEN="$SUPABASE_SERVICE_ROLE_KEY"
        export SUPABASE_DB_URL="$DATABASE_URL"
        
        # Run migrations
        if supabase db push --db-url="$DATABASE_URL"; then
            success "Supabase migrations completed successfully"
        else
            error "Supabase migrations failed"
        fi
    else
        log "Supabase CLI not found, using manual migration..."
        
        # Manual migration execution
        MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)
        
        for migration_file in $MIGRATION_FILES; do
            log "Executing: $(basename "$migration_file")"
            
            # Extract database connection details
            if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
                DB_USER="${BASH_REMATCH[1]}"
                DB_PASS="${BASH_REMATCH[2]}"
                DB_HOST="${BASH_REMATCH[3]}"
                DB_PORT="${BASH_REMATCH[4]}"
                DB_NAME="${BASH_REMATCH[5]}"
                
                # Execute migration
                if PGPASSWORD="$DB_PASS" psql \
                    --host="$DB_HOST" \
                    --port="$DB_PORT" \
                    --username="$DB_USER" \
                    --dbname="$DB_NAME" \
                    --file="$migration_file" \
                    --quiet; then
                    success "Migration executed: $(basename "$migration_file")"
                else
                    error "Migration failed: $(basename "$migration_file")"
                fi
            else
                error "Invalid DATABASE_URL format"
            fi
        done
    fi
}

# =====================================================
# POST-MIGRATION VERIFICATION
# =====================================================

verify_migrations() {
    log "✅ Verifying migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Check if all expected tables exist
    log "Verifying table structure..."
    
    # Extract database connection details
    if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Expected tables
        EXPECTED_TABLES=(
            "users"
            "partners"
            "partner_relationships"
            "messages"
            "message_threads"
            "message_attachments"
            "message_reactions"
            "message_read_receipts"
            "message_notifications"
            "system_logs"
        )
        
        # Check each expected table
        for table in "${EXPECTED_TABLES[@]}"; do
            if PGPASSWORD="$DB_PASS" psql \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --username="$DB_USER" \
                --dbname="$DB_NAME" \
                --command="SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" \
                --quiet | grep -q "t"; then
                success "Table exists: $table"
            else
                error "Table missing: $table"
            fi
        done
        
        # Check table row counts
        log "Checking table row counts..."
        PGPASSWORD="$DB_PASS" psql \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --command="
                SELECT 
                    schemaname,
                    tablename,
                    n_tup_ins as inserts,
                    n_tup_upd as updates,
                    n_tup_del as deletes
                FROM pg_stat_user_tables 
                ORDER BY tablename;
            " \
            --quiet
        
    else
        error "Invalid DATABASE_URL format"
    fi
    
    success "Migration verification completed"
}

# =====================================================
# DATA SEEDING (OPTIONAL)
# =====================================================

seed_production_data() {
    log "🌱 Seeding production data (if needed)..."
    
    cd "$PROJECT_ROOT"
    
    # Check if seeding is enabled
    if [[ "$SEED_PRODUCTION_DATA" == "true" ]]; then
        log "Production data seeding enabled..."
        
        # Check if seed script exists
        if [[ -f "scripts/seed-production.sh" ]]; then
            log "Running production seed script..."
            bash scripts/seed-production.sh
        else
            log "No production seed script found, skipping..."
        fi
    else
        log "Production data seeding disabled, skipping..."
    fi
    
    success "Data seeding completed"
}

# =====================================================
# PERFORMANCE OPTIMIZATION
# =====================================================

optimize_database() {
    log "⚡ Optimizing database performance..."
    
    # Extract database connection details
    if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Update table statistics
        log "Updating table statistics..."
        PGPASSWORD="$DB_PASS" psql \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --command="ANALYZE;" \
            --quiet
        
        # Check index usage
        log "Checking index usage..."
        PGPASSWORD="$DB_PASS" psql \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --command="
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_scan,
                    idx_tup_read,
                    idx_tup_fetch
                FROM pg_stat_user_indexes 
                ORDER BY idx_scan DESC;
            " \
            --quiet
        
    else
        error "Invalid DATABASE_URL format"
    fi
    
    success "Database optimization completed"
}

# =====================================================
# CLEANUP
# =====================================================

cleanup() {
    log "🧹 Cleaning up migration artifacts..."
    
    # Remove temporary files
    if [[ -d "$PROJECT_ROOT/tmp" ]]; then
        rm -rf "$PROJECT_ROOT/tmp"
    fi
    
    # Clean old backups (keep last 5)
    if [[ -d "$PROJECT_ROOT/backups" ]]; then
        find "$PROJECT_ROOT/backups" -name "database_*" -type d | sort | head -n -5 | xargs rm -rf 2>/dev/null || true
    fi
    
    success "Cleanup completed"
}

# =====================================================
# MAIN MIGRATION FLOW
# =====================================================

main() {
    log "🚀 Starting Jewelia CRM production database migration..."
    log "Timestamp: $(date)"
    log "Project Root: $PROJECT_ROOT"
    log "Migrations Directory: $MIGRATIONS_DIR"
    log "Backup Directory: $BACKUP_DIR"
    
    # Pre-migration checks
    check_prerequisites
    load_environment
    test_database_connection
    
    # Create backup
    create_database_backup
    
    # Validate and run migrations
    validate_migrations
    run_migrations
    verify_migrations
    
    # Post-migration tasks
    seed_production_data
    optimize_database
    cleanup
    
    success "🎉 Production database migration completed successfully!"
    log "Backup available at: $BACKUP_DIR"
    log "Migration log: $LOG_FILE"
    
    # Display next steps
    echo ""
    echo "📋 Next Steps:"
    echo "1. Verify all database tables and data"
    echo "2. Test application functionality"
    echo "3. Monitor database performance"
    echo "4. Schedule regular database maintenance"
    echo "5. Update database documentation"
}

# =====================================================
# ERROR HANDLING
# =====================================================

trap 'error "Migration failed at line $LINENO"' ERR

# =====================================================
# SCRIPT EXECUTION
# =====================================================

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
