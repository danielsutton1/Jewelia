#!/usr/bin/env node

/**
 * Email Integration Database Schema Validation Script
 * Validates that all required tables, columns, and constraints exist
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Expected schema definitions
const expectedSchema = {
  email_integration_settings: {
    columns: [
      'id', 'tenant_id', 'user_id', 'email_address', 'is_active',
      'notification_email', 'created_at', 'updated_at'
    ],
    constraints: ['PRIMARY KEY', 'UNIQUE']
  },
  email_processing_logs: {
    columns: [
      'id', 'integration_id', 'sender_email', 'subject', 'email_type',
      'processing_status', 'ai_confidence_score', 'created_record_type',
      'created_record_id', 'error_message', 'extracted_data', 'created_at'
    ],
    constraints: ['PRIMARY KEY', 'FOREIGN KEY']
  },
  email_templates: {
    columns: [
      'id', 'tenant_id', 'email_type', 'template_name', 'template_content',
      'is_active', 'created_at', 'updated_at'
    ],
    constraints: ['PRIMARY KEY', 'UNIQUE']
  },
  email_processing_queue: {
    columns: [
      'id', 'integration_id', 'email_data', 'status', 'priority',
      'retry_count', 'max_retries', 'error_message', 'created_at',
      'processed_at'
    ],
    constraints: ['PRIMARY KEY', 'FOREIGN KEY']
  }
}

// Validation results
let validationResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
}

// Test runner
async function runValidation(testName, testFunction) {
  validationResults.total++
  console.log(`\n🔍 Validating: ${testName}`)
  
  try {
    await testFunction()
    validationResults.passed++
    validationResults.details.push({ name: testName, status: 'PASSED', error: null })
    console.log(`✅ PASSED: ${testName}`)
  } catch (error) {
    validationResults.failed++
    validationResults.details.push({ name: testName, status: 'FAILED', error: error.message })
    console.log(`❌ FAILED: ${testName}`)
    console.log(`   Error: ${error.message}`)
  }
}

// Validation functions
async function validateTableExists(tableName) {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)

  if (error) {
    throw new Error(`Database query failed: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error(`Table '${tableName}' does not exist`)
  }

  console.log(`   📋 Table '${tableName}' exists`)
}

async function validateTableColumns(tableName, expectedColumns) {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)

  if (error) {
    throw new Error(`Failed to get columns for table '${tableName}': ${error.message}`)
  }

  const actualColumns = data.map(col => col.column_name)
  const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col))

  if (missingColumns.length > 0) {
    throw new Error(`Missing columns in '${tableName}': ${missingColumns.join(', ')}`)
  }

  console.log(`   📝 All ${expectedColumns.length} expected columns exist`)
}

async function validateTableConstraints(tableName, expectedConstraints) {
  const { data, error } = await supabase
    .from('information_schema.table_constraints')
    .select('constraint_type')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)

  if (error) {
    throw new Error(`Failed to get constraints for table '${tableName}': ${error.message}`)
  }

  const actualConstraints = data.map(constraint => constraint.constraint_type)
  
  for (const expectedConstraint of expectedConstraints) {
    if (!actualConstraints.includes(expectedConstraint)) {
      throw new Error(`Missing constraint '${expectedConstraint}' in table '${tableName}'`)
    }
  }

  console.log(`   🔒 All expected constraints exist`)
}

async function validateRowLevelSecurity(tableName) {
  const { data, error } = await supabase
    .from('pg_policies')
    .select('policyname')
    .eq('tablename', tableName)

  if (error) {
    throw new Error(`Failed to check RLS policies for table '${tableName}': ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error(`No RLS policies found for table '${tableName}'`)
  }

  console.log(`   🛡️ RLS policies exist (${data.length} policies)`)
}

async function validateIndexes(tableName) {
  const { data, error } = await supabase
    .from('pg_indexes')
    .select('indexname')
    .eq('tablename', tableName)

  if (error) {
    throw new Error(`Failed to check indexes for table '${tableName}': ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error(`No indexes found for table '${tableName}'`)
  }

  console.log(`   📊 Indexes exist (${data.length} indexes)`)
}

async function validateTriggers(tableName) {
  const { data, error } = await supabase
    .from('information_schema.triggers')
    .select('trigger_name')
    .eq('event_object_table', tableName)

  if (error) {
    throw new Error(`Failed to check triggers for table '${tableName}': ${error.message}`)
  }

  // Triggers are optional, so we just log what we find
  console.log(`   ⚡ Triggers: ${data.length} found`)
}

async function testTableOperations(tableName) {
  // Test INSERT
  const testData = {
    tenant_id: 'test-tenant',
    user_id: 'test-user',
    email_address: 'test@example.com',
    is_active: true
  }

  const { data: insertData, error: insertError } = await supabase
    .from(tableName)
    .insert([testData])
    .select()

  if (insertError) {
    throw new Error(`INSERT test failed: ${insertError.message}`)
  }

  const recordId = insertData[0].id

  // Test SELECT
  const { data: selectData, error: selectError } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', recordId)
    .single()

  if (selectError) {
    throw new Error(`SELECT test failed: ${selectError.message}`)
  }

  // Test UPDATE
  const { error: updateError } = await supabase
    .from(tableName)
    .update({ is_active: false })
    .eq('id', recordId)

  if (updateError) {
    throw new Error(`UPDATE test failed: ${updateError.message}`)
  }

  // Test DELETE
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq('id', recordId)

  if (deleteError) {
    throw new Error(`DELETE test failed: ${deleteError.message}`)
  }

  console.log(`   🔄 CRUD operations work correctly`)
}

async function validateEmailIntegrationSettings() {
  await validateTableExists('email_integration_settings')
  await validateTableColumns('email_integration_settings', expectedSchema.email_integration_settings.columns)
  await validateTableConstraints('email_integration_settings', expectedSchema.email_integration_settings.constraints)
  await validateRowLevelSecurity('email_integration_settings')
  await validateIndexes('email_integration_settings')
  await validateTriggers('email_integration_settings')
  await testTableOperations('email_integration_settings')
}

async function validateEmailProcessingLogs() {
  await validateTableExists('email_processing_logs')
  await validateTableColumns('email_processing_logs', expectedSchema.email_processing_logs.columns)
  await validateTableConstraints('email_processing_logs', expectedSchema.email_processing_logs.constraints)
  await validateRowLevelSecurity('email_processing_logs')
  await validateIndexes('email_processing_logs')
  await validateTriggers('email_processing_logs')
}

async function validateEmailTemplates() {
  await validateTableExists('email_templates')
  await validateTableColumns('email_templates', expectedSchema.email_templates.columns)
  await validateTableConstraints('email_templates', expectedSchema.email_templates.constraints)
  await validateRowLevelSecurity('email_templates')
  await validateIndexes('email_templates')
  await validateTriggers('email_templates')
}

async function validateEmailProcessingQueue() {
  await validateTableExists('email_processing_queue')
  await validateTableColumns('email_processing_queue', expectedSchema.email_processing_queue.columns)
  await validateTableConstraints('email_processing_queue', expectedSchema.email_processing_queue.constraints)
  await validateRowLevelSecurity('email_processing_queue')
  await validateIndexes('email_processing_queue')
  await validateTriggers('email_processing_queue')
}

async function validateExistingTables() {
  // Check that existing CRM tables exist and are accessible
  const existingTables = [
    'customers', 'orders', 'quotes', 'repairs', 'trade_ins',
    'communication_threads', 'communication_messages'
  ]

  for (const tableName of existingTables) {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)

    if (error) {
      throw new Error(`Failed to check existing table '${tableName}': ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`Required existing table '${tableName}' does not exist`)
    }

    console.log(`   ✅ Existing table '${tableName}' is accessible`)
  }
}

async function validateDatabaseConnection() {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .limit(1)

  if (error) {
    throw new Error(`Database connection failed: ${error.message}`)
  }

  console.log(`   🔗 Database connection successful`)
}

// Main validation runner
async function runAllValidations() {
  console.log('🚀 Starting Email Integration Database Schema Validation')
  console.log(`📍 Validating against: ${SUPABASE_URL}`)
  console.log('=' * 60)

  // Connection test
  await runValidation('Database Connection', validateDatabaseConnection)

  // Existing tables validation
  await runValidation('Existing CRM Tables', validateExistingTables)

  // Email integration tables validation
  await runValidation('Email Integration Settings Table', validateEmailIntegrationSettings)
  await runValidation('Email Processing Logs Table', validateEmailProcessingLogs)
  await runValidation('Email Templates Table', validateEmailTemplates)
  await runValidation('Email Processing Queue Table', validateEmailProcessingQueue)

  // Print results
  console.log('\n' + '=' * 60)
  console.log('📊 VALIDATION RESULTS SUMMARY')
  console.log('=' * 60)
  console.log(`✅ Passed: ${validationResults.passed}`)
  console.log(`❌ Failed: ${validationResults.failed}`)
  console.log(`📈 Total: ${validationResults.total}`)
  console.log(`🎯 Success Rate: ${((validationResults.passed / validationResults.total) * 100).toFixed(1)}%`)

  if (validationResults.failed > 0) {
    console.log('\n❌ VALIDATION FAILURES:')
    validationResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`)
      })
  }

  console.log('\n' + '=' * 60)
  
  if (validationResults.failed === 0) {
    console.log('🎉 ALL VALIDATIONS PASSED! Database schema is ready for email integration!')
    process.exit(0)
  } else {
    console.log('⚠️ Some validations failed. Please review the issues above.')
    process.exit(1)
  }
}

// Run validations if this script is executed directly
if (require.main === module) {
  runAllValidations().catch(error => {
    console.error('💥 Validation runner failed:', error)
    process.exit(1)
  })
}

module.exports = {
  runAllValidations,
  validateTableExists,
  validateTableColumns,
  validationResults
}
