import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Sample data for call log history
    const sampleCallLogs = [
      // Active calls (not sent to design)
      {
        customer_name: "Sarah Johnson",
        customer_id: "CUST-001",
        staff_name: "Mike Smith",
        staff_id: "STAFF-001",
        call_type: "inbound",
        duration: "5-10 minutes",
        outcome: "interested",
        notes: "Customer interested in custom engagement ring. Wants to schedule consultation.",
        summary: "Positive interaction, follow-up needed",
        follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        customer_name: "David Chen",
        customer_id: "CUST-002",
        staff_name: "Lisa Rodriguez",
        staff_id: "STAFF-002",
        call_type: "outbound",
        duration: "10-15 minutes",
        outcome: "follow-up-needed",
        notes: "Follow-up call for anniversary ring quote. Customer needs time to think.",
        summary: "Quote provided, waiting for decision",
        follow_up_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        customer_name: "Emily Davis",
        customer_id: "CUST-003",
        staff_name: "John Wilson",
        staff_id: "STAFF-003",
        call_type: "inbound",
        duration: "Less than 1 minute",
        outcome: "voicemail",
        notes: "Left voicemail for customer regarding their repair order status.",
        summary: "Voicemail left",
        follow_up_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        customer_name: "Robert Thompson",
        customer_id: "CUST-004",
        staff_name: "Maria Garcia",
        staff_id: "STAFF-004",
        call_type: "outbound",
        duration: "15-30 minutes",
        outcome: "sale-closed",
        notes: "Successfully closed sale on diamond necklace. Customer very satisfied.",
        summary: "Sale completed",
        follow_up_date: null,
        status: "completed",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        customer_name: "Jennifer Lee",
        customer_id: "CUST-005",
        staff_name: "Alex Brown",
        staff_id: "STAFF-005",
        call_type: "inbound",
        duration: "1-5 minutes",
        outcome: "info-requested",
        notes: "Customer requested information about our return policy.",
        summary: "Information provided",
        follow_up_date: null,
        status: "completed",
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      
      // Calls sent to design (have design_id)
      {
        customer_name: "Michael Anderson",
        customer_id: "CUST-006",
        staff_name: "Rachel Green",
        staff_id: "STAFF-006",
        call_type: "inbound",
        duration: "30-60 minutes",
        outcome: "interested",
        notes: "Customer wants custom wedding band design. Detailed consultation completed.\n\n--- DESIGN CREATED ---\nDesign ID: DS-2025-001\nStatus: Pending Design Review\nNext Action: Design review\nCreated: " + new Date().toISOString(),
        summary: "Design consultation completed",
        follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "design_created",
        design_id: "DS-2025-001",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        customer_name: "Amanda White",
        customer_id: "CUST-007",
        staff_name: "Tom Martinez",
        staff_id: "STAFF-007",
        call_type: "outbound",
        duration: "15-30 minutes",
        outcome: "interested",
        notes: "Follow-up call for custom pendant design. Customer approved concept.\n\n--- DESIGN CREATED ---\nDesign ID: DS-2025-002\nStatus: Pending Design Review\nNext Action: Design review\nCreated: " + new Date().toISOString(),
        summary: "Design concept approved",
        follow_up_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "design_created",
        design_id: "DS-2025-002",
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        customer_name: "Christopher Taylor",
        customer_id: "CUST-008",
        staff_name: "Sofia Patel",
        staff_id: "STAFF-008",
        call_type: "inbound",
        duration: "1+ hours",
        outcome: "interested",
        notes: "Complex custom ring design consultation. Multiple stones and settings discussed.\n\n--- DESIGN CREATED ---\nDesign ID: DS-2025-003\nStatus: Pending Design Review\nNext Action: Design review\nCreated: " + new Date().toISOString(),
        summary: "Complex design consultation",
        follow_up_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "design_created",
        design_id: "DS-2025-003",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        customer_name: "Jessica Moore",
        customer_id: "CUST-009",
        staff_name: "Kevin Johnson",
        staff_id: "STAFF-009",
        call_type: "outbound",
        duration: "10-15 minutes",
        outcome: "interested",
        notes: "Anniversary gift design consultation. Customer wants something unique.\n\n--- DESIGN CREATED ---\nDesign ID: DS-2025-004\nStatus: Pending Design Review\nNext Action: Design review\nCreated: " + new Date().toISOString(),
        summary: "Anniversary gift design",
        follow_up_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: "design_created",
        design_id: "DS-2025-004",
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        customer_name: "Daniel Wilson",
        customer_id: "CUST-010",
        staff_name: "Emma Davis",
        staff_id: "STAFF-010",
        call_type: "inbound",
        duration: "5-10 minutes",
        outcome: "interested",
        notes: "Engagement ring design inquiry. Customer has specific requirements.\n\n--- DESIGN CREATED ---\nDesign ID: DS-2025-005\nStatus: Pending Design Review\nNext Action: Design review\nCreated: " + new Date().toISOString(),
        summary: "Engagement ring design",
        follow_up_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: "design_created",
        design_id: "DS-2025-005",
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Insert sample data
    const { data, error } = await supabase
      .from('call_logs')
      .insert(sampleCallLogs)
      .select();

    if (error) {
      console.error('Error inserting sample data:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${data.length} sample call logs to history`,
      data 
    });

  } catch (error) {
    console.error('Error in sample history data API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 