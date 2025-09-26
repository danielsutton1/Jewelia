import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/internal-messages/upload - Get attachments for a message
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    
    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    
    console.log('🔍 Looking for message ID:', messageId)
    
    // First try to get the message from internal_messages table
    let { data: message, error: messageError } = await supabase
      .from('internal_messages')
      .select('attachments')
      .eq('id', messageId)
      .single()

    console.log('📥 Internal messages lookup result:', { data: message, error: messageError })
    
    // If not found in internal_messages, try the messages table
    if (messageError) {
      console.log('🔄 Message not found in internal_messages, trying messages table...')
      const { data: messagesTableMessage, error: messagesTableError } = await supabase
        .from('messages')
        .select('attachments')
        .eq('id', messageId)
        .single()
      
      console.log('📥 Messages table lookup result:', { data: messagesTableMessage, error: messagesTableError })
      
      if (messagesTableError) {
        console.error('❌ Error fetching message from both tables:', { messageError, messagesTableError })
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
    
    console.log('Found message:', { messageId, message, attachments })
    
    // Now also check the message_attachments table for proper file storage records
    const { data: storedAttachments, error: storedAttachmentsError } = await supabase
      .from('message_attachments')
      .select('*')
      .eq('message_id', messageId)
    
    if (storedAttachmentsError) {
      console.log('⚠️ No stored attachments found:', storedAttachmentsError)
    } else {
      console.log('📎 Found stored attachments:', storedAttachments)
    }
    
    // Return both the old format attachments and the new stored attachments
    const allAttachments = [
      ...attachments,
      ...(storedAttachments || [])
    ]
    
    return NextResponse.json({
      success: true,
      data: allAttachments,
      message: `Found ${allAttachments.length} attachment(s)`
    })

  } catch (error) {
    console.error('Error fetching attachments:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/internal-messages/upload - Upload attachment for a message
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const messageId = formData.get('messageId') as string
    const file = formData.get('file') as File
    
    if (!messageId || !file) {
      return NextResponse.json(
        { success: false, error: 'Message ID and file are required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    
    // Check if the message-attachments storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing storage buckets:', bucketsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to access storage',
        message: 'Storage system not available'
      })
    }
    
    // Check if message-attachments bucket exists
    const messageAttachmentsBucket = buckets.find((bucket: any) => bucket.name === 'message-attachments')
    
    if (!messageAttachmentsBucket) {
      console.log('Message-attachments bucket not found, creating it...')
      
      // Create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('message-attachments', {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'application/*'],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
      })
      
      if (createError) {
        console.error('Error creating bucket:', createError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create storage bucket',
          message: 'Storage setup required'
        })
      }
      
      console.log('Created message-attachments bucket:', newBucket)
    }
    
    // Generate unique file path
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = `${messageId}/${fileName}`
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({
        success: false,
        error: `Failed to upload file: ${uploadError.message}`,
        message: 'File upload failed'
      })
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(filePath)
    
    // Return success with file information
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: `file-${Date.now()}`,
        message_id: messageId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: filePath,
        public_url: urlData.publicUrl,
        mime_type: file.type,
        uploaded_by: 'current-user',
        created_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error uploading attachment:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
