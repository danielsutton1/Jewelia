import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// POST /api/internal-messages/upload-file - Upload a file for a message
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
      console.error('❌ Error listing storage buckets:', bucketsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to access storage',
        message: 'Storage system not available'
      }, { status: 500 })
    }

    console.log('🔍 Available storage buckets:', buckets?.map((b: any) => ({ id: b.id, name: b.name, public: b.public })))
    console.log('🔍 Total buckets found:', buckets?.length || 0)
    
    // Check for exact match first
    let messageAttachmentsBucket = buckets?.find((b: any) => b.id === 'message-attachments')
    
    // If not found, check for case-insensitive match
    if (!messageAttachmentsBucket) {
      messageAttachmentsBucket = buckets?.find((b: any) => 
        b.id.toLowerCase() === 'message-attachments' || 
        b.name?.toLowerCase().includes('message') ||
        b.name?.toLowerCase().includes('attachment')
      )
      if (messageAttachmentsBucket) {
        console.log('🔍 Found similar bucket:', messageAttachmentsBucket.id, 'using this instead')
      }
    }
    
    if (!messageAttachmentsBucket) {
      console.log('❌ Message attachments bucket not found')
      console.log('📝 Available bucket IDs:', buckets?.map((b: any) => b.id))
      console.log('📝 Available bucket names:', buckets?.map((b: any) => b.name))
      
      // Since we know the bucket exists, try to use it directly
      console.log('🔄 Bucket listing failed, but trying to use message-attachments directly...')
      try {
        // Test if we can access the bucket directly
        const { data: testList, error: testError } = await supabase.storage
          .from('message-attachments')
          .list('', { limit: 1 })
        
        if (testError) {
          console.error('❌ Cannot access message-attachments bucket directly:', testError)
          
          // Try to create the bucket as a fallback
          console.log('🔄 Attempting to create message-attachments bucket...')
          try {
            const { data: newBucket, error: createError } = await supabase.storage.createBucket('message-attachments', {
              public: true,
              fileSizeLimit: 52428800, // 50MB
              allowedMimeTypes: [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain', 'text/csv',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/zip', 'application/x-zip-compressed'
              ]
            })
            
            if (createError) {
              console.error('❌ Failed to create bucket:', createError)
              return NextResponse.json({
                success: false,
                error: 'Storage bucket not found',
                message: 'The message-attachments storage bucket does not exist and could not be created. Please create it manually in your Supabase dashboard.'
              }, { status: 500 })
            }
            
            console.log('✅ Successfully created message-attachments bucket')
            messageAttachmentsBucket = newBucket
          } catch (createError) {
            console.error('❌ Error creating bucket:', createError)
            return NextResponse.json({
              success: false,
              error: 'Storage bucket not found',
              message: 'The message-attachments storage bucket does not exist and could not be created. Please create it manually in your Supabase dashboard.'
            }, { status: 500 })
          }
        } else {
          console.log('✅ Can access message-attachments bucket directly, proceeding with upload')
          // Create a mock bucket object to continue
          messageAttachmentsBucket = { id: 'message-attachments', name: 'Message Attachments', public: true }
        }
      } catch (testError) {
        console.error('❌ Error testing bucket access:', testError)
        return NextResponse.json({
          success: false,
          error: 'Storage bucket not accessible',
          message: 'Cannot access the message-attachments storage bucket. Please check your permissions.'
        }, { status: 500 })
      }
    }
    
    console.log('✅ Message attachments bucket found:', messageAttachmentsBucket.id)
    
    // Create a unique file path
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    
    // Sanitize the filename to remove invalid characters for Supabase storage
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    
    const filePath = `${messageId}/${timestamp}_${randomId}_${sanitizedFileName}`
    
    console.log('📁 Original filename:', file.name)
    console.log('📁 Sanitized filename:', sanitizedFileName)
    console.log('📁 Uploading file to path:', filePath)
    
    // Upload the file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ Error uploading file:', uploadError)
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to upload file'
      if (uploadError.error === 'InvalidKey') {
        errorMessage = 'Invalid file path - filename contains invalid characters'
      } else if (uploadError.statusCode === '413') {
        errorMessage = 'File too large'
      } else if (uploadError.statusCode === '400') {
        errorMessage = 'Invalid file format or corrupted file'
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to upload file',
        message: errorMessage,
        details: {
          originalError: uploadError.message,
          filePath: filePath,
          fileName: file.name,
          fileSize: file.size
        }
      }, { status: 500 })
    }
    
    console.log('✅ File uploaded successfully to storage')
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(filePath)
    
    console.log('🔗 Public URL generated:', publicUrlData.publicUrl)
    
    // Insert attachment record into database
    const { data: attachmentData, error: attachmentError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        file_name: file.name, // Store original filename for display
        file_type: file.type,
        file_size: file.size,
        file_path: filePath, // Store sanitized path for storage
        mime_type: file.type,
        uploaded_by: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' // Demo user ID
      })
      .select()
      .single()
    
    if (attachmentError) {
      console.error('❌ Error creating attachment record:', attachmentError)
      // Try to delete the uploaded file if database insert fails
      await supabase.storage.from('message-attachments').remove([filePath])
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create attachment record',
        message: attachmentError.message
      }, { status: 500 })
    }
    
    console.log('✅ Attachment record created in database:', attachmentData.id)
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: attachmentData.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: filePath,
        public_url: publicUrlData.publicUrl,
        message_id: messageId,
        fallback_mode: false
      }
    })
    
  } catch (error) {
    console.error('❌ Error in file upload:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
