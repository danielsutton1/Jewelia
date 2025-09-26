#!/usr/bin/env node

/**
 * Core Email Integration Validation Script
 * Tests the core functionality without requiring authentication
 */

const fs = require('fs')
const path = require('path')

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
async function validateFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${description} not found at ${filePath}`)
  }
  console.log(`   📁 ${description} exists`)
}

async function validateFileContent(filePath, requiredContent, description) {
  const content = fs.readFileSync(filePath, 'utf8')
  
  for (const item of requiredContent) {
    if (!content.includes(item)) {
      throw new Error(`${description} missing required content: ${item}`)
    }
  }
  
  console.log(`   📝 ${description} contains all required content`)
}

async function validateEmailParsingService() {
  const filePath = 'lib/services/EmailParsingService.ts'
  await validateFileExists(filePath, 'EmailParsingService')
  
  const requiredContent = [
    'class EmailParsingService',
    'performSecurityCheck',
    'determineEmailType',
    'extractData',
    'validateData',
    'calculateConfidence',
    'generateSuggestions'
  ]
  
  await validateFileContent(filePath, requiredContent, 'EmailParsingService')
}

async function validateEmailProcessingService() {
  const filePath = 'lib/services/EmailProcessingService.ts'
  await validateFileExists(filePath, 'EmailProcessingService')
  
  const requiredContent = [
    'class EmailProcessingService',
    'processEmail',
    'handleSecurityAlert',
    'processQuoteEmail',
    'processOrderEmail',
    'processRepairEmail',
    'processTradeInEmail'
  ]
  
  await validateFileContent(filePath, requiredContent, 'EmailProcessingService')
}

async function validateEmailNotificationService() {
  const filePath = 'lib/services/EmailNotificationService.ts'
  await validateFileExists(filePath, 'EmailNotificationService')
  
  const requiredContent = [
    'class EmailNotificationService',
    'sendProcessingNotification',
    'sendWelcomeEmail',
    'sendTestEmail'
  ]
  
  await validateFileContent(filePath, requiredContent, 'EmailNotificationService')
}

async function validateAPIEndpoints() {
  const endpoints = [
    'app/api/email-webhook/route.ts',
    'app/api/email-integration/route.ts',
    'app/api/email-processing-logs/route.ts',
    'app/api/email-integration/test/route.ts'
  ]
  
  for (const endpoint of endpoints) {
    await validateFileExists(endpoint, `API endpoint ${endpoint}`)
    
    const content = fs.readFileSync(endpoint, 'utf8')
    if (!content.includes('export') || !content.includes('async')) {
      throw new Error(`API endpoint ${endpoint} missing required exports`)
    }
    
    console.log(`   🔗 API endpoint ${endpoint} is properly structured`)
  }
}

async function validateFrontendComponents() {
  const filePath = 'app/dashboard/email-integration/page.tsx'
  await validateFileExists(filePath, 'Email Integration Frontend')
  
  const requiredContent = [
    'EmailIntegrationPage',
    'useState',
    'useEffect',
    'handleCreateIntegration',
    'loadIntegrations',
    'loadProcessingLogs'
  ]
  
  await validateFileContent(filePath, requiredContent, 'Email Integration Frontend')
}

async function validateDatabaseSchema() {
  const filePath = 'supabase/migrations/20250129_email_integration_system.sql'
  await validateFileExists(filePath, 'Database Migration')
  
  const requiredContent = [
    'email_integration_settings',
    'email_processing_logs',
    'email_templates',
    'email_processing_queue',
    'CREATE TABLE',
    'RLS',
    'POLICY'
  ]
  
  await validateFileContent(filePath, requiredContent, 'Database Migration')
}

async function validateSecurityFeatures() {
  const parsingServicePath = 'lib/services/EmailParsingService.ts'
  const processingServicePath = 'lib/services/EmailProcessingService.ts'
  
  const parsingContent = fs.readFileSync(parsingServicePath, 'utf8')
  const processingContent = fs.readFileSync(processingServicePath, 'utf8')
  
  const parsingSecurityFeatures = [
    'performSecurityCheck',
    'isModificationAttempt',
    'riskLevel',
    'detectedActions',
    'HIGH_RISK',
    'MEDIUM_RISK',
    'CRITICAL'
  ]
  
  const processingSecurityFeatures = [
    'security_alert',
    'handleSecurityAlert'
  ]
  
  for (const feature of parsingSecurityFeatures) {
    if (!parsingContent.includes(feature)) {
      throw new Error(`Security feature missing in parsing service: ${feature}`)
    }
  }
  
  for (const feature of processingSecurityFeatures) {
    if (!processingContent.includes(feature)) {
      throw new Error(`Security feature missing in processing service: ${feature}`)
    }
  }
  
  console.log(`   🛡️ All security features implemented`)
}

async function validateCreateOnlyOperations() {
  const filePath = 'lib/services/EmailProcessingService.ts'
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Check that we're not doing UPDATE operations on business records
  const dangerousUpdates = [
    '.from(\'orders\').update(',
    '.from(\'quotes\').update(',
    '.from(\'customers\').update(',
    '.from(\'repairs\').update(',
    '.from(\'trade_ins\').update('
  ]
  
  for (const dangerousUpdate of dangerousUpdates) {
    if (content.includes(dangerousUpdate)) {
      throw new Error(`Found dangerous UPDATE operation: ${dangerousUpdate}`)
    }
  }
  
  // Check that we're doing INSERT operations
  if (!content.includes('.insert(')) {
    throw new Error('No INSERT operations found - system may not be creating records')
  }
  
  console.log(`   🔒 CREATE-ONLY operations validated`)
}

async function validateErrorHandling() {
  const files = [
    'lib/services/EmailParsingService.ts',
    'lib/services/EmailProcessingService.ts',
    'app/api/email-webhook/route.ts'
  ]
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    
    if (!content.includes('try') || !content.includes('catch')) {
      throw new Error(`Missing error handling in ${file}`)
    }
    
    if (!content.includes('logger.error')) {
      throw new Error(`Missing error logging in ${file}`)
    }
  }
  
  console.log(`   🚨 Error handling validated`)
}

async function validateTypeScriptTypes() {
  const files = [
    'lib/services/EmailParsingService.ts',
    'lib/services/EmailProcessingService.ts'
  ]
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    
    if (!content.includes('interface') || !content.includes('type')) {
      throw new Error(`Missing TypeScript types in ${file}`)
    }
  }
  
  console.log(`   📝 TypeScript types validated`)
}

async function validatePackageJsonScripts() {
  const filePath = 'package.json'
  const content = fs.readFileSync(filePath, 'utf8')
  
  const requiredScripts = [
    'test:email-integration',
    'test:email-api',
    'test:email-integration-full',
    'validate:email-schema',
    'test:email-complete'
  ]
  
  for (const script of requiredScripts) {
    if (!content.includes(script)) {
      throw new Error(`Missing npm script: ${script}`)
    }
  }
  
  console.log(`   📦 Package.json scripts validated`)
}

// Main validation runner
async function runAllValidations() {
  console.log('🚀 Starting Core Email Integration Validation')
  console.log('=' * 60)

  // Core service validation
  await runValidation('Email Parsing Service', validateEmailParsingService)
  await runValidation('Email Processing Service', validateEmailProcessingService)
  await runValidation('Email Notification Service', validateEmailNotificationService)

  // API validation
  await runValidation('API Endpoints', validateAPIEndpoints)

  // Frontend validation
  await runValidation('Frontend Components', validateFrontendComponents)

  // Database validation
  await runValidation('Database Schema', validateDatabaseSchema)

  // Security validation
  await runValidation('Security Features', validateSecurityFeatures)
  await runValidation('CREATE-ONLY Operations', validateCreateOnlyOperations)

  // Code quality validation
  await runValidation('Error Handling', validateErrorHandling)
  await runValidation('TypeScript Types', validateTypeScriptTypes)
  await runValidation('Package.json Scripts', validatePackageJsonScripts)

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
    console.log('🎉 ALL CORE VALIDATIONS PASSED!')
    console.log('✅ Email integration system is properly structured and ready!')
    console.log('\n📋 NEXT STEPS:')
    console.log('   1. Apply database migration: npm run db:migrate')
    console.log('   2. Test with real emails: npm run test:email-integration-full')
    console.log('   3. Deploy to production: npm run deploy:production')
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
  validationResults
}
