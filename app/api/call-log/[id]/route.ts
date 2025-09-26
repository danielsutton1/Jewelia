import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('API received ID:', id);
    
    // Get call log from database by ID
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching call log:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Call log not found' }, { status: 404 });
    }

    // Transform the data to include files array for frontend compatibility
    const transformedData = {
      ...data,
      files: []
    };

    // Add file information to files array if it exists
    if (data.file_attachment && data.file_name) {
      transformedData.files.push({
        name: data.file_name,
        url: data.file_attachment,
        type: data.file_attachment.includes('pdf') ? 'application/pdf' : 'application/octet-stream',
        size: 0, // We don't store file size in the database
        uploaded_at: data.updated_at || data.created_at || new Date().toISOString(),
        data: data.file_attachment // For compatibility with existing frontend code
      });
    }

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error in call log API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    console.log('API updating call log ID:', id);
    
    // Extract form data
    const customer = formData.get('customer') as string;
    const callType = formData.get('callType') as string;
    const staff = formData.get('staff') as string;
    const callDuration = formData.get('callDuration') as string;
    const callOutcome = formData.get('callOutcome') as string;
    const notes = formData.get('notes') as string;
    const additionalNotes = formData.get('additionalNotes') as string;
    const followUpDate = formData.get('followUpDate') as string;
    const fileAttachment = formData.get('fileAttachment') as File | null;
    
    // Prepare update data
    const updateData: any = {
      customer_name: customer,
      call_type: callType,
      staff_name: staff,
      duration: callDuration,
      outcome: callOutcome,
      notes: notes,
      additional_notes: additionalNotes,
      updated_at: new Date().toISOString()
    };
    
    // Handle follow-up date
    if (followUpDate) {
      updateData.follow_up_date = followUpDate;
    }
    
    // Handle file attachment
    if (fileAttachment && fileAttachment.size > 0) {
      try {
        // Upload file to Supabase Storage
        const fileName = `${Date.now()}-${fileAttachment.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('call-log-attachments')
          .upload(fileName, fileAttachment);
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          // If storage bucket doesn't exist, just store the filename for now
          if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
            updateData.file_name = fileAttachment.name;
            updateData.file_attachment = `File: ${fileAttachment.name} (Storage not configured)`;
          } else {
            return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
          }
        } else {
          // Get public URL for the uploaded file
          const { data: urlData } = supabase.storage
            .from('call-log-attachments')
            .getPublicUrl(fileName);
          
          updateData.file_attachment = urlData.publicUrl;
          updateData.file_name = fileAttachment.name;
        }
      } catch (fileError) {
        console.error('Error handling file upload:', fileError);
        // Fallback: just store the filename
        updateData.file_name = fileAttachment.name;
        updateData.file_attachment = `File: ${fileAttachment.name} (Upload failed)`;
      }
    }
    
    // Update call log in database
    const { data, error } = await supabase
      .from('call_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating call log:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Transform the data to include files array for frontend compatibility
    const transformedData = {
      ...data,
      files: []
    };

    // Add file information to files array if it exists
    if (data.file_attachment && data.file_name) {
      transformedData.files.push({
        name: data.file_name,
        url: data.file_attachment,
        type: data.file_attachment.includes('pdf') ? 'application/pdf' : 'application/octet-stream',
        size: 0, // We don't store file size in the database
        uploaded_at: data.updated_at || new Date().toISOString(),
        data: data.file_attachment // For compatibility with existing frontend code
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: transformedData,
      message: 'Call log updated successfully' 
    });
  } catch (error) {
    console.error('Error in call log update API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 