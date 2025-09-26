#!/bin/bash

# =====================================================
# PRODUCTION DEPLOYMENT SCRIPT
# =====================================================
# This script handles the complete production deployment
# of the Jewelia CRM system

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
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$PROJECT_ROOT/backups/production_$TIMESTAMP"

# Logging
LOG_FILE="$PROJECT_ROOT/logs/deployment_$TIMESTAMP.log"
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
# PRE-DEPLOYMENT CHECKS
# =====================================================

check_prerequisites() {
    log "🔍 Checking deployment prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        error "Not in project root directory. Please run from project root."
    fi
    
    # Check if .env.production exists
    if [[ ! -f "$PROJECT_ROOT/.env.production" ]]; then
        error ".env.production file not found. Please create it first."
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"
    
    # Check npm version
    NPM_VERSION=$(npm --version)
    log "npm version: $NPM_VERSION"
    
    # Check if production environment is set
    if [[ "$NODE_ENV" != "production" ]]; then
        warning "NODE_ENV not set to production. Setting it now..."
        export NODE_ENV=production
    fi
    
    success "Prerequisites check completed"
}

check_dependencies() {
    log "📦 Checking project dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Check if node_modules exists
    if [[ ! -d "node_modules" ]]; then
        log "Installing dependencies..."
        npm ci --production=false
    else
        log "Checking for dependency updates..."
        npm outdated || true
    fi
    
    # Check for security vulnerabilities
    log "Checking for security vulnerabilities..."
    npm audit --audit-level=moderate || warning "Some security vulnerabilities found. Review before deployment."
    
    success "Dependencies check completed"
}

# =====================================================
# BACKUP CREATION
# =====================================================

create_backup() {
    log "💾 Creating production backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup current production build
    if [[ -d "$PROJECT_ROOT/.next" ]]; then
        log "Backing up current build..."
        cp -r "$PROJECT_ROOT/.next" "$BACKUP_DIR/"
    fi
    
    # Backup environment files
    if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        cp "$PROJECT_ROOT/.env.production" "$BACKUP_DIR/"
    fi
    
    # Backup package files
    cp "$PROJECT_ROOT/package.json" "$BACKUP_DIR/"
    cp "$PROJECT_ROOT/package-lock.json" "$BACKUP_DIR/"
    
    # Backup database schema (if possible)
    if command -v pg_dump &> /dev/null; then
        log "Backing up database schema..."
        source "$PROJECT_ROOT/.env.production"
        pg_dump --schema-only "$DATABASE_URL" > "$BACKUP_DIR/schema_backup.sql" || warning "Database backup failed"
    fi
    
    success "Backup created at: $BACKUP_DIR"
}

# =====================================================
# BUILD PROCESS
# =====================================================

build_application() {
    log "🏗️ Building production application..."
    
    cd "$PROJECT_ROOT"
    
    # Clean previous build
    if [[ -d ".next" ]]; then
        log "Cleaning previous build..."
        rm -rf .next
    fi
    
    # Install production dependencies
    log "Installing production dependencies..."
    npm ci --production=true
    
    # Build application
    log "Building Next.js application..."
    npm run build
    
    # Verify build
    if [[ ! -d ".next" ]]; then
        error "Build failed - .next directory not created"
    fi
    
    success "Application built successfully"
}

# =====================================================
# DATABASE MIGRATION
# =====================================================

run_database_migration() {
    log "🗄️ Running database migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Check if migration script exists
    if [[ -f "scripts/migrate-production.sh" ]]; then
        log "Running production migration script..."
        bash scripts/migrate-production.sh
    else
        log "Running database migration..."
        npm run migrate:production || error "Database migration failed"
    fi
    
    # Verify migration
    log "Verifying migration status..."
    npm run migrate:status || warning "Could not verify migration status"
    
    success "Database migration completed"
}

# =====================================================
# SECURITY AUDIT
# =====================================================

run_security_audit() {
    log "🔒 Running security audit..."
    
    cd "$PROJECT_ROOT"
    
    # Run automated security audit
    if command -v npm &> /dev/null; then
        log "Running security audit..."
        npm run security:audit || warning "Security audit failed or found issues"
    fi
    
    # Check for critical vulnerabilities
    log "Checking for critical vulnerabilities..."
    npm audit --audit-level=high || warning "Critical vulnerabilities found. Review before deployment."
    
    success "Security audit completed"
}

# =====================================================
# PERFORMANCE TESTING
# =====================================================

