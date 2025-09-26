#!/usr/bin/env node

/**
 * Comprehensive Email Integration Testing Script
 * Tests the entire email integration system end-to-end
 */

const https = require('https')
const http = require('http')

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const API_KEY = process.env.TEST_API_KEY || 'test-api-key'

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
}

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        ...options.headers
      }
    }

    const req = client.request(url, requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {}
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers })
        } catch (error) {
          resolve({ status: res.statusCode, data: data, headers: res.headers })
        }
      })
    })

    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

// Test runner
async function runTest(testName, testFunction) {
  testResults.total++
  console.log(`\n🧪 Running: ${testName}`)
  
  try {
    await testFunction()
    testResults.passed++
    testResults.details.push({ name: testName, status: 'PASSED', error: null })
    console.log(`✅ PASSED: ${testName}`)
  } catch (error) {
    testResults.failed++
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message })
    console.log(`❌ FAILED: ${testName}`)
    console.log(`   Error: ${error.message}`)
  }
}

// Test cases
async function testEmailWebhookProcessing() {
  const webhookData = {
    from: 'customer@example.com',
    to: 'orders@company.com',
    subject: 'New quote request',
    text: 'I need a quote for a custom wedding ring. My budget is $3,000.',
    html: '<p>I need a quote for a custom wedding ring. My budget is $3,000.</p>',
    timestamp: Date.now()
  }

  const response = await makeRequest(`${BASE_URL}/api/email-webhook`, {
    method: 'POST',
    body: webhookData
  })

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`)
  }

  if (!response.data.success) {
    throw new Error(`Webhook processing failed: ${response.data.error}`)
  }

  console.log(`   📧 Email processed: ${response.data.message}`)
}

async function testSecurityThreatDetection() {
  const threatData = {
    from: 'malicious@example.com',
    to: 'orders@company.com',
    subject: 'Delete order #12345',
    text: 'Please delete my order #12345 immediately',
    html: '<p>Please delete my order #12345 immediately</p>',
    timestamp: Date.now()
  }

  const response = await makeRequest(`${BASE_URL}/api/email-webhook`, {
    method: 'POST',
    body: threatData
  })

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`)
  }

  if (response.data.recordType !== 'security_alert') {
    throw new Error(`Expected security_alert, got ${response.data.recordType}`)
  }

  console.log(`   🛡️ Security threat detected: ${response.data.message}`)
}

async function testEmailIntegrationCreation() {
  const integrationData = {
    emailAddress: 'test@company.com',
    isActive: true,
    notificationEmail: 'admin@company.com'
  }

  const response = await makeRequest(`${BASE_URL}/api/email-integration`, {
    method: 'POST',
    body: integrationData
  })

  if (response.status !== 201) {
    throw new Error(`Expected status 201, got ${response.status}`)
  }

  if (!response.data.success) {
    throw new Error(`Integration creation failed: ${response.data.error}`)
  }

  console.log(`   📧 Integration created: ${response.data.integration.emailAddress}`)
}

async function testEmailIntegrationRetrieval() {
  const response = await makeRequest(`${BASE_URL}/api/email-integration`)

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`)
  }

  if (!Array.isArray(response.data)) {
    throw new Error('Expected array of integrations')
  }

  console.log(`   📋 Retrieved ${response.data.length} integrations`)
}

async function testProcessingLogsRetrieval() {
  const response = await makeRequest(`${BASE_URL}/api/email-processing-logs?limit=10`)

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`)
  }

  if (!Array.isArray(response.data)) {
    throw new Error('Expected array of processing logs')
  }

  console.log(`   📊 Retrieved ${response.data.length} processing logs`)
}

