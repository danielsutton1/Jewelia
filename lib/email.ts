// import { createClient } from '@supabase/supabase-js'

type EmailOptions = {
  to: string
  subject: string
  template: string
  data: any
}

export async function sendEmail({ to, subject, template, data }: EmailOptions) {
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // )

  // Store email in database for tracking
  // const { error } = await supabase
  //   .from('emails')
  //   .insert({
  //     to,
  //     subject,
  //     template,
  //     data,
  //     status: 'pending',
  //     created_at: new Date().toISOString(),
  //   })

  // if (error) {
  //   console.error('Error storing email:', error)
  //   throw error
  // }

  // In production, this would integrate with an email service provider
  // For now, we'll just log it
  console.log('Email would be sent:', { to, subject, template, data })
} 