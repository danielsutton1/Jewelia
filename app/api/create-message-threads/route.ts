import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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
    
    // Create message_threads table
    const { data: createTable, error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS message_threads (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
            team_member_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            last_message TEXT,
            last_message_at TIMESTAMP WITH TIME ZONE,
            unread_count INTEGER DEFAULT 0,
            type VARCHAR(20) NOT NULL CHECK (type IN ('external', 'internal')),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (createError) {
      console.error('Error creating message_threads table:', createError)
      return NextResponse.json({ 
        error: 'Failed to create message_threads table',
        details: createError.message 
      }, { status: 500 })
    }
    
    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_message_threads_user_id ON message_threads(user_id);
        CREATE INDEX IF NOT EXISTS idx_message_threads_partner_id ON message_threads(partner_id);
        CREATE INDEX IF NOT EXISTS idx_message_threads_team_member_id ON message_threads(team_member_id);
        CREATE INDEX IF NOT EXISTS idx_message_threads_type ON message_threads(type);
        CREATE INDEX IF NOT EXISTS idx_message_threads_status ON message_threads(status);
        CREATE INDEX IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at);
      `
    })
    
    if (indexError) {
      console.error('Error creating indexes:', indexError)
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;`
    })
    
    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
    }
    
    // Insert sample conversations
    const { data: conversations, error: insertError } = await supabase
      .from('message_threads')
      .insert([
        {
          user_id: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
          partner_id: 'd44f297b-a185-4cca-994f-8ebf182380cd',
          title: 'Gemstone Collection Inquiry',
          last_message: 'We are interested in your diamond collection. Can you send us your latest catalog?',
          last_message_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          unread_count: 3,
          type: 'external',
          status: 'active'
        },
        {
          user_id: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
          partner_id: 'bd180762-49e2-477d-b286-d7039b43cd83',
          title: 'Gold Supply Discussion',
          last_message: 'We need 2kg of 18k gold for our new collection. What is your current pricing and delivery timeline?',
          last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          unread_count: 15,
          type: 'external',
          status: 'active'
        },
        {
          user_id: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
          partner_id: 'a74c5094-1ca1-4efd-9a6f-6d857aad5651',
          title: 'Luxury Watch Partnership',
          last_message: 'hey',
          last_message_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          unread_count: 1,
          type: 'external',
          status: 'active'
        }
      ])
      .select()
    
    if (insertError) {
      console.error('Error inserting sample conversations:', insertError)
      return NextResponse.json({ 
        error: 'Failed to insert sample conversations',
        details: insertError.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message threads table created and sample conversations added',
      conversations: conversations?.length || 0
    })
    
  } catch (error) {
    console.error('❌ Error creating message threads:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
