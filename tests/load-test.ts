import { check } from 'k6'
import http from 'k6/http'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const successRate = new Rate('success')

// Test configuration
export const options = {
  stages: [
    // Ramp up to 50 users over 2 minutes
    { duration: '2m', target: 50 },
    // Stay at 50 users for 3 minutes
    { duration: '3m', target: 50 },
    // Ramp up to 100 users over 2 minutes
    { duration: '2m', target: 100 },
    // Stay at 100 users for 3 minutes
    { duration: '3m', target: 100 },
    // Ramp up to 200 users over 2 minutes
    { duration: '2m', target: 200 },
    // Stay at 200 users for 3 minutes
    { duration: '3m', target: 200 },
    // Ramp down to 0 users over 2 minutes
    { duration: '2m', target: 0 },
  ],
  
  thresholds: {
    // 95% of requests must complete below these thresholds
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_duration: ['p(99)<1000'], // 99% under 1s
    
    // Error rate must be below 1%
    http_req_failed: ['rate<0.01'],
    
    // Custom thresholds
    errors: ['rate<0.01'],
    success: ['rate>0.99'],
  },
  
  // Test timeouts
  http_req_timeout: '30s',
  http_req_duration: '10s',
}

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'test@jewelia.com'
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'testpassword123'

// Test scenarios
const scenarios = {
  // Social feed browsing
  socialFeed: {
    weight: 40,
    exec: 'socialFeedScenario',
  },
  
  // Post creation and interaction
  socialInteraction: {
    weight: 25,
    exec: 'socialInteractionScenario',
  },
  
  // Messaging
  messaging: {
    weight: 20,
    exec: 'messagingScenario',
  },
  
  // User profile and connections
  userProfile: {
    weight: 15,
    exec: 'userProfileScenario',
  },
}

// Main test function
export default function() {
  // Randomly select a scenario based on weights
  const random = Math.random()
  let cumulativeWeight = 0
  
  for (const [name, scenario] of Object.entries(scenarios)) {
    cumulativeWeight += scenario.weight / 100
    if (random <= cumulativeWeight) {
      // Execute the selected scenario
      switch (scenario.exec) {
        case 'socialFeedScenario':
          socialFeedScenario()
          break
        case 'socialInteractionScenario':
          socialInteractionScenario()
          break
        case 'messagingScenario':
          messagingScenario()
          break
        case 'userProfileScenario':
          userProfileScenario()
          break
      }
      break
    }
  }
}

// Social Feed Scenario
function socialFeedScenario() {
  const startTime = Date.now()
  
  try {
    // Get social feed
    const feedResponse = http.get(`${BASE_URL}/api/social/feed?page=1&limit=20`)
    
    check(feedResponse, {
      'social feed status is 200': (r) => r.status === 200,
      'social feed response time < 500ms': (r) => r.timings.duration < 500,
      'social feed has posts': (r) => {
        try {
          const data = JSON.parse(r.body as string)
          return data.success && data.data && data.data.posts && data.data.posts.length > 0
        } catch {
          return false
        }
      },
    })
    
    if (feedResponse.status === 200) {
      successRate.add(1)
    } else {
      errorRate.add(1)
    }
    
    // Simulate user scrolling (load more posts)
    if (Math.random() > 0.5) {
      const page2Response = http.get(`${BASE_URL}/api/social/feed?page=2&limit=20`)
      
      check(page2Response, {
        'page 2 status is 200': (r) => r.status === 200,
        'page 2 response time < 500ms': (r) => r.timings.duration < 500,
      })
    }
    
    // Filter by category
    const categories = ['engagement_rings', 'necklaces', 'earrings', 'bracelets']
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    
    const filteredResponse = http.get(`${BASE_URL}/api/social/feed?jewelry_categories=${randomCategory}&limit=10`)
    
    check(filteredResponse, {
      'filtered feed status is 200': (r) => r.status === 200,
      'filtered feed response time < 500ms': (r) => r.timings.duration < 500,
    })
    
  } catch (error) {
    errorRate.add(1)
    console.error('Social feed scenario error:', error)
  }
}

