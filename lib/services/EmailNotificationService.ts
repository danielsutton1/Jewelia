import { logger } from '@/lib/services/LoggingService'

// =====================================================
// EMAIL NOTIFICATION SERVICE
// =====================================================
// This service sends email notifications for email processing results

export interface EmailNotificationData {
  to: string
  subject: string
  htmlContent: string
  textContent: string
  from?: string
  replyTo?: string
}

export interface ProcessingNotificationData {
  recipientEmail: string
  originalEmail: {
    from: string
    subject: string
    timestamp: string
  }
  processingResult: {
    success: boolean
    recordId?: string
    recordType?: string
    message: string
    requiresReview: boolean
  }
  extractedData?: Record<string, any>
}

export class EmailNotificationService {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  /**
   * Send processing result notification
   */
  async sendProcessingNotification(data: ProcessingNotificationData): Promise<boolean> {
    try {
      const { recipientEmail, originalEmail, processingResult, extractedData } = data

      const subject = this.generateNotificationSubject(processingResult, originalEmail)
      const htmlContent = this.generateNotificationHTML(originalEmail, processingResult, extractedData)
      const textContent = this.generateNotificationText(originalEmail, processingResult, extractedData)

      const notificationData: EmailNotificationData = {
        to: recipientEmail,
        subject,
        htmlContent,
        textContent,
        from: process.env.FROM_EMAIL || 'noreply@jewelia.com',
        replyTo: process.env.REPLY_TO_EMAIL
      }

      return await this.sendEmail(notificationData)

    } catch (error) {
      logger.error('Failed to send processing notification', { error, data })
      return false
    }
  }

