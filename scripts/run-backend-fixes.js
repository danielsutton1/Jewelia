#!/usr/bin/env node

/**
 * Backend Fixes Script
 * This script runs the database migration to fix all backend issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runBackendFixes() {
  try {
    console.log('🔧 Starting backend fixes...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250120_fix_backend_issues.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Running database migration...');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Backend fixes completed successfully!');
    console.log('');
    console.log('📋 Fixed issues:');
    console.log('   ✅ Products table schema (added missing columns)');
    console.log('   ✅ Inventory table schema (added unit_price, unit_cost)');
    console.log('   ✅ Inventory status enum (fixed enum values)');
    console.log('   ✅ Quotes table (created if missing)');
    console.log('   ✅ Database indexes (created for performance)');
    console.log('   ✅ RLS policies (enabled and configured)');
    console.log('   ✅ Sample data (inserted for testing)');
    console.log('');
    console.log('🚀 Your backend should now work correctly!');
    
  } catch (error) {
    console.error('❌ Error running backend fixes:', error);
    process.exit(1);
  }
}

// Run the fixes
runBackendFixes(); 