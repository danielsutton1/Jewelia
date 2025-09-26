import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { UnifiedMessagingService } from '@/lib/services/UnifiedMessagingService'
import { ThreadSchema, ThreadQuerySchema } from '@/lib/schemas/messaging'

const messagingService = new UnifiedMessagingService()

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    // Parse and validate query parameters
    const validatedParams = ThreadQuerySchema.parse({
      ...queryParams,
      participant_id: queryParams.participant_id || user.id,
      limit: parseInt(queryParams.limit || '50'),
      offset: parseInt(queryParams.offset || '0')
    })

    const result = await messagingService.getThreads(validatedParams)

    return NextResponse.json({
      success: true,
      data: result.threads,
      pagination: result.pagination,
      total: result.total
    })

  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = ThreadSchema.parse(body)

    const thread = await messagingService.createThread(validatedData, user.id)

    return NextResponse.json({
      success: true,
      data: thread
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    )
  }
} 