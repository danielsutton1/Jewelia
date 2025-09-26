// Mock the Supabase server module using doMock
jest.doMock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn().mockResolvedValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [{ id: 'test-id' }] })
      })
    })
  })
}))

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || 'GET',
    headers: {
      get: jest.fn().mockImplementation((key) => {
        const headers = options?.headers || {}
        return headers[key] || null
      })
    },
    body: options?.body,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(options?.body || ''),
    nextUrl: { pathname: '/api/test' },
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      json: jest.fn().mockResolvedValue(data),
      headers: new Map(),
    })),
  },
}))

const { NextRequest } = require('next/server')

// Import handlers after mocks are set up
let webhookHandler: any
let integrationHandler: any
let createIntegrationHandler: any
let logsHandler: any
let testHandler: any

beforeAll(async () => {
  const webhookModule = await import('@/app/api/email-webhook/route')
  webhookHandler = webhookModule.POST
  
  const integrationModule = await import('@/app/api/email-integration/route')
  integrationHandler = integrationModule.GET
  createIntegrationHandler = integrationModule.POST
  
  const logsModule = await import('@/app/api/email-processing-logs/route')
  logsHandler = logsModule.GET
  
  const testModule = await import('@/app/api/email-integration/test/route')
  testHandler = testModule.POST
})

// Mock authentication
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(() => ({
    id: 'test-user-id',
    tenant_id: 'test-tenant-id',
    email: 'test@example.com'
  }))
}))

// Mock environment variables
process.env.EMAIL_WEBHOOK_SECRET = 'test-webhook-secret'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// Mock crypto for webhook signature verification
global.crypto = {
  subtle: {
    importKey: jest.fn().mockResolvedValue({}),
    sign: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    verify: jest.fn().mockResolvedValue(true),
  },
} as any

// Mock the Node.js crypto module used for webhook verification
jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('valid-signature-hash')
    })
  })
}))

// Mock EmailParsingService and EmailProcessingService
jest.mock('@/lib/services/EmailParsingService', () => ({
  EmailParsingService: jest.fn().mockImplementation(() => ({
    parseEmail: jest.fn().mockResolvedValue({
      emailType: 'quotes',
      confidence: 0.9,
      extractedData: {
        customer_name: 'Test Customer',
        email: 'test@example.com',
        phone: '123-456-7890',
        description: 'Test description',
      },
      requiresReview: false,
      _security: {
        riskLevel: 'LOW',
        detectedActions: [],
        isModificationAttempt: false,
      },
    }),
  })),
}))

jest.mock('@/lib/services/EmailProcessingService', () => ({
  EmailProcessingService: jest.fn().mockImplementation(() => ({
    processEmail: jest.fn().mockResolvedValue({
      success: true,
      recordType: 'quote',
      recordId: 'test-record-id',
      message: 'Email processed successfully',
      requiresReview: false,
    }),
    processEmailWithData: jest.fn().mockResolvedValue({
      success: true,
      recordType: 'quote',
      recordId: 'test-record-id',
      message: 'Email processed successfully',
    }),
  })),
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-id', created_at: new Date().toISOString() }, 
            error: null 
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }))
}))

