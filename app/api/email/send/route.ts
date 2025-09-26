import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid only if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  from: z.string().email().optional(),
  template_id: z.string().optional(),
  dynamic_template_data: z.record(z.any()).optional(),
  attachments: z.array(z.object({
    content: z.string(),
    filename: z.string(),
    type: z.string().optional(),
    disposition: z.string().optional(),
  })).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate input
    const validatedData = SendEmailSchema.parse(body)
    
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    // Get user profile for tenant_id
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    const tenant_id = userProfile?.tenant_id

    try {
      // Prepare email message
      const msg: any = {
        to: validatedData.to,
        from: validatedData.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@jewelia.com',
        subject: validatedData.subject,
      }

      // Use template or direct content
      if (validatedData.template_id) {
        msg.templateId = validatedData.template_id
        if (validatedData.dynamic_template_data) {
          msg.dynamicTemplateData = validatedData.dynamic_template_data
        }
      } else {
        if (validatedData.text) msg.text = validatedData.text
        if (validatedData.html) msg.html = validatedData.html
      }

      // Add attachments if provided
      if (validatedData.attachments && validatedData.attachments.length > 0) {
        msg.attachments = validatedData.attachments
      }

      // Send email via SendGrid
      const response = await sgMail.send(msg)

      // Store email record in database
      const { data: emailRecord, error: dbError } = await supabase
        .from('emails')
        .insert([{
          to: validatedData.to,
          subject: validatedData.subject,
          template: validatedData.template_id || 'direct',
          data: validatedData.dynamic_template_data || {},
          status: 'sent',
          user_id: user.id,
          tenant_id: tenant_id,
          sendgrid_message_id: response[0]?.headers['x-message-id'] || null,
        }])
        .select()
        .single()

      if (dbError) {
        console.error('Email record creation error:', dbError)
        // Email was sent but record failed - this is a partial success
        return NextResponse.json({
          success: true,
          data: {
            message_id: response[0]?.headers['x-message-id'],
            message: 'Email sent but record creation failed'
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          message_id: response[0]?.headers['x-message-id'],
          email_record: emailRecord,
          message: 'Email sent successfully'
        }
      })

    } catch (sendgridError: any) {
      console.error('SendGrid error:', sendgridError)
      
      // Store failed email record
      await supabase
        .from('emails')
        .insert([{
          to: validatedData.to,
          subject: validatedData.subject,
          template: validatedData.template_id || 'direct',
          data: validatedData.dynamic_template_data || {},
          status: 'failed',
          user_id: user.id,
          tenant_id: tenant_id,
          error_message: sendgridError.message,
        }])

      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: sendgridError.message 
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Send email error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 