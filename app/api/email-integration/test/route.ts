import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserContextFromRequest } from '@/lib/services/UserContextService'
import { EmailProcessingService } from '@/lib/services/EmailProcessingService'
import { EmailNotificationService } from '@/lib/services/EmailNotificationService'
import { z } from 'zod'

// =====================================================
// EMAIL INTEGRATION TEST API
// =====================================================
// This endpoint allows testing email integration functionality

const TestEmailSchema = z.object({
  integrationId: z.string().uuid(),
  testData: z.object({
    from: z.string().email(),
    subject: z.string().min(1),
    body: z.string().min(1),
    emailType: z.enum(['quotes', 'orders', 'repairs', 'communications', 'general']).optional()
  })
})

export async function POST(request: NextRequest) {
  try {
    // Get user context and validate access
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to test email integration'
      }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = TestEmailSchema.parse(body)

    const supabase = await createSupabaseServerClient()

    // Get the email integration settings
    const { data: integration, error: integrationError } = await supabase
      .from('email_integration_settings')
      .select('*')
      .eq('id', validatedData.integrationId)
      .eq('tenant_id', userContext.tenantId)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ 
        success: false,
        error: 'Email integration not found or access denied'
      }, { status: 404 })
    }

    // Create test email data
    const testEmailData = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: validatedData.testData.from,
      to: integration.email_address,
      subject: validatedData.testData.subject,
      body: validatedData.testData.body,
      timestamp: new Date().toISOString()
    }

    // Process the test email
    const emailProcessor = new EmailProcessingService(supabase)
    const processingResult = await emailProcessor.processEmail(testEmailData)

    // Send test notification if configured
    if (integration.notification_email) {
      const notificationService = new EmailNotificationService(supabase)
      await notificationService.sendProcessingNotification({
        recipientEmail: integration.notification_email,
        originalEmail: {
          from: testEmailData.from,
          subject: testEmailData.subject,
          timestamp: testEmailData.timestamp
        },
        processingResult,
        extractedData: processingResult.extractedData
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test email processed successfully',
      data: {
        testEmail: testEmailData,
        processingResult,
        integration: {
          emailAddress: integration.email_address,
          emailType: integration.email_type
        }
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user context and validate access
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to access test functionality'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('integrationId')

    if (!integrationId) {
      return NextResponse.json({ 
        success: false,
        error: 'Integration ID is required'
      }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Get the email integration settings
    const { data: integration, error: integrationError } = await supabase
      .from('email_integration_settings')
      .select('*')
      .eq('id', integrationId)
      .eq('tenant_id', userContext.tenantId)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ 
        success: false,
        error: 'Email integration not found or access denied'
      }, { status: 404 })
    }

    // Generate sample test data based on email type
    const sampleTestData = generateSampleTestData(integration.email_type)

    return NextResponse.json({
      success: true,
      data: {
        integration: {
          id: integration.id,
          emailAddress: integration.email_address,
          emailType: integration.email_type
        },
        sampleTestData
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * Generate sample test data based on email type
 */
function generateSampleTestData(emailType: string) {
  const baseData = {
    from: 'test@example.com',
    subject: '',
    body: ''
  }

  switch (emailType) {
    case 'quotes':
      return {
        ...baseData,
        subject: 'Quote Request for Custom Wedding Ring',
        body: `Hi there,

I'm interested in getting a quote for a custom wedding ring. Here are the details:

Customer: John Smith
Phone: 555-123-4567
Email: john.smith@example.com
Budget: $2,500
Timeline: 3 weeks

Description: I'm looking for a 14k gold wedding band with a small diamond inset. Size 8.5. Something elegant but not too flashy.

Please let me know if you need any additional information.

Thanks,
John Smith`
      }

    case 'orders':
      return {
        ...baseData,
        subject: 'Order #12345 Status Update',
        body: `Hello,

I wanted to follow up on order #12345. The customer is asking about the status and when they can expect delivery.

Customer: Jane Doe
Order Number: 12345
Original Order Date: January 15, 2025

Could you please provide an update on the current status and estimated delivery date?

Thanks,
Customer Service Team`
      }

    case 'repairs':
      return {
        ...baseData,
        subject: 'Repair Request - Broken Chain',
        body: `Hi,

I have a gold chain that needs repair. The clasp is broken and needs to be replaced.

Customer: Mike Johnson
Phone: 555-987-6543
Email: mike.johnson@example.com

Description: 18k gold chain, approximately 20 inches long. The clasp mechanism is broken and won't close properly.

Timeline: Not urgent, but would like it back within 2 weeks if possible.

Please let me know the cost and timeline for this repair.

Thanks,
Mike Johnson`
      }

    case 'communications':
      return {
        ...baseData,
        subject: 'Question about Jewelry Care',
        body: `Hello,

I recently purchased a piece of jewelry from your store and have a question about proper care and maintenance.

Customer: Sarah Wilson
Phone: 555-456-7890
Email: sarah.wilson@example.com

Question: I bought a pearl necklace last month and want to make sure I'm taking care of it properly. What's the best way to clean and store pearls?

Also, I'm interested in learning about your other jewelry care services.

Thanks for your help,
Sarah Wilson`
      }

    default:
      return {
        ...baseData,
        subject: 'General Inquiry',
        body: `Hello,

I have a general question about your services and would like to learn more.

Customer: Alex Brown
Phone: 555-321-9876
Email: alex.brown@example.com

Inquiry: I'm interested in your custom jewelry services and would like to schedule a consultation to discuss a potential project.

Please let me know your availability and what information you might need from me.

Thanks,
Alex Brown`
      }
  }
}
