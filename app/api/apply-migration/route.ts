import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results = []

    // Step 1: Create designs table
    try {
      // First check if table exists by trying to select from it
      const { data: existingDesigns, error: selectError } = await supabase
        .from('designs')
        .select('id')
        .limit(1)

      if (selectError && selectError.message.includes('relation "public.designs" does not exist')) {
        // Table doesn't exist, we need to create it
        // Since we can't create tables directly, we'll work with what we have
        results.push({
          step: 'designs_table',
          success: false,
          error: 'Table does not exist and cannot be created via API'
        })
      } else {
        results.push({
          step: 'designs_table',
          success: true,
          error: null
        })
      }
    } catch (e: any) {
      results.push({
        step: 'designs_table',
        success: false,
        error: e.message
      })
    }

    // Step 2: Create quotes table
    try {
      const { data: existingQuotes, error: selectError } = await supabase
        .from('quotes')
        .select('id')
        .limit(1)

      if (selectError && selectError.message.includes('relation "public.quotes" does not exist')) {
        results.push({
          step: 'quotes_table',
          success: false,
          error: 'Table does not exist and cannot be created via API'
        })
      } else {
        results.push({
          step: 'quotes_table',
          success: true,
          error: null
        })
      }
    } catch (e: any) {
      results.push({
        step: 'quotes_table',
        success: false,
        error: e.message
      })
    }

    // Step 3: Add sample data to call_logs if it's empty
    try {
      const { data: callLogs, error: callLogsError } = await supabase
        .from('call_logs')
        .select('id')
        .limit(1)

      if (callLogsError) {
        results.push({
          step: 'call_logs_sample_data',
          success: false,
          error: callLogsError.message
        })
      } else if (!callLogs || callLogs.length === 0) {
        // Add sample call logs
        const sampleCallLogs = Array.from({ length: 5 }, (_, i) => ({
          call_number: `CL-${String(i + 1).padStart(6, '0')}`,
          customer_name: `Customer ${i + 1}`,
          staff_name: `Staff Member ${(i % 3) + 1}`,
          call_type: 'incoming',
          duration: '5 minutes',
          outcome: 'follow_up_required',
          notes: `Customer ${i + 1} interested in custom jewelry design`,
          status: 'completed'
        }))

        const { data: insertedCallLogs, error: insertError } = await supabase
          .from('call_logs')
          .insert(sampleCallLogs)
          .select()

        if (insertError) {
          results.push({
            step: 'call_logs_sample_data',
            success: false,
            error: insertError.message
          })
        } else {
          results.push({
            step: 'call_logs_sample_data',
            success: true,
            count: insertedCallLogs?.length || 0,
            error: null
          })
        }
      } else {
        results.push({
          step: 'call_logs_sample_data',
          success: true,
          message: 'Call logs already exist',
          error: null
        })
      }
    } catch (e: any) {
      results.push({
        step: 'call_logs_sample_data',
        success: false,
        error: e.message
      })
    }

    // Step 4: Try to add sample data to designs if table exists
    try {
      const { data: designs, error: designsError } = await supabase
        .from('designs')
        .select('id')
        .limit(1)

      if (designsError) {
        results.push({
          step: 'designs_sample_data',
          success: false,
          error: designsError.message
        })
      } else if (!designs || designs.length === 0) {
        // Add sample designs
        const sampleDesigns = Array.from({ length: 8 }, (_, i) => ({
          design_id: `DS-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
          client_name: `Customer ${i + 1}`,
          designer: `Designer ${(i % 2) + 1}`,
          approval_status: ['pending', 'approved', 'rejected'][i % 3],
          quote_status: ['not-started', 'in-progress', 'completed'][i % 3],
          priority: ['high', 'medium', 'low'][i % 3],
          estimated_value: (i + 1) * 1000,
          complexity: ['complex', 'moderate', 'simple'][i % 3],
          next_action: ['Design review', 'Client approval', 'Production ready'][i % 3],
          assigned_to: `Designer ${(i % 2) + 1}`,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `Sample design for customer ${i + 1}`
        }))

        const { data: insertedDesigns, error: insertError } = await supabase
          .from('designs')
          .insert(sampleDesigns)
          .select()

        if (insertError) {
          results.push({
            step: 'designs_sample_data',
            success: false,
            error: insertError.message
          })
        } else {
          results.push({
            step: 'designs_sample_data',
            success: true,
            count: insertedDesigns?.length || 0,
            error: null
          })
        }
      } else {
        results.push({
          step: 'designs_sample_data',
          success: true,
          message: 'Designs already exist',
          error: null
        })
      }
    } catch (e: any) {
      results.push({
        step: 'designs_sample_data',
        success: false,
        error: e.message
      })
    }

    // Step 5: Try to add sample data to quotes if table exists
    try {
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id')
        .limit(1)

      if (quotesError) {
        results.push({
          step: 'quotes_sample_data',
          success: false,
          error: quotesError.message
        })
      } else if (!quotes || quotes.length === 0) {
        // Add sample quotes
        const sampleQuotes = Array.from({ length: 6 }, (_, i) => ({
          quote_id: `Q-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
          client_name: `Customer ${i + 1}`,
          total_amount: (i + 1) * 1500,
          status: ['draft', 'sent', 'accepted'][i % 3],
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `Sample quote for customer ${i + 1}`
        }))

        const { data: insertedQuotes, error: insertError } = await supabase
          .from('quotes')
          .insert(sampleQuotes)
          .select()

        if (insertError) {
          results.push({
            step: 'quotes_sample_data',
            success: false,
            error: insertError.message
          })
        } else {
          results.push({
            step: 'quotes_sample_data',
            success: true,
            count: insertedQuotes?.length || 0,
            error: null
          })
        }
      } else {
        results.push({
          step: 'quotes_sample_data',
          success: true,
          message: 'Quotes already exist',
          error: null
        })
      }
    } catch (e: any) {
      results.push({
        step: 'quotes_sample_data',
        success: false,
        error: e.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Migration analysis completed',
      results: results
    })

  } catch (error: any) {
    console.error('Error applying migration:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to apply migration',
      details: error.message
    }, { status: 500 })
  }
} 