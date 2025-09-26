import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/external-messages/upload - Get attachments for a message
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
    
    console.log('🔍 Looking for external message ID:', messageId)
    
    // Get attachments from the message_attachments table
    const { data: storedAttachments, error: storedAttachmentsError } = await supabase
      .from('message_attachments')
      .select('*')
      .eq('message_id', messageId)
    
    if (storedAttachmentsError) {
      console.log('⚠️ No stored attachments found:', storedAttachmentsError)
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No attachments found'
      })
    }
    
    console.log('📎 Found stored attachments:', storedAttachments)
    
    return NextResponse.json({
      success: true,
      data: storedAttachments || [],
      message: `Found ${(storedAttachments || []).length} attachment(s)`
    })

  } catch (error) {
    console.error('Error fetching external message attachments:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/external-messages/upload - Upload attachment for an external message
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
    const filePath = `external/${messageId}/${fileName}`
    
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
    
    // Get the current user - for demo purposes, use a default user ID
    const { data: { user } } = await supabase.auth.getUser()
    const defaultUserId = '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' // Demo user ID
    const uploaderId = user?.id || defaultUserId
    
    console.log('👤 Upload user ID:', uploaderId)
    
    // Store attachment record in message_attachments table
    const { data: attachmentRecord, error: insertError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: filePath,
        mime_type: file.type,
        uploaded_by: uploaderId
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting attachment record:', insertError)
      // Try to clean up the uploaded file
      await supabase.storage
        .from('message-attachments')
        .remove([filePath])
      
      return NextResponse.json({
        success: false,
        error: 'Failed to save attachment record',
        message: 'File uploaded but record creation failed'
      })
    }
    
    // Return success with file information
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        ...attachmentRecord,
        file_url: urlData.publicUrl,
        public_url: urlData.publicUrl
      }
    })

  } catch (error) {
    console.error('Error uploading external message attachment:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

