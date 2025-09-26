import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/debug-message/[messageId] - Debug message lookup
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params
    
    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    
    console.log('🔍 Debug: Looking for message ID:', messageId)
    
    // Try to find the message in internal_messages table
    let { data: internalMessage, error: internalError } = await supabase
      .from('internal_messages')
      .select('*')
      .eq('id', messageId)
      .single()

    console.log('🔍 Debug: Internal message lookup result:', { data: internalMessage, error: internalError })
    
    // Try to find the message in messages table
    let { data: messagesTableMessage, error: messagesTableError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    console.log('🔍 Debug: Messages table lookup result:', { data: messagesTableMessage, error: messagesTableError })
    
    // Return debug information
    return NextResponse.json({
      success: true,
      debug: {
        messageId,
        internal_messages: {
          found: !!internalMessage,
          data: internalMessage,
          error: internalError?.message
        },
        messages: {
          found: !!messagesTableMessage,
          data: messagesTableMessage,
          error: messagesTableError?.message
        }
      }
    })

  } catch (error) {
    console.error('Error debugging message:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

