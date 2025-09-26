import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserContextFromRequest } from '@/lib/services/UserContextService'

// =====================================================
// EMAIL PROCESSING LOGS API
// =====================================================
// This endpoint provides access to email processing logs

export async function GET(request: NextRequest) {
  try {
    // Get user context and validate access
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to access email processing logs'
      }, { status: 401 })
    }

    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const emailType = searchParams.get('email_type')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('email_processing_logs')
      .select(`
        *,
        email_integration:email_integration_settings(
          email_address,
          email_type
        )
      `, { count: 'exact' })
      .eq('tenant_id', userContext.tenantId)

    // Apply filters
    if (status) {
      query = query.eq('processing_status', status)
    }
    
    if (emailType) {
      query = query.eq('email_type', emailType)
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    
    if (search) {
      query = query.or(`sender_email.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    // Apply sorting
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user context and validate access
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to retry email processing'
      }, { status: 401 })
    }

    const body = await request.json()
    const { logId } = body

    if (!logId) {
      return NextResponse.json({ 
        success: false,
        error: 'Log ID is required'
      }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Get the log entry
    const { data: logEntry, error: fetchError } = await supabase
      .from('email_processing_logs')
      .select('*')
      .eq('id', logId)
      .eq('tenant_id', userContext.tenantId)
      .single()

    if (fetchError || !logEntry) {
      return NextResponse.json({ 
        success: false,
        error: 'Log entry not found or access denied'
      }, { status: 404 })
    }

    // Only allow retry for failed entries
    if (logEntry.processing_status !== 'failed') {
      return NextResponse.json({ 
        success: false,
        error: 'Can only retry failed email processing'
      }, { status: 400 })
    }

    // Add to processing queue for retry
    const queueData = {
      tenant_id: userContext.tenantId,
      email_data: {
        id: logEntry.original_email_id,
        from: logEntry.sender_email,
        to: logEntry.email_integration_id, // This would need to be resolved to actual email
        subject: logEntry.subject,
        body: logEntry.extracted_data?.description || '',
        timestamp: logEntry.created_at
      },
      processing_priority: 1, // High priority for retries
      max_retries: 3,
      retry_count: 0,
      status: 'queued'
    }

    const { error: queueError } = await supabase
      .from('email_processing_queue')
      .insert([queueData])

    if (queueError) throw queueError

    // Update log status
    const { error: updateError } = await supabase
      .from('email_processing_logs')
      .update({ 
        processing_status: 'pending',
        error_message: null
      })
      .eq('id', logId)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true,
      message: 'Email processing queued for retry'
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}
