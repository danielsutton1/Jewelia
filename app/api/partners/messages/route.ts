import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { z } from "zod"

// Validation schemas
const MessageSchema = z.object({
  partner_id: z.string().uuid(),
  recipient_id: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
  message_type: z.enum(['text', 'file', 'image', 'system']).default('text'),
  metadata: z.record(z.any()).optional()
})

const MessageQuerySchema = z.object({
  partner_id: z.string().uuid(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  unread_only: z.coerce.boolean().default(false)
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = MessageQuerySchema.parse(queryParams)

    // Build query with proper joins
    let query = supabase
      .from('partner_messages')
      .select(`
        id,
        content,
        message_type,
        is_read,
        read_at,
        created_at,
        updated_at,
        metadata,
        sender:users!partner_messages_sender_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        recipient:users!partner_messages_recipient_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        partner:partners(
          id,
          name,
          company,
          avatar_url
        )
      `)
      .eq('partner_id', validatedQuery.partner_id)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1)

    // Add unread filter if requested
    if (validatedQuery.unread_only) {
      query = query.eq('is_read', false)
    }

    const { data: messages, error, count } = await query

    if (error) {
      console.error("Error fetching partner messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        total: count || 0
      }
    })

  } catch (error) {
    console.error("Error in partner messages GET:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid query parameters", 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = MessageSchema.parse(body)

    // Verify user has relationship with partner
    const { data: relationship, error: relError } = await supabase
      .from('partner_relationships')
      .select('id, status')
      .eq('partner_id', validatedData.partner_id)
      .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (relError || !relationship) {
      return NextResponse.json({ 
        error: "No active relationship with this partner" 
      }, { status: 403 })
    }

    // Create message
    const { data: message, error: insertError } = await supabase
      .from('partner_messages')
      .insert({
        partner_id: validatedData.partner_id,
        sender_id: user.id,
        recipient_id: validatedData.recipient_id,
        content: validatedData.content,
        message_type: validatedData.message_type,
        metadata: validatedData.metadata || {}
      })
      .select(`
        id,
        content,
        message_type,
        is_read,
        created_at,
        updated_at,
        metadata,
        sender:users!partner_messages_sender_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        recipient:users!partner_messages_recipient_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        partner:partners(
          id,
          name,
          company,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error("Error creating partner message:", insertError)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    // Send real-time notification
    await supabase.channel('partner-messages').send({
      type: 'broadcast',
      event: 'new-message',
      payload: {
        message_id: message.id,
        partner_id: validatedData.partner_id,
        sender_id: user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: message
    }, { status: 201 })

  } catch (error) {
    console.error("Error in partner messages POST:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid message data", 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message_id, is_read } = body

    if (!message_id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // Update message (only allow marking as read)
    const updateData: any = {}
    if (typeof is_read === 'boolean') {
      updateData.is_read = is_read
      if (is_read) {
        updateData.read_at = new Date().toISOString()
      }
    }

    const { data: message, error: updateError } = await supabase
      .from('partner_messages')
      .update(updateData)
      .eq('id', message_id)
      .eq('recipient_id', user.id) // Only allow recipient to update
      .select()
      .single()

    if (updateError) {
      console.error("Error updating partner message:", updateError)
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: message
    })

  } catch (error) {
    console.error("Error in partner messages PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 