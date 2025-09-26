import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    

    
    // Validate required fields - check for the actual field names sent by frontend
    if (!body.customer_name) {
      return NextResponse.json({ success: false, error: 'Customer name is required' }, { status: 400 });
    }
    
    // Prepare call log data - only include fields that exist in the call_logs table
    const callLogData: any = {
      customer_name: body.customer_name,
      customer_id: body.customer_id || null,
      notes: body.notes || 'Call logged',
      status: body.status || 'in-progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into call_logs table
    const { data, error } = await supabase
      .from('call_logs')
      .insert(callLogData)
      .select()
      .single();

    if (error) {
      console.error('Error saving call log:', error);
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in call log API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    // Get call logs from database
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching call logs:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Transform the data to include files array for frontend compatibility
    const transformedData = data.map((callLog: any) => {
      const transformedCallLog = {
        ...callLog,
        files: callLog.files || []
      };

      return transformedCallLog;
    });

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error in call log API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }
    
    // Update the call log status
    const { data, error } = await supabase
      .from('call_logs')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating call log status:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in call log status update API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 