// Social Interaction Scenario
function socialInteractionScenario() {
  try {
    // Get a post to interact with
    const feedResponse = http.get(`${BASE_URL}/api/social/feed?page=1&limit=5`)
    
    if (feedResponse.status === 200) {
      try {
        const data = JSON.parse(feedResponse.body as string)
        if (data.success && data.data.posts && data.data.posts.length > 0) {
          const post = data.data.posts[0]
          
          // Like the post
          const likeResponse = http.post(`${BASE_URL}/api/social/posts/${post.id}/like`, JSON.stringify({
            reaction_type: 'like'
          }), {
            headers: { 'Content-Type': 'application/json' }
          })
          
          check(likeResponse, {
            'like post status is 200': (r) => r.status === 200,
            'like post response time < 300ms': (r) => r.timings.duration < 300,
          })
          
          // Add a comment
          const commentResponse = http.post(`${BASE_URL}/api/social/posts/${post.id}/comments`, JSON.stringify({
            content: 'Great design! Love the craftsmanship.',
            parent_comment_id: null
          }), {
            headers: { 'Content-Type': 'application/json' }
          })
          
          check(commentResponse, {
            'comment post status is 200': (r) => r.status === 200,
            'comment post response time < 300ms': (r) => r.timings.duration < 300,
          })
          
          successRate.add(1)
        }
      } catch (parseError) {
        errorRate.add(1)
      }
    } else {
      errorRate.add(1)
    }
    
  } catch (error) {
    errorRate.add(1)
    console.error('Social interaction scenario error:', error)
  }
}

// Messaging Scenario
function messagingScenario() {
  try {
    // Get messages
    const messagesResponse = http.get(`${BASE_URL}/api/messaging?limit=20`)
    
    check(messagesResponse, {
      'messages status is 200': (r) => r.status === 200,
      'messages response time < 300ms': (r) => r.timings.duration < 300,
    })
    
    if (messagesResponse.status === 200) {
      successRate.add(1)
      
      // Simulate sending a message (if we had authentication)
      if (Math.random() > 0.7) {
        const sendMessageResponse = http.post(`${BASE_URL}/api/messaging`, JSON.stringify({
          content: 'Hello! How are you doing?',
          recipient_id: 'test-recipient-id',
          type: 'external'
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
        
        check(sendMessageResponse, {
          'send message status is 201': (r) => r.status === 201,
          'send message response time < 500ms': (r) => r.timings.duration < 500,
        })
      }
    } else {
      errorRate.add(1)
    }
    
  } catch (error) {
    errorRate.add(1)
    console.error('Messaging scenario error:', error)
  }
}

// User Profile Scenario
function userProfileScenario() {
  try {
    // Get user profile
    const profileResponse = http.get(`${BASE_URL}/api/social/profiles/me`)
    
    check(profileResponse, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 300ms': (r) => r.timings.duration < 300,
    })
    
    if (profileResponse.status === 200) {
      successRate.add(1)
      
      // Get user connections
      const connectionsResponse = http.get(`${BASE_URL}/api/social/connections`)
      
      check(connectionsResponse, {
        'connections status is 200': (r) => r.status === 200,
        'connections response time < 300ms': (r) => r.timings.duration < 300,
      })
      
      // Get recommended users
      const recommendationsResponse = http.get(`${BASE_URL}/api/social/recommendations`)
      
      check(recommendationsResponse, {
        'recommendations status is 200': (r) => r.status === 200,
        'recommendations response time < 500ms': (r) => r.timings.duration < 500,
      })
      
    } else {
      errorRate.add(1)
    }
    
  } catch (error) {
    errorRate.add(1)
    console.error('User profile scenario error:', error)
  }
}

// Setup function (runs once before the test)
export function setup() {
  console.log('🚀 Starting Jewelia CRM Load Test')
  console.log(`Base URL: ${BASE_URL}`)
  console.log('Test Configuration:')
  console.log('- Stages: 7 stages over 17 minutes')
  console.log('- Target: Up to 200 concurrent users')
  console.log('- Thresholds: 95% requests < 500ms, 99% requests < 1s')
  console.log('- Error rate: < 1%')
  console.log('')
}

// Teardown function (runs once after the test)
export function teardown(data: any) {
  console.log('✅ Load Test Completed')
  console.log('Final Results:')
  console.log(`- Total requests: ${data.metrics.http_reqs?.count || 'N/A'}`)
  console.log(`- Average response time: ${data.metrics.http_req_duration?.avg?.toFixed(2) || 'N/A'}ms`)
  console.log(`- 95th percentile: ${data.metrics.http_req_duration?.['p(95)']?.toFixed(2) || 'N/A'}ms`)
  console.log(`- Error rate: ${((data.metrics.http_req_failed?.rate || 0) * 100).toFixed(2)}%`)
  console.log(`- Success rate: ${((data.metrics.success?.rate || 0) * 100).toFixed(2)}%`)
} 