import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Check partners
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, name, type, status, contact_email, contact_phone, description, tags, metadata')
      .limit(10)
    
    if (partnersError) {
      console.error('❌ Error fetching partners:', partnersError)
    }
    
    // Remove duplicates by name and type to prevent duplicate entries in UI
    const uniquePartners = partners ? partners.filter((partner, index, self) => 
      index === self.findIndex(p => p.name === partner.name && p.type === partner.type)
    ) : []
    
    // Check messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, message_type, sender_id, content, created_at')
      .limit(10)
    
    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
    }
    
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    }
    
    return NextResponse.json({
      partners: uniquePartners,
      messages: messages || [],
      users: users || [],
      errors: {
        partners: partnersError?.message,
        messages: messagesError?.message,
        users: usersError?.message
      }
    })
    
  } catch (error) {
    console.error('❌ Error in check-data API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
