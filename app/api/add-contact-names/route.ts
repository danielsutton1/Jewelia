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
    
    // Add contact names to existing partners
    const updates = [
      {
        name: 'Gemstone Suppliers Inc.',
        contact_name: 'Sarah Goldstein',
        contact_email: 'sarah.goldstein@gemstonesuppliers.com'
      },
      {
        name: 'Precious Metals Co.',
        contact_name: 'Michael Chen',
        contact_email: 'michael.chen@preciousmetals.com'
      },
      {
        name: 'Jewelry Crafting Studio',
        contact_name: 'Emma Rodriguez',
        contact_email: 'emma.rodriguez@jewelrycrafting.com'
      },
      {
        name: 'Luxury Watch Partners',
        contact_name: 'David Thompson',
        contact_email: 'david.thompson@luxurywatch.com'
      }
    ]
    
    const results = []
    
    for (const update of updates) {
      const { data, error } = await supabase
        .from('partners')
        .update({
          contact_name: update.contact_name,
          contact_email: update.contact_email
        })
        .eq('name', update.name)
        .select()
      
      if (error) {
        console.error(`Error updating ${update.name}:`, error)
        results.push({ name: update.name, error: error.message })
      } else {
        results.push({ name: update.name, success: true, data })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Contact names added successfully',
      results
    })
    
  } catch (error) {
    console.error('❌ Error adding contact names:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
