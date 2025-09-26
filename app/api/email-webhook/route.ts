import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EmailProcessingService } from '@/lib/services/EmailProcessingService'
import { logger } from '@/lib/services/LoggingService'

// =====================================================
// EMAIL WEBHOOK API
// =====================================================
// This endpoint receives emails from email services and processes them

export async function POST(request: NextRequest) {
  try {
    logger.info('Email webhook received', { 
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      contentType: request.headers.get('content-type')
    })

    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-signature') || request.headers.get('x-hub-signature')
    
    // Verify webhook signature (implement based on your email service)
    if (!await verifyWebhookSignature(body, signature)) {
      logger.warn('Invalid webhook signature', { signature })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the email data
    const emailData = await parseEmailWebhook(JSON.parse(body))
    if (!emailData) {
      logger.warn('Failed to parse email webhook data')
      return NextResponse.json({ error: 'Invalid email data' }, { status: 400 })
    }

    logger.info('Processing email', { 
      emailId: emailData.id,
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    })

    // Initialize services
    const supabase = await createSupabaseServerClient()
    const emailProcessor = new EmailProcessingService(supabase)

    // Process the email
    const result = await emailProcessor.processEmail(emailData)

    // Log the result
    logger.info('Email processing result', {
      emailId: emailData.id,
      success: result.success,
      recordId: result.recordId,
      recordType: result.recordType,
      requiresReview: result.requiresReview
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Email processed successfully',
      data: {
        emailId: emailData.id,
        recordId: result.recordId,
        recordType: result.recordType,
        requiresReview: result.requiresReview
      }
    })

  } catch (error) {
    logger.error('Email webhook processing failed', { error })
    return NextResponse.json({
      success: false,
      error: 'Failed to process email',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    success: true,
    message: 'Email webhook endpoint is healthy',
    timestamp: new Date().toISOString()
  })
}

/**
 * Verify webhook signature
 */
async function verifyWebhookSignature(body: string, signature: string | null): Promise<boolean> {
  if (!signature) {
    // In development, allow requests without signature
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    return false
  }

  // Implement signature verification based on your email service
  // This is a placeholder - implement based on your email provider's requirements
  
  const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET
  if (!webhookSecret) {
    logger.warn('No webhook secret configured')
    return false
  }

  // Example for SendGrid webhook verification
  if (signature.startsWith('sha256=')) {
    const crypto = await import('crypto')
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')
    
    return signature === expectedSignature
  }

  return false
}

/**
 * Parse email webhook data from various email services
 */
async function parseEmailWebhook(webhookData: any): Promise<any> {
  try {
    // Handle different email service webhook formats
    
    // SendGrid format
    if (webhookData.from && webhookData.to && webhookData.subject) {
      return {
        id: webhookData.message_id || webhookData.id || generateEmailId(),
        from: webhookData.from,
        to: webhookData.to,
        subject: webhookData.subject,
        body: webhookData.text || webhookData.body || '',
        htmlBody: webhookData.html || webhookData.htmlBody,
        attachments: parseAttachments(webhookData.attachments),
        timestamp: webhookData.timestamp || new Date().toISOString()
      }
    }

    // Resend format
    if (webhookData.data && webhookData.data.from) {
      const data = webhookData.data
      return {
        id: data.id || generateEmailId(),
        from: data.from,
        to: data.to,
        subject: data.subject,
        body: data.text || data.body || '',
        htmlBody: data.html,
        attachments: parseAttachments(data.attachments),
        timestamp: data.created_at || new Date().toISOString()
      }
    }

    // Generic format
    if (webhookData.email) {
      const email = webhookData.email
      return {
        id: email.id || generateEmailId(),
        from: email.from,
        to: email.to,
        subject: email.subject,
        body: email.text || email.body || '',
        htmlBody: email.html,
        attachments: parseAttachments(email.attachments),
        timestamp: email.timestamp || new Date().toISOString()
      }
    }

    // If none of the above formats match, try to extract from the raw data
    return extractEmailFromRawData(webhookData)

  } catch (error) {
    logger.error('Failed to parse email webhook data', { error, webhookData })
    return null
  }
}

/**
 * Parse attachments from webhook data
 */
function parseAttachments(attachments: any): any[] {
  if (!attachments || !Array.isArray(attachments)) {
    return []
  }

  return attachments.map((attachment: any) => ({
    filename: attachment.filename || attachment.name,
    contentType: attachment.contentType || attachment.type || 'application/octet-stream',
    content: attachment.content || attachment.data || ''
  }))
}

/**
 * Extract email data from raw webhook data
 */
function extractEmailFromRawData(data: any): any {
  // Try to find email-like data in the webhook
  const emailData: any = {
    id: generateEmailId(),
    timestamp: new Date().toISOString()
  }

  // Look for common email fields
  const fields = ['from', 'to', 'subject', 'body', 'text', 'html', 'message']
  
  for (const field of fields) {
    if (data[field]) {
      switch (field) {
        case 'from':
          emailData.from = data[field]
          break
        case 'to':
          emailData.to = data[field]
          break
        case 'subject':
          emailData.subject = data[field]
          break
        case 'body':
        case 'text':
          emailData.body = data[field]
          break
        case 'html':
          emailData.htmlBody = data[field]
          break
      }
    }
  }

  // If we have at least from, to, and subject, consider it valid
  if (emailData.from && emailData.to && emailData.subject) {
    return emailData
  }

  return null
}

/**
 * Generate a unique email ID
 */
function generateEmailId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Test endpoint for development
 */
export async function PUT(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const body = await request.json()
    
    // Create a test email data structure
    const testEmailData = {
      id: generateEmailId(),
      from: body.from || 'test@example.com',
      to: body.to || 'quotes@company.com',
      subject: body.subject || 'Test Quote Request',
      body: body.body || 'This is a test email for quote processing.',
      htmlBody: body.htmlBody,
      attachments: body.attachments || [],
      timestamp: new Date().toISOString()
    }

    logger.info('Processing test email', { testEmailData })

    // Initialize services
    const supabase = await createSupabaseServerClient()
    const emailProcessor = new EmailProcessingService(supabase)

    // Process the test email
    const result = await emailProcessor.processEmail(testEmailData)

    return NextResponse.json({
      success: true,
      message: 'Test email processed',
      data: {
        input: testEmailData,
        result
      }
    })

  } catch (error) {
    logger.error('Test email processing failed', { error })
    return NextResponse.json({
      success: false,
      error: 'Failed to process test email',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