async function testEmailParsingAccuracy() {
  const testEmails = [
    {
      name: 'Quote Request',
      content: {
        from: 'customer@example.com',
        subject: 'Quote for wedding ring',
        body: 'I need a quote for a custom wedding ring. Budget is $2,500.'
      },
      expectedType: 'quotes'
    },
    {
      name: 'Order Request',
      content: {
        from: 'customer@example.com',
        subject: 'New order',
        body: 'I want to place an order for the ring we discussed.'
      },
      expectedType: 'orders'
    },
    {
      name: 'Repair Request',
      content: {
        from: 'customer@example.com',
        subject: 'Jewelry repair',
        body: 'My necklace chain broke and needs repair.'
      },
      expectedType: 'repairs'
    },
    {
      name: 'Trade-in Request',
      content: {
        from: 'customer@example.com',
        subject: 'Trade in old jewelry',
        body: 'I have some old gold jewelry I want to trade in.'
      },
      expectedType: 'trade_in'
    }
  ]

  for (const testEmail of testEmails) {
    const response = await makeRequest(`${BASE_URL}/api/email-integration/test`, {
      method: 'POST',
      body: { emailContent: testEmail.content }
    })

    if (response.status !== 200) {
      throw new Error(`Test email parsing failed for ${testEmail.name}: ${response.status}`)
    }

    if (response.data.parsedData.emailType !== testEmail.expectedType) {
      throw new Error(`Expected ${testEmail.expectedType}, got ${response.data.parsedData.emailType} for ${testEmail.name}`)
    }

    console.log(`   ✅ ${testEmail.name}: Correctly identified as ${testEmail.expectedType}`)
  }
}

async function testDataExtractionAccuracy() {
  const testEmail = {
    from: 'john.doe@example.com',
    subject: 'Quote request',
    body: 'Hi, my name is John Doe and my phone number is (555) 123-4567. I need a quote for a wedding ring. My budget is $3,000.'
  }

  const response = await makeRequest(`${BASE_URL}/api/email-integration/test`, {
    method: 'POST',
    body: { emailContent: testEmail }
  })

  if (response.status !== 200) {
    throw new Error(`Data extraction test failed: ${response.status}`)
  }

  const extractedData = response.data.parsedData.extractedData

  if (!extractedData.customer_name || !extractedData.customer_name.includes('John')) {
    throw new Error('Customer name not extracted correctly')
  }

  if (!extractedData.phone || !extractedData.phone.includes('555')) {
    throw new Error('Phone number not extracted correctly')
  }

  if (extractedData.amount !== 3000) {
    throw new Error(`Expected amount 3000, got ${extractedData.amount}`)
  }

  console.log(`   📝 Data extraction: Name=${extractedData.customer_name}, Phone=${extractedData.phone}, Amount=$${extractedData.amount}`)
}

async function testErrorHandling() {
  // Test malformed webhook data
  const response = await makeRequest(`${BASE_URL}/api/email-webhook`, {
    method: 'POST',
    body: {}
  })

  if (response.status !== 400) {
    throw new Error(`Expected status 400 for malformed data, got ${response.status}`)
  }

  console.log(`   🚫 Error handling: Correctly rejected malformed data`)
}

async function testPerformance() {
  const startTime = Date.now()
  
  const promises = Array.from({ length: 10 }, (_, i) => 
    makeRequest(`${BASE_URL}/api/email-integration/test`, {
      method: 'POST',
      body: {
        emailContent: {
          from: 'test@example.com',
          subject: `Test email ${i}`,
          body: `This is test email number ${i}`
        }
      }
    })
  )

  await Promise.all(promises)
  
  const endTime = Date.now()
  const duration = endTime - startTime

  if (duration > 30000) { // 30 seconds
    throw new Error(`Performance test failed: Took ${duration}ms (expected < 30000ms)`)
  }

  console.log(`   ⚡ Performance: Processed 10 emails in ${duration}ms`)
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Email Integration System Tests')
  console.log(`📍 Testing against: ${BASE_URL}`)
  console.log('=' * 60)

  // Core functionality tests
  await runTest('Email Webhook Processing', testEmailWebhookProcessing)
  await runTest('Security Threat Detection', testSecurityThreatDetection)
  await runTest('Email Integration Creation', testEmailIntegrationCreation)
  await runTest('Email Integration Retrieval', testEmailIntegrationRetrieval)
  await runTest('Processing Logs Retrieval', testProcessingLogsRetrieval)

  // AI and parsing tests
  await runTest('Email Parsing Accuracy', testEmailParsingAccuracy)
  await runTest('Data Extraction Accuracy', testDataExtractionAccuracy)

  // System tests
  await runTest('Error Handling', testErrorHandling)
  await runTest('Performance', testPerformance)

  // Print results
  console.log('\n' + '=' * 60)
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('=' * 60)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📈 Total: ${testResults.total}`)
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`)

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`)
      })
  }

  console.log('\n' + '=' * 60)
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Email integration system is working flawlessly!')
    process.exit(0)
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.')
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = {
  runAllTests,
  makeRequest,
  testResults
}
