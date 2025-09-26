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
    
    // Add contact_name column to partners table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE partners 
        ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
        
        CREATE INDEX IF NOT EXISTS idx_partners_contact_name ON partners(contact_name);
      `
    })
    
    if (error) {
      console.error('Error adding contact_name column:', error)
      return NextResponse.json({ 
        error: 'Failed to add contact_name column',
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'contact_name column added successfully',
      data
    })
    
  } catch (error) {
    console.error('❌ Error adding contact_name column:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