  /**
   * Send welcome email for new email integration
   */
  async sendWelcomeEmail(emailAddress: string, emailType: string): Promise<boolean> {
    try {
      const subject = `Email Integration Activated - ${emailType} Processing`
      const htmlContent = this.generateWelcomeHTML(emailAddress, emailType)
      const textContent = this.generateWelcomeText(emailAddress, emailType)

      const notificationData: EmailNotificationData = {
        to: emailAddress,
        subject,
        htmlContent,
        textContent,
        from: process.env.FROM_EMAIL || 'noreply@jewelia.com'
      }

      return await this.sendEmail(notificationData)

    } catch (error) {
      logger.error('Failed to send welcome email', { error, emailAddress, emailType })
      return false
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to: string, emailType: string): Promise<boolean> {
    try {
      const subject = `Test Email - ${emailType} Processing`
      const htmlContent = this.generateTestEmailHTML(emailType)
      const textContent = this.generateTestEmailText(emailType)

      const notificationData: EmailNotificationData = {
        to,
        subject,
        htmlContent,
        textContent,
        from: process.env.FROM_EMAIL || 'noreply@jewelia.com'
      }

      return await this.sendEmail(notificationData)

    } catch (error) {
      logger.error('Failed to send test email', { error, to, emailType })
      return false
    }
  }

  /**
   * Send email using configured email service
   */
  private async sendEmail(data: EmailNotificationData): Promise<boolean> {
    try {
      // Try SendGrid first
      if (process.env.SENDGRID_API_KEY) {
        return await this.sendViaSendGrid(data)
      }

      // Try Resend
      if (process.env.RESEND_API_KEY) {
        return await this.sendViaResend(data)
      }

      // Fallback to Supabase Edge Function
      return await this.sendViaSupabase(data)

    } catch (error) {
      logger.error('Failed to send email', { error, data })
      return false
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(data: EmailNotificationData): Promise<boolean> {
    try {
      const sgMail = await import('@sendgrid/mail')
      sgMail.default.setApiKey(process.env.SENDGRID_API_KEY!)

      const msg = {
        to: data.to,
        from: data.from || process.env.FROM_EMAIL!,
        subject: data.subject,
        text: data.textContent,
        html: data.htmlContent,
        replyTo: data.replyTo
      }

      await sgMail.default.send(msg)
      logger.info('Email sent via SendGrid', { to: data.to, subject: data.subject })
      return true

    } catch (error) {
      logger.error('SendGrid email failed', { error })
      return false
    }
  }

  /**
   * Send email via Resend
   */
  private async sendViaResend(data: EmailNotificationData): Promise<boolean> {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const result = await resend.emails.send({
        from: data.from || process.env.FROM_EMAIL!,
        to: data.to,
        subject: data.subject,
        html: data.htmlContent,
        text: data.textContent,
        replyTo: data.replyTo
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      logger.info('Email sent via Resend', { to: data.to, subject: data.subject })
      return true

    } catch (error) {
      logger.error('Resend email failed', { error })
      return false
    }
  }

  /**
   * Send email via Supabase Edge Function
   */
  private async sendViaSupabase(data: EmailNotificationData): Promise<boolean> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-email', {
        body: {
          to: data.to,
          from: data.from || process.env.FROM_EMAIL,
          subject: data.subject,
          html: data.htmlContent,
          text: data.textContent,
          replyTo: data.replyTo
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      logger.info('Email sent via Supabase', { to: data.to, subject: data.subject })
      return true

    } catch (error) {
      logger.error('Supabase email failed', { error })
      return false
    }
  }

  /**
   * Generate notification subject
   */
  private generateNotificationSubject(result: any, originalEmail: any): string {
    if (result.success) {
      return `✅ ${result.recordType?.toUpperCase()} Created - ${originalEmail.subject}`
    } else {
      return `❌ Email Processing Failed - ${originalEmail.subject}`
    }
  }

  /**
   * Generate HTML notification content
   */
  private generateNotificationHTML(originalEmail: any, result: any, extractedData?: any): string {
    const statusIcon = result.success ? '✅' : '❌'
    const statusColor = result.success ? '#10b981' : '#ef4444'
    const statusText = result.success ? 'Successfully Processed' : 'Processing Failed'

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Processing Notification</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .success { background: #d1fae5; color: #065f46; }
          .error { background: #fee2e2; color: #991b1b; }
          .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusIcon} Email Processing Notification</h1>
            <p>Your email has been ${result.success ? 'processed' : 'failed to process'}</p>
          </div>
          
          <div class="content">
            <div class="status ${result.success ? 'success' : 'error'}">
              ${statusText}
            </div>
            
            <div class="info-box">
              <h3>Original Email Details</h3>
              <div class="field">
                <span class="label">From:</span>
                <span class="value">${originalEmail.from}</span>
              </div>
              <div class="field">
                <span class="label">Subject:</span>
                <span class="value">${originalEmail.subject}</span>
              </div>
              <div class="field">
                <span class="label">Received:</span>
                <span class="value">${new Date(originalEmail.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <div class="info-box">
              <h3>Processing Result</h3>
              <div class="field">
                <span class="label">Status:</span>
                <span class="value">${result.message}</span>
              </div>
              ${result.recordId ? `
                <div class="field">
                  <span class="label">Record ID:</span>
                  <span class="value">${result.recordId}</span>
                </div>
              ` : ''}
              ${result.recordType ? `
                <div class="field">
                  <span class="label">Record Type:</span>
                  <span class="value">${result.recordType}</span>
                </div>
              ` : ''}
              ${result.requiresReview ? `
                <div class="field">
                  <span class="label">⚠️ Review Required:</span>
                  <span class="value">This record requires manual review</span>
                </div>
              ` : ''}
            </div>
            
            ${extractedData && Object.keys(extractedData).length > 0 ? `
              <div class="info-box">
                <h3>Extracted Information</h3>
                ${Object.entries(extractedData).map(([key, value]) => `
                  <div class="field">
                    <span class="label">${key.replace(/_/g, ' ').toUpperCase()}:</span>
                    <span class="value">${value}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <div class="footer">
              <p>This is an automated notification from Jewelia CRM</p>
              <p>If you have any questions, please contact your system administrator</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate text notification content
   */
  private generateNotificationText(originalEmail: any, result: any, extractedData?: any): string {
    const statusIcon = result.success ? '✅' : '❌'
    const statusText = result.success ? 'Successfully Processed' : 'Processing Failed'

    let text = `
${statusIcon} EMAIL PROCESSING NOTIFICATION
${statusText}

ORIGINAL EMAIL DETAILS:
From: ${originalEmail.from}
Subject: ${originalEmail.subject}
Received: ${new Date(originalEmail.timestamp).toLocaleString()}

PROCESSING RESULT:
Status: ${result.message}
${result.recordId ? `Record ID: ${result.recordId}` : ''}
${result.recordType ? `Record Type: ${result.recordType}` : ''}
${result.requiresReview ? '⚠️ Review Required: This record requires manual review' : ''}
`

    if (extractedData && Object.keys(extractedData).length > 0) {
      text += '\nEXTRACTED INFORMATION:\n'
      Object.entries(extractedData).forEach(([key, value]) => {
        text += `${key.replace(/_/g, ' ').toUpperCase()}: ${value}\n`
      })
    }

    text += `
---
This is an automated notification from Jewelia CRM
If you have any questions, please contact your system administrator
`

    return text
  }

  /**
   * Generate welcome email HTML
   */
  private generateWelcomeHTML(emailAddress: string, emailType: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Integration Activated</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-box { background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Email Integration Activated!</h1>
            <p>Your email integration is now ready to process ${emailType} emails</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <h3>✅ Integration Active</h3>
              <p>Your email address <strong>${emailAddress}</strong> is now configured to automatically process ${emailType} emails.</p>
            </div>
            
            <div class="info-box">
              <h3>How It Works</h3>
              <ol>
                <li>Forward emails to <strong>${emailAddress}</strong></li>
                <li>Our AI will analyze the email content</li>
                <li>Automatically create ${emailType} records in your CRM</li>
                <li>You'll receive a confirmation email with the results</li>
              </ol>
            </div>
            
            <div class="info-box">
              <h3>Next Steps</h3>
              <ul>
                <li>Set up email forwarding from your main email address</li>
                <li>Test the integration by forwarding a sample email</li>
                <li>Monitor the processing logs in your CRM dashboard</li>
                <li>Contact support if you need any assistance</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Jewelia CRM</p>
              <p>Thank you for using our email integration service!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate welcome email text
   */
  private generateWelcomeText(emailAddress: string, emailType: string): string {
    return `
🎉 EMAIL INTEGRATION ACTIVATED!

Your email integration is now ready to process ${emailType} emails.

INTEGRATION DETAILS:
Email Address: ${emailAddress}
Type: ${emailType}
Status: Active

HOW IT WORKS:
1. Forward emails to ${emailAddress}
2. Our AI will analyze the email content
3. Automatically create ${emailType} records in your CRM
4. You'll receive a confirmation email with the results

NEXT STEPS:
- Set up email forwarding from your main email address
- Test the integration by forwarding a sample email
- Monitor the processing logs in your CRM dashboard
- Contact support if you need any assistance

---
This is an automated notification from Jewelia CRM
Thank you for using our email integration service!
    `
  }

  /**
   * Generate test email HTML
   */
  private generateTestEmailHTML(emailType: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .test-box { background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Test Email</h1>
            <p>Testing ${emailType} email integration</p>
          </div>
          
          <div class="content">
            <div class="test-box">
              <h3>🧪 Integration Test</h3>
              <p>This is a test email to verify that your ${emailType} email integration is working correctly.</p>
              <p>If you received this email, your integration is properly configured!</p>
            </div>
            
            <div class="footer">
              <p>This is a test email from Jewelia CRM</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate test email text
   */
  private generateTestEmailText(emailType: string): string {
    return `
📧 TEST EMAIL

Testing ${emailType} email integration

🧪 INTEGRATION TEST
This is a test email to verify that your ${emailType} email integration is working correctly.

If you received this email, your integration is properly configured!

---
This is a test email from Jewelia CRM
    `
  }
}