describe('Email Integration API Endpoints', () => {
  describe('POST /api/email-webhook', () => {
    test('should process valid email webhook', async () => {
      const webhookData = {
        from: 'customer@example.com',
        to: 'orders@company.com',
        subject: 'New quote request',
        text: 'I need a quote for a custom ring',
        html: '<p>I need a quote for a custom ring</p>',
        timestamp: Date.now()
      }

      const request = new NextRequest('http://localhost:3000/api/email-webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'sha256=valid-signature-hash'
        }
      })

      const response = await webhookHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Email processed successfully')
    })

    test('should handle malformed webhook data', async () => {
      const request = new NextRequest('http://localhost:3000/api/email-webhook', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'sha256=valid-signature-hash'
        }
      })

      const { POST: webhookHandler2 } = await import('@/app/api/email-webhook/route')
      const response = await webhookHandler2(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid email data')
    })

    test('should handle security threats in webhook', async () => {
      const webhookData = {
        from: 'malicious@example.com',
        to: 'orders@company.com',
        subject: 'Delete order #12345',
        text: 'Please delete my order #12345 immediately',
        html: '<p>Please delete my order #12345 immediately</p>',
        timestamp: Date.now()
      }

      const request = new NextRequest('http://localhost:3000/api/email-webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'sha256=valid-signature-hash'
        }
      })

      const { POST: webhookHandler2 } = await import('@/app/api/email-webhook/route')
      const response = await webhookHandler2(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.recordType).toBe('security_alert')
      expect(data.message).toContain('Security alert created')
    })
  })

  describe('GET /api/email-integration', () => {
    test('should return user integrations', async () => {
      const request = new NextRequest('http://localhost:3000/api/email-integration')
      const response = await integrationHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('POST /api/email-integration', () => {
    test('should create new email integration', async () => {
      const integrationData = {
        emailAddress: 'test@company.com',
        isActive: true,
        notificationEmail: 'admin@company.com'
      }

      const request = new NextRequest('http://localhost:3000/api/email-integration', {
        method: 'POST',
        body: JSON.stringify(integrationData),
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'sha256=valid-signature-hash'
        }
      })

      const response = await createIntegrationHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.integration.emailAddress).toBe('test@company.com')
    })

    test('should validate email address format', async () => {
      const integrationData = {
        emailAddress: 'invalid-email',
        isActive: true
      }

      const request = new NextRequest('http://localhost:3000/api/email-integration', {
        method: 'POST',
        body: JSON.stringify(integrationData),
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'sha256=valid-signature-hash'
        }
      })

      const response = await createIntegrationHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid email address')
    })
  })

  describe('GET /api/email-processing-logs', () => {
    test('should return processing logs', async () => {
      const request = new NextRequest('http://localhost:3000/api/email-processing-logs?limit=10')
      const response = await logsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    test('should respect limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/email-processing-logs?limit=5')
      const response = await logsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.length).toBeLessThanOrEqual(5)
    })
  })

  describe('POST /api/email-integration/test', () => {
    test('should process test email', async () => {
      const testData = {
        emailContent: {
          from: 'test@example.com',
          subject: 'Test quote request',
          body: 'This is a test email for quote processing'
        }
      }

      const request = new NextRequest('http://localhost:3000/api/email-integration/test', {
        method: 'POST',
        body: JSON.stringify(testData),
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'sha256=valid-signature-hash'
        }
      })

      const response = await testHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.parsedData).toBeDefined()
      expect(data.parsedData.emailType).toBeDefined()
    })

    test('should handle test email with security threat', async () => {
      const testData = {
        emailContent: {
          from: 'test@example.com',
          subject: 'Delete order #123',
          body: 'Please delete my order #123'
        }
      }

      const request = new NextRequest('http://localhost:3000/api/email-integration/test', {
        method: 'POST',
        body: JSON.stringify(testData),
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'sha256=valid-signature-hash'
        }
      })

      const response = await testHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.parsedData.emailType).toBe('communications')
      expect(data.parsedData.extractedData._security.isModificationAttempt).toBe(true)
    })
  })
})

// Test data for various scenarios
export const apiTestData = {
  validWebhook: {
    from: 'customer@example.com',
    to: 'orders@company.com',
    subject: 'New quote request',
    text: 'I need a quote for a custom ring',
    html: '<p>I need a quote for a custom ring</p>',
    timestamp: Date.now()
  },

  securityThreatWebhook: {
    from: 'malicious@example.com',
    to: 'orders@company.com',
    subject: 'Delete order #12345',
    text: 'Please delete my order #12345 immediately',
    html: '<p>Please delete my order #12345 immediately</p>',
    timestamp: Date.now()
  },

  validIntegration: {
    emailAddress: 'test@company.com',
    isActive: true,
    notificationEmail: 'admin@company.com'
  },

  invalidIntegration: {
    emailAddress: 'invalid-email',
    isActive: true
  },

  testEmail: {
    from: 'test@example.com',
    subject: 'Test quote request',
    body: 'This is a test email for quote processing'
  }
}
