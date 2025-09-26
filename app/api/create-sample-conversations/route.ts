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
    
    // First, let's check if message_threads table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('message_threads')
      .select('id')
      .limit(1)
    
    if (tableError && tableError.code === 'PGRST116') {
      // Table doesn't exist, create it first
      console.log('Creating message_threads table...')
      
      // We'll create the table using a migration approach
      // For now, let's just return an error asking to run the migration
      return NextResponse.json({
        error: 'message_threads table does not exist. Please run the migration first.',
        suggestion: 'Run: npx supabase db push'
      }, { status: 400 })
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
      message: 'Sample conversations created successfully',
      conversations: conversations?.length || 0
    })
    
  } catch (error) {
    console.error('❌ Error creating sample conversations:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
