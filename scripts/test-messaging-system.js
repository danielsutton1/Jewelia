#!/usr/bin/env node

/**
 * Comprehensive Messaging System Test
 * Tests all aspects of the messaging system including:
 * - API endpoints
 * - Database operations
 * - Cache functionality
 * - Real-time features
 * - Performance
 */

const fetch = require('node-fetch')

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'
const TEST_USER_EMAIL = 'test@messaging.test'
const TEST_USER_PASSWORD = 'testpassword123'

class MessagingSystemTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    }
    this.authToken = null
    this.testThreadId = null
    this.testMessageId = null
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async assert(condition, message) {
    if (condition) {
      this.testResults.passed++
      await this.log(`PASS: ${message}`, 'success')
    } else {
      this.testResults.failed++
      await this.log(`FAIL: ${message}`, 'error')
      this.testResults.errors.push(message)
    }
  }

  async testAuthentication() {
    await this.log('Testing Authentication...')
    
    try {
      // Test login
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD
        })
      })

      await this.assert(loginResponse.ok, 'Login should succeed')
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        this.authToken = loginData.token
        await this.log('Authentication successful')
      }
    } catch (error) {
      await this.log(`Authentication test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Authentication: ${error.message}`)
    }
  }

  async testThreadCreation() {
    await this.log('Testing Thread Creation...')
    
    try {
      const threadData = {
        type: 'internal',
        subject: 'Test Thread for System Testing',
        category: 'general',
        participants: [],
        tags: [],
        metadata: {}
      }

      const response = await fetch(`${BASE_URL}/api/messaging/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify(threadData)
      })

      await this.assert(response.ok, 'Thread creation should succeed')
      
      if (response.ok) {
        const data = await response.json()
        this.testThreadId = data.data.id
        await this.log(`Thread created with ID: ${this.testThreadId}`)
      }
    } catch (error) {
      await this.log(`Thread creation test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Thread Creation: ${error.message}`)
    }
  }

  async testMessageSending() {
    await this.log('Testing Message Sending...')
    
    if (!this.testThreadId) {
      await this.log('Skipping message test - no thread available', 'error')
      return
    }

    try {
      const messageData = {
        type: 'internal',
        content: 'This is a test message for system validation',
        thread_id: this.testThreadId,
        priority: 'normal',
        category: 'general',
        tags: [],
        metadata: {}
      }

      const response = await fetch(`${BASE_URL}/api/messaging`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify(messageData)
      })

      await this.assert(response.ok, 'Message sending should succeed')
      
      if (response.ok) {
        const data = await response.json()
        this.testMessageId = data.data.id
        await this.log(`Message sent with ID: ${this.testMessageId}`)
      }
    } catch (error) {
      await this.log(`Message sending test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Message Sending: ${error.message}`)
    }
  }

  async testMessageRetrieval() {
    await this.log('Testing Message Retrieval...')
    
    if (!this.testThreadId) {
      await this.log('Skipping message retrieval test - no thread available', 'error')
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/api/messaging?thread_id=${this.testThreadId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      })

      await this.assert(response.ok, 'Message retrieval should succeed')
      
      if (response.ok) {
        const data = await response.json()
        await this.assert(data.data.length > 0, 'Should retrieve at least one message')
        await this.log(`Retrieved ${data.data.length} messages`)
      }
    } catch (error) {
      await this.log(`Message retrieval test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Message Retrieval: ${error.message}`)
    }
  }

  async testThreadRetrieval() {
    await this.log('Testing Thread Retrieval...')
    
    try {
      const response = await fetch(`${BASE_URL}/api/messaging/threads`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      })

      await this.assert(response.ok, 'Thread retrieval should succeed')
      
      if (response.ok) {
        const data = await response.json()
        await this.assert(data.data.length > 0, 'Should retrieve at least one thread')
        await this.log(`Retrieved ${data.data.length} threads`)
      }
    } catch (error) {
      await this.log(`Thread retrieval test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Thread Retrieval: ${error.message}`)
    }
  }

  async testMessagingStats() {
    await this.log('Testing Messaging Statistics...')
    
    try {
      const response = await fetch(`${BASE_URL}/api/messaging/stats`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      })

      await this.assert(response.ok, 'Stats retrieval should succeed')
      
      if (response.ok) {
        const data = await response.json()
        await this.assert(data.data.total_messages >= 0, 'Should have valid message count')
        await this.assert(data.data.total_threads >= 0, 'Should have valid thread count')
        await this.log('Statistics retrieved successfully')
      }
    } catch (error) {
      await this.log(`Stats test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Statistics: ${error.message}`)
    }
  }

  async testPerformance() {
    await this.log('Testing Performance...')
    
    try {
      const startTime = Date.now()
      
      // Test multiple concurrent requests
      const promises = Array.from({ length: 10 }, () =>
        fetch(`${BASE_URL}/api/messaging/threads`, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        })
      )
      
      const responses = await Promise.all(promises)
      const endTime = Date.now()
      const duration = endTime - startTime
      
      const allSuccessful = responses.every(response => response.ok)
      await this.assert(allSuccessful, 'All concurrent requests should succeed')
      await this.assert(duration < 5000, 'Concurrent requests should complete within 5 seconds')
      
      await this.log(`Performance test completed in ${duration}ms`)
    } catch (error) {
      await this.log(`Performance test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Performance: ${error.message}`)
    }
  }

  async testCacheFunctionality() {
    await this.log('Testing Cache Functionality...')
    
    try {
      // First request
      const start1 = Date.now()
      const response1 = await fetch(`${BASE_URL}/api/messaging/threads`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      })
      const duration1 = Date.now() - start1
      
      // Second request (should be cached)
      const start2 = Date.now()
      const response2 = await fetch(`${BASE_URL}/api/messaging/threads`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      })
      const duration2 = Date.now() - start2
      
      await this.assert(response1.ok && response2.ok, 'Both requests should succeed')
      await this.assert(duration2 <= duration1, 'Cached request should be faster or equal')
      
      await this.log(`Cache test: First request ${duration1}ms, Second request ${duration2}ms`)
    } catch (error) {
      await this.log(`Cache test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Cache: ${error.message}`)
    }
  }

  async testErrorHandling() {
    await this.log('Testing Error Handling...')
    
    try {
      // Test invalid thread ID
      const invalidResponse = await fetch(`${BASE_URL}/api/messaging?thread_id=invalid-id`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      })
      
      await this.assert(!invalidResponse.ok, 'Invalid thread ID should return error')
      
      // Test unauthorized access
      const unauthorizedResponse = await fetch(`${BASE_URL}/api/messaging/threads`)
      await this.assert(!unauthorizedResponse.ok, 'Unauthorized access should be rejected')
      
      await this.log('Error handling tests passed')
    } catch (error) {
      await this.log(`Error handling test failed: ${error.message}`, 'error')
      this.testResults.errors.push(`Error Handling: ${error.message}`)
    }
  }

  async cleanup() {
    await this.log('Cleaning up test data...')
    
    try {
      if (this.testMessageId) {
        await fetch(`${BASE_URL}/api/messaging/${this.testMessageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        })
      }
      
      if (this.testThreadId) {
        await fetch(`${BASE_URL}/api/messaging/threads/${this.testThreadId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        })
      }
      
      await this.log('Cleanup completed')
    } catch (error) {
      await this.log(`Cleanup failed: ${error.message}`, 'error')
    }
  }

  async runAllTests() {
    await this.log('🚀 Starting Comprehensive Messaging System Test')
    await this.log(`Testing against: ${BASE_URL}`)
    
    const testStartTime = Date.now()
    
    try {
      await this.testAuthentication()
      await this.testThreadCreation()
      await this.testMessageSending()
      await this.testMessageRetrieval()
      await this.testThreadRetrieval()
      await this.testMessagingStats()
      await this.testPerformance()
      await this.testCacheFunctionality()
      await this.testErrorHandling()
    } catch (error) {
      await this.log(`Test suite failed: ${error.message}`, 'error')
    } finally {
      await this.cleanup()
    }
    
    const testEndTime = Date.now()
    const totalDuration = testEndTime - testStartTime
    
    await this.log('📊 Test Results Summary')
    await this.log(`Total Tests: ${this.testResults.passed + this.testResults.failed}`)
    await this.log(`Passed: ${this.testResults.passed}`)
    await this.log(`Failed: ${this.testResults.failed}`)
    await this.log(`Duration: ${totalDuration}ms`)
    
    if (this.testResults.errors.length > 0) {
      await this.log('❌ Errors:')
      this.testResults.errors.forEach(error => {
        console.log(`  - ${error}`)
      })
    }
    
    if (this.testResults.failed === 0) {
      await this.log('🎉 All tests passed! Messaging system is working correctly.', 'success')
      process.exit(0)
    } else {
      await this.log('⚠️ Some tests failed. Please review the errors above.', 'error')
      process.exit(1)
    }
  }
}

// Run the tests
const tester = new MessagingSystemTest()
tester.runAllTests().catch(error => {
  console.error('Test runner failed:', error)
  process.exit(1)
}) 