import { EmailParsingService } from '@/lib/services/EmailParsingService'
import { EmailProcessingService } from '@/lib/services/EmailProcessingService'
import { EmailNotificationService } from '@/lib/services/EmailNotificationService'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null }))
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
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }))
}

describe('Email Integration System - Comprehensive Test Suite', () => {
  let parsingService: EmailParsingService
  let processingService: EmailProcessingService
  let notificationService: EmailNotificationService

  beforeEach(() => {
    parsingService = new EmailParsingService(mockSupabase)
    processingService = new EmailProcessingService(mockSupabase)
    notificationService = new EmailNotificationService(mockSupabase)
  })

  describe('Security Features - CREATE ONLY Operations', () => {
    test('should block DELETE operations', async () => {
      const emailData = {
        id: 'test-1',
        from: 'customer@example.com',
        subject: 'Please delete order #12345',
        body: 'I want to cancel and delete my order #12345',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.emailType).toBe('communications')
      expect(result.confidence).toBe(0.1)
      expect(result.extractedData._security.isModificationAttempt).toBe(true)
      expect(result.extractedData._security.riskLevel).toBe('CRITICAL')
      expect(result.extractedData._security.detectedActions).toContain('HIGH_RISK: delete')
    })

    test('should block UPDATE operations', async () => {
      const emailData = {
        id: 'test-2',
        from: 'customer@example.com',
        subject: 'Update my quote price',
        body: 'Please change the price of quote #456 from $1000 to $800',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.emailType).toBe('communications')
      expect(result.extractedData._security.isModificationAttempt).toBe(true)
      expect(result.extractedData._security.riskLevel).toBe('HIGH')
      expect(result.extractedData._security.detectedActions).toContain('HIGH_RISK: change price')
    })

    test('should block MODIFY operations', async () => {
      const emailData = {
        id: 'test-3',
        from: 'customer@example.com',
        subject: 'Modify customer information',
        body: 'Please update my phone number from 555-1234 to 555-5678',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.emailType).toBe('communications')
      expect(result.extractedData._security.isModificationAttempt).toBe(true)
      expect(result.extractedData._security.riskLevel).toBe('MEDIUM')
      expect(result.extractedData._security.detectedActions).toContain('MEDIUM_RISK: modify')
    })

    test('should allow CREATE operations', async () => {
      const emailData = {
        id: 'test-4',
        from: 'customer@example.com',
        subject: 'New quote request',
        body: 'I need a quote for a custom wedding ring. Budget is $2000.',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.emailType).toBe('quotes')
      expect(result.confidence).toBeGreaterThan(0.7)
      expect(result.extractedData._security).toBeUndefined()
      expect(result.requiresReview).toBe(false)
    })
  })

  describe('AI Email Parsing - All Record Types', () => {
    test('should correctly identify QUOTE emails', async () => {
      const testCases = [
        {
          subject: 'Quote for wedding ring',
          body: 'I need pricing for a custom engagement ring',
          expectedType: 'quotes'
        },
        {
          subject: 'Pricing request',
          body: 'What would a diamond necklace cost?',
          expectedType: 'quotes'
        },
        {
          subject: 'Estimate needed',
          body: 'Can you give me an estimate for jewelry repair?',
          expectedType: 'quotes'
        }
      ]

      for (const testCase of testCases) {
        const emailData = {
          id: `test-quote-${Date.now()}`,
          from: 'customer@example.com',
          subject: testCase.subject,
          body: testCase.body,
          timestamp: new Date().toISOString()
        }

        const result = await parsingService.parseEmail(emailData, 'test-tenant')
        expect(result.emailType).toBe(testCase.expectedType)
      }
    })

    test('should correctly identify ORDER emails', async () => {
      const testCases = [
        {
          subject: 'New order',
          body: 'I want to place an order for the ring we discussed',
          expectedType: 'orders'
        },
        {
          subject: 'Purchase request',
          body: 'I would like to buy the necklace from your catalog',
          expectedType: 'orders'
        }
      ]

      for (const testCase of testCases) {
        const emailData = {
          id: `test-order-${Date.now()}`,
          from: 'customer@example.com',
          subject: testCase.subject,
          body: testCase.body,
          timestamp: new Date().toISOString()
        }

        const result = await parsingService.parseEmail(emailData, 'test-tenant')
        expect(result.emailType).toBe(testCase.expectedType)
      }
    })

    test('should correctly identify REPAIR emails', async () => {
      const testCases = [
        {
          subject: 'Jewelry repair needed',
          body: 'My ring broke and needs to be fixed',
          expectedType: 'repairs'
        },
        {
          subject: 'Broken chain',
          body: 'The chain on my necklace snapped, can you repair it?',
          expectedType: 'repairs'
        }
      ]

      for (const testCase of testCases) {
        const emailData = {
          id: `test-repair-${Date.now()}`,
          from: 'customer@example.com',
          subject: testCase.subject,
          body: testCase.body,
          timestamp: new Date().toISOString()
        }

        const result = await parsingService.parseEmail(emailData, 'test-tenant')
        expect(result.emailType).toBe(testCase.expectedType)
      }
    })

    test('should correctly identify TRADE-IN emails', async () => {
      const testCases = [
        {
          subject: 'Trade in my old jewelry',
          body: 'I have some old gold jewelry I want to trade in',
          expectedType: 'trade_in'
        },
        {
          subject: 'Sell my ring',
          body: 'I want to sell my engagement ring for cash',
          expectedType: 'trade_in'
        }
      ]

      for (const testCase of testCases) {
        const emailData = {
          id: `test-trade-${Date.now()}`,
          from: 'customer@example.com',
          subject: testCase.subject,
          body: testCase.body,
          timestamp: new Date().toISOString()
        }

        const result = await parsingService.parseEmail(emailData, 'test-tenant')
        expect(result.emailType).toBe(testCase.expectedType)
      }
    })
  })

  describe('Data Extraction Accuracy', () => {
    test('should extract customer information correctly', async () => {
      const emailData = {
        id: 'test-extraction',
        from: 'john.doe@example.com',
        subject: 'Quote request',
        body: 'Hi, my name is John Doe and my phone number is (555) 123-4567. I need a quote for a wedding ring.',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.extractedData.customer_name).toContain('John')
      expect(result.extractedData.phone).toContain('555')
      expect(result.extractedData.email).toBe('john.doe@example.com')
    })

    test('should extract monetary amounts', async () => {
      const emailData = {
        id: 'test-amount',
        from: 'customer@example.com',
        subject: 'Quote request',
        body: 'I have a budget of $2,500 for a custom ring',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.extractedData.amount).toBe(2500)
      expect(result.extractedData.budget).toBe(2500)
    })

    test('should extract record IDs for security logging', async () => {
      const emailData = {
        id: 'test-ids',
        from: 'customer@example.com',
        subject: 'Regarding order #12345',
        body: 'I have a question about my order #12345 and quote #67890',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.extractedData.mentioned_record_ids).toContain('12345')
      expect(result.extractedData.mentioned_record_ids).toContain('67890')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed email data', async () => {
      const emailData = {
        id: 'test-malformed',
        from: '',
        subject: '',
        body: '',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.emailType).toBe('general')
      expect(result.confidence).toBeLessThan(0.5)
      expect(result.requiresReview).toBe(true)
    })

    test('should handle very long email content', async () => {
      const longBody = 'A'.repeat(10000) + ' I need a quote for a ring'
      const emailData = {
        id: 'test-long',
        from: 'customer@example.com',
        subject: 'Quote request',
        body: longBody,
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.emailType).toBe('quotes')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    test('should handle special characters and emojis', async () => {
      const emailData = {
        id: 'test-special',
        from: 'customer@example.com',
        subject: '💍 Ring quote needed',
        body: 'I need a quote for a 💍 ring! My budget is $2,000 💰',
        timestamp: new Date().toISOString()
      }

      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      
      expect(result.emailType).toBe('quotes')
      expect(result.extractedData.amount).toBe(2000)
    })
  })

  describe('Database Operations - CREATE ONLY', () => {
    test('should create new quote record', async () => {
      const emailData = {
        id: 'test-create-quote',
        from: 'customer@example.com',
        subject: 'New quote request',
        body: 'I need a quote for a custom ring',
        timestamp: new Date().toISOString()
      }

      const parsedData = await parsingService.parseEmail(emailData, 'test-tenant')
      const settings = {
        id: 'test-settings',
        tenantId: 'test-tenant',
        userId: 'test-user',
        emailAddress: 'test@company.com',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await processingService.processEmailWithData(emailData, parsedData, settings)
      
      expect(result.success).toBe(true)
      expect(result.recordType).toBe('quote')
      expect(result.recordId).toBe('test-id')
    })

    test('should create communication thread for existing order mention', async () => {
      const emailData = {
        id: 'test-existing-order',
        from: 'customer@example.com',
        subject: 'Order #12345 status',
        body: 'I want to check the status of my order #12345',
        timestamp: new Date().toISOString()
      }

      const parsedData = await parsingService.parseEmail(emailData, 'test-tenant')
      const settings = {
        id: 'test-settings',
        tenantId: 'test-tenant',
        userId: 'test-user',
        emailAddress: 'test@company.com',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await processingService.processEmailWithData(emailData, parsedData, settings)
      
      expect(result.success).toBe(true)
      expect(result.recordType).toBe('communication')
      expect(result.message).toContain('Communication thread created')
      expect(result.message).toContain('no order was modified')
    })
  })

  describe('Performance and Scalability', () => {
    test('should process emails within acceptable time limits', async () => {
      const emailData = {
        id: 'test-performance',
        from: 'customer@example.com',
        subject: 'Quote request',
        body: 'I need a quote for a custom ring',
        timestamp: new Date().toISOString()
      }

      const startTime = Date.now()
      const result = await parsingService.parseEmail(emailData, 'test-tenant')
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
      expect(result.emailType).toBe('quotes')
    })

    test('should handle concurrent email processing', async () => {
      const emails = Array.from({ length: 10 }, (_, i) => ({
        id: `test-concurrent-${i}`,
        from: 'customer@example.com',
        subject: `Quote request ${i}`,
        body: `I need a quote for item ${i}`,
        timestamp: new Date().toISOString()
      }))

      const promises = emails.map(email => 
        parsingService.parseEmail(email, 'test-tenant')
      )

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result.emailType).toBe('quotes')
        expect(result.confidence).toBeGreaterThan(0.5)
      })
    })
  })
})

// Integration test data
export const testEmailData = {
  validQuote: {
    id: 'test-valid-quote',
    from: 'customer@example.com',
    subject: 'Quote for wedding ring',
    body: 'Hi, I need a quote for a custom wedding ring. My budget is $3,000. Please call me at (555) 123-4567.',
    timestamp: new Date().toISOString()
  },
  
  validOrder: {
    id: 'test-valid-order',
    from: 'customer@example.com',
    subject: 'New order',
    body: 'I would like to place an order for the ring we discussed. My name is Jane Smith.',
    timestamp: new Date().toISOString()
  },
  
  validRepair: {
    id: 'test-valid-repair',
    from: 'customer@example.com',
    subject: 'Jewelry repair',
    body: 'My necklace chain broke and needs repair. Can you help?',
    timestamp: new Date().toISOString()
  },
  
  securityThreat: {
    id: 'test-security-threat',
    from: 'malicious@example.com',
    subject: 'Delete order #12345',
    body: 'Please delete my order #12345 immediately',
    timestamp: new Date().toISOString()
  },
  
  modificationAttempt: {
    id: 'test-modification',
    from: 'customer@example.com',
    subject: 'Update my quote',
    body: 'Please change the price of quote #456 from $1000 to $800',
    timestamp: new Date().toISOString()
  }
}