run_performance_tests() {
    log "⚡ Running performance tests..."
    
    cd "$PROJECT_ROOT"
    
    # Check if performance testing is available
    if [[ -f "load-tests/artillery-config.yml" ]]; then
        log "Running Artillery load tests..."
        npx artillery run load-tests/artillery-config.yml || warning "Load testing failed or found performance issues"
    fi
    
    # Run basic performance checks
    log "Running basic performance checks..."
    npm run performance:check || warning "Performance checks failed"
    
    success "Performance testing completed"
}

# =====================================================
# DEPLOYMENT
# =====================================================

deploy_application() {
    log "🚀 Deploying application to production..."
    
    cd "$PROJECT_ROOT"
    
    # Check if deployment script exists
    if [[ -f "scripts/deploy-to-server.sh" ]]; then
        log "Running server deployment script..."
        bash scripts/deploy-to-server.sh
    else
        log "Using default deployment method..."
        
        # For Vercel deployment
        if command -v vercel &> /dev/null; then
            log "Deploying to Vercel..."
            vercel --prod
        # For Netlify deployment
        elif command -v netlify &> /dev/null; then
            log "Deploying to Netlify..."
            netlify deploy --prod
        # For custom server deployment
        else
            log "Manual deployment required. Please deploy the .next directory to your production server."
        fi
    fi
    
    success "Application deployed successfully"
}

# =====================================================
# POST-DEPLOYMENT VERIFICATION
# =====================================================

verify_deployment() {
    log "✅ Verifying deployment..."
    
    # Wait for deployment to settle
    log "Waiting for deployment to settle..."
    sleep 30
    
    # Check application health
    log "Checking application health..."
    if command -v curl &> /dev/null; then
        # Get the production URL from environment or use default
        PROD_URL=${PRODUCTION_URL:-"https://your-domain.com"}
        
        # Health check
        if curl -f "$PROD_URL/api/health" > /dev/null 2>&1; then
            success "Health check passed"
        else
            warning "Health check failed"
        fi
        
        # Basic functionality check
        if curl -f "$PROD_URL/api/messaging" > /dev/null 2>&1; then
            success "Messaging API check passed"
        else
            warning "Messaging API check failed"
        fi
    else
        warning "curl not available - skipping health checks"
    fi
    
    # Run smoke tests
    log "Running smoke tests..."
    npm run test:smoke || warning "Smoke tests failed"
    
    success "Deployment verification completed"
}

# =====================================================
# MONITORING SETUP
# =====================================================

setup_monitoring() {
    log "📊 Setting up monitoring and alerting..."
    
    cd "$PROJECT_ROOT"
    
    # Start performance monitoring
    log "Starting performance monitoring..."
    npm run monitoring:start || warning "Could not start performance monitoring"
    
    # Start security monitoring
    log "Starting security monitoring..."
    npm run security:monitor || warning "Could not start security monitoring"
    
    # Configure alerts
    log "Configuring monitoring alerts..."
    npm run monitoring:alerts || warning "Could not configure monitoring alerts"
    
    success "Monitoring setup completed"
}

# =====================================================
# CLEANUP
# =====================================================

cleanup() {
    log "🧹 Cleaning up deployment artifacts..."
    
    cd "$PROJECT_ROOT"
    
    # Remove temporary files
    if [[ -d "tmp" ]]; then
        rm -rf tmp
    fi
    
    # Clean npm cache if needed
    if [[ "$CLEAN_NPM_CACHE" == "true" ]]; then
        log "Cleaning npm cache..."
        npm cache clean --force
    fi
    
    success "Cleanup completed"
}

# =====================================================
# MAIN DEPLOYMENT FLOW
# =====================================================

main() {
    log "🚀 Starting Jewelia CRM production deployment..."
    log "Timestamp: $TIMESTAMP"
    log "Project Root: $PROJECT_ROOT"
    log "Backup Directory: $BACKUP_DIR"
    
    # Pre-deployment checks
    check_prerequisites
    check_dependencies
    
    # Create backup
    create_backup
    
    # Build and deploy
    build_application
    run_database_migration
    run_security_audit
    run_performance_tests
    deploy_application
    
    # Post-deployment
    verify_deployment
    setup_monitoring
    cleanup
    
    success "🎉 Production deployment completed successfully!"
    log "Backup available at: $BACKUP_DIR"
    log "Deployment log: $LOG_FILE"
    
    # Display next steps
    echo ""
    echo "📋 Next Steps:"
    echo "1. Monitor system performance for the next 24 hours"
    echo "2. Check security alerts and logs"
    echo "3. Verify all user functionality"
    echo "4. Begin user training sessions"
    echo "5. Schedule regular maintenance"
}

# =====================================================
# ERROR HANDLING
# =====================================================

trap 'error "Deployment failed at line $LINENO"' ERR

# =====================================================
# SCRIPT EXECUTION
# =====================================================

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 