import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Sample call log data
    const sampleData = [
      {
        customer_name: 'John Smith',
        staff_name: 'Sarah Johnson',
        call_type: 'Inbound',
        duration: '15 minutes',
        outcome: 'Resolved',
        notes: 'Customer called about order #12345 status. Order is ready for pickup.',
        summary: 'Order status inquiry - resolved',
        status: 'completed',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        customer_name: 'Emily Davis',
        staff_name: 'Mike Wilson',
        call_type: 'Outbound',
        duration: '8 minutes',
        outcome: 'follow-up-needed',
        notes: 'Called to follow up on repair estimate. Customer needs to review and call back.',
        summary: 'Repair estimate follow-up - pending customer response',
        status: 'pending',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        customer_name: 'Robert Brown',
        staff_name: 'Lisa Chen',
        call_type: 'Inbound',
        duration: '22 minutes',
        outcome: 'Resolved',
        notes: 'Customer had questions about warranty coverage. Explained policy and provided documentation.',
        summary: 'Warranty inquiry - fully resolved with documentation provided',
        status: 'completed',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
      },
      {
        customer_name: 'Jennifer Garcia',
        staff_name: 'David Thompson',
        call_type: 'Outbound',
        duration: '12 minutes',
        outcome: 'No answer',
        notes: 'Attempted to call about appointment reminder. Left voicemail.',
        summary: 'Appointment reminder - left voicemail',
        status: 'missed',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
      },
      {
        customer_name: 'Michael Lee',
        staff_name: 'Amanda Rodriguez',
        call_type: 'Inbound',
        duration: '18 minutes',
        outcome: 'Resolved',
        notes: 'Customer called about pricing for custom jewelry. Provided quote and scheduled consultation.',
        summary: 'Custom jewelry inquiry - quote provided, consultation scheduled',
        status: 'completed',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      },
      {
        customer_name: 'Jessica White',
        staff_name: 'Kevin Martinez',
        call_type: 'Inbound',
        duration: '5 minutes',
        outcome: 'follow-up-needed',
        notes: 'Quick call about payment method. Need to call back with payment options.',
        summary: 'Payment method inquiry - need to follow up with options',
        status: 'pending',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      }
    ];

    // Insert sample data
    const { data, error } = await supabase
      .from('call_logs')
      .insert(sampleData)
      .select();

    if (error) {
      console.error('Error inserting sample data:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample call log data added successfully',
      count: data.length 
    });

  } catch (error) {
    console.error('Error in sample data API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if sample data already exists
    const { data, error } = await supabase
      .from('call_logs')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error checking existing data:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      hasData: data && data.length > 0,
      count: data ? data.length : 0
    });

  } catch (error) {
    console.error('Error checking sample data:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 