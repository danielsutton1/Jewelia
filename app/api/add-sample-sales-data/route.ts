import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results = []

    // Step 1: Add sample data to call_logs if it's empty
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
        // Add sample call logs using actual schema
        const sampleCallLogs = Array.from({ length: 5 }, (_, i) => ({
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

    // Step 2: Add sample data to designs if table exists
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
        // Add sample designs using actual schema
        const sampleDesigns = Array.from({ length: 8 }, (_, i) => ({
          name: `Design for Customer ${i + 1}`,
          status: ['pending', 'approved', 'rejected'][i % 3],
          description: `Sample design for customer ${i + 1} - ${['complex', 'moderate', 'simple'][i % 3]} jewelry piece`
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

    // Step 3: Add sample data to quotes if table exists
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
        // Add sample quotes using actual schema
        const sampleQuotes = Array.from({ length: 6 }, (_, i) => ({
          customer_id: null, // Set to null since we don't have real customer UUIDs
          total_amount: (i + 1) * 1500,
          status: ['draft', 'sent', 'accepted'][i % 3],
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
      message: 'Sample sales data added successfully',
      results: results
    })

  } catch (error: any) {
    console.error('Error adding sample sales data:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add sample sales data',
      details: error.message
    }, { status: 500 })
  }
}
