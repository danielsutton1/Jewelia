import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/internal-messages/attachments/[messageId] - Get actual file data for attachments
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
    
    // First try to get the message from internal_messages table
    let { data: message, error: messageError } = await supabase
      .from('internal_messages')
      .select('attachments')
      .eq('id', messageId)
      .single()

    // If not found in internal_messages, try the messages table
    if (messageError) {
      console.log('Message not found in internal_messages, trying messages table...')
      const { data: messagesTableMessage, error: messagesTableError } = await supabase
        .from('messages')
        .select('attachments')
        .eq('id', messageId)
        .single()
      
      if (messagesTableError) {
        console.error('Error fetching message from both tables:', { messageError, messagesTableError })
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch message from both internal_messages and messages tables',
          data: []
        })
      }
      
      message = messagesTableMessage
      messageError = null
    }

    // Extract attachments from the message
    const attachments = message?.attachments || []
    
    // For now, we'll return the attachment metadata
    // In a real implementation, you'd retrieve the actual file data from storage
    return NextResponse.json({
      success: true,
      data: attachments.map((attachment: any) => ({
        ...attachment,
        // Add a flag to indicate this is metadata, not actual file data
        is_metadata: true,
        // In a real system, you'd have file_path pointing to actual storage
        file_path: null
      })),
      message: `Found ${attachments.length} attachment(s) - metadata only`
    })

  } catch (error) {
    console.error('Error fetching attachments:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
