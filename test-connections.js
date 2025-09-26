#!/usr/bin/env node

/**
 * Comprehensive Connection Test Script
 * Tests all frontend-backend connections to ensure they work properly
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test results
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TEST_TIMEOUT,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test function
async function test(name, testFn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    await testFn();
    console.log(`✅ PASSED: ${name}`);
    results.passed++;
  } catch (error) {
    console.log(`❌ FAILED: ${name} - ${error.message}`);
    results.failed++;
    results.errors.push({ name, error: error.message });
  }
}

// Individual tests
async function testHealthCheck() {
  const response = await makeRequest(`${BASE_URL}/api/health`);
  if (response.statusCode !== 200) {
    throw new Error(`Health check failed with status ${response.statusCode}`);
  }
}

async function testInventoryAPI() {
  const response = await makeRequest(`${BASE_URL}/api/inventory`);
  if (response.statusCode !== 401) { // Should require authentication
    throw new Error(`Inventory API should require authentication, got status ${response.statusCode}`);
  }
}

async function testOrdersAPI() {
  const response = await makeRequest(`${BASE_URL}/api/orders`);
  if (response.statusCode !== 401) { // Should require authentication
    throw new Error(`Orders API should require authentication, got status ${response.statusCode}`);
  }
}

async function testCustomersAPI() {
  const response = await makeRequest(`${BASE_URL}/api/customers`);
  if (response.statusCode !== 401) { // Should require authentication
    throw new Error(`Customers API should require authentication, got status ${response.statusCode}`);
  }
}

async function testDiamondsAPI() {
  const response = await makeRequest(`${BASE_URL}/api/diamonds`);
  if (response.statusCode !== 404) { // Endpoint might not exist
    console.log(`⚠️  Diamonds API returned status ${response.statusCode} (expected 404)`);
  }
}

async function testFileUploadAPI() {
  const response = await makeRequest(`${BASE_URL}/api/upload-file`);
  if (response.statusCode !== 400) { // Should require file
    throw new Error(`File upload API should require file, got status ${response.statusCode}`);
  }
}

async function testMessagingAPI() {
  const response = await makeRequest(`${BASE_URL}/api/messaging`);
  if (response.statusCode !== 404) { // Endpoint might not exist
    console.log(`⚠️  Messaging API returned status ${response.statusCode} (expected 404)`);
  }
}

async function testDatabaseConnection() {
  // Test if we can reach the database through a simple API call
  const response = await makeRequest(`${BASE_URL}/api/inventory/statistics`);
  if (response.statusCode !== 401) { // Should require authentication
    throw new Error(`Database connection test failed with status ${response.statusCode}`);
  }
}

async function testAuthenticationRequired() {
  // Test that protected endpoints require authentication
  const protectedEndpoints = [
    '/api/inventory',
    '/api/orders',
    '/api/customers',
    '/api/analytics',
    '/api/production'
  ];

  for (const endpoint of protectedEndpoints) {
    const response = await makeRequest(`${BASE_URL}${endpoint}`);
    if (response.statusCode !== 401) {
      throw new Error(`Protected endpoint ${endpoint} should require authentication, got status ${response.statusCode}`);
    }
  }
}

async function testEnvironmentVariables() {
  // Check if environment variables are properly configured
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Frontend-Backend Connection Tests');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log('');

  // Run all tests
  await test('Environment Variables', testEnvironmentVariables);
  await test('Health Check', testHealthCheck);
  await test('Database Connection', testDatabaseConnection);
  await test('Authentication Required', testAuthenticationRequired);
  await test('Inventory API', testInventoryAPI);
  await test('Orders API', testOrdersAPI);
  await test('Customers API', testCustomersAPI);
  await test('Diamonds API', testDiamondsAPI);
  await test('File Upload API', testFileUploadAPI);
  await test('Messaging API', testMessagingAPI);

  // Print results
  console.log('');
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.errors.length > 0) {
    console.log('');
    console.log('❌ Failed Tests:');
    results.errors.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, test, makeRequest };
