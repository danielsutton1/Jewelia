import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Add call_number column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS call_number VARCHAR(13);'
    });

    if (alterError) {
      console.error('Error adding call_number column:', alterError);
      return NextResponse.json({ success: false, error: alterError.message }, { status: 500 });
    }

    // Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_call_logs_call_number ON call_logs(call_number);'
    });

    if (indexError) {
      console.error('Error creating index:', indexError);
      return NextResponse.json({ success: false, error: indexError.message }, { status: 500 });
    }

    // Update existing records with sequential call numbers
    const { data: existingCalls, error: fetchError } = await supabase
      .from('call_logs')
      .select('id, created_at')
      .is('call_number', null)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching existing calls:', fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    const currentYear = new Date().getFullYear();
    
    // Update each call with a sequential number
    for (let i = 0; i < existingCalls.length; i++) {
      const call = existingCalls[i];
      const callNumber = `CL-${currentYear}-${String(i + 1).padStart(4, '0')}`;
      
      const { error: updateError } = await supabase
        .from('call_logs')
        .update({ call_number: callNumber })
        .eq('id', call.id);

      if (updateError) {
        console.error('Error updating call number:', updateError);
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully added call_number column and updated ${existingCalls.length} existing records` 
    });
  } catch (error) {
    console.error('Error in setup call number API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 