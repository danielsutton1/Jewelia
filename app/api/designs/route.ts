import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const body = await request.json();
    const { callLogData } = body;
    
    console.log('📁 Files data received from call log:', callLogData.files);

    // Generate a unique design ID
    const designId = `DS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create a new design record in the designs table using actual schema
    const { data, error } = await supabase
      .from('designs')
      .insert({
        name: `Design for ${callLogData.customer || callLogData.customer_name || 'Customer'}`,
        status: 'pending',
        description: callLogData.notes || 'Design created from call log'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating design:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Update the call log to reference the design
    const updateResult = await supabase
      .from('call_logs')
      .update({ 
        status: 'design_created',
        notes: (callLogData.notes || '') + `\n\n--- DESIGN CREATED ---\nDesign ID: ${designId}\nStatus: Pending Design Review\nNext Action: Design review\nCreated: ${new Date().toISOString()}`
      })
      .eq('id', callLogData.id);

    if (updateResult.error) {
      console.error('Error updating call log:', updateResult.error);
      // Continue anyway as the design was created successfully
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        designId,
        message: 'Design created successfully',
        callLogId: callLogData.id
      }
    });

  } catch (error) {
    console.error('Error in designs API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    console.log('🔍 Attempting to fetch designs from database...');
    
    // Try to fetch designs directly from the database using actual schema
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.log('❌ Database fetch failed:', error.message);
      return NextResponse.json({ success: true, data: [] });
    } else if (data && data.length > 0) {
      console.log('✅ Successfully fetched designs from database:', data.length, 'designs');
      console.log('📊 Sample design data:', data[0]);
      
      // Transform the database data to match the design interface
      const transformedDatabaseData = data.map((design: any) => {
        // Map database status to frontend expected status
        let mappedStatus = 'not-started';
        if (design.status === 'approved') {
          mappedStatus = 'in-progress';
        } else if (design.status === 'pending') {
          mappedStatus = 'not-started';
        } else if (design.status === 'rejected') {
          mappedStatus = 'not-started';
        }

        return {
          designId: design.id,
          designStatus: mappedStatus,
          client_name: design.name || 'Unknown Client',
          client_id: design.id,
          designer: 'Designer',
          approval_status: design.status || 'pending',
          quote_status: design.status || 'not-started',
          priority: 'medium',
          estimated_value: 0,
          materials: [],
          complexity: 'moderate',
          next_action: 'Design review',
          assigned_to: 'Designer',
          due_date: new Date().toISOString(),
          files: [],
          notes: design.description || '',
          call_log_id: design.id,
          source_call_log: design
        };
      });

      console.log('✅ Returning Supabase designs:', transformedDatabaseData.length, 'designs');
      return NextResponse.json({ success: true, data: transformedDatabaseData });
    }

    // If database fetch succeeded but returned no data, return empty array
    console.log('⚠️ No designs found in Supabase database');
    return NextResponse.json({ success: true, data: [] });
    
  } catch (error) {
    console.error('Error in designs API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const body = await request.json();
    const { designId, updates } = body;

    if (!designId) {
      return NextResponse.json({ success: false, error: 'Design ID is required' }, { status: 400 });
    }

    console.log(`🔄 PATCH request for design ${designId} with updates:`, updates);

    // First, try to update in Supabase database
    try {
      console.log(`🔍 Attempting to update design ${designId} in Supabase...`);
      
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('designs')
        .update(updates)
        .eq('id', designId) // Changed from design_id to id
        .select()
        .single();

      if (supabaseError) {
        console.warn('❌ Supabase update failed:', supabaseError);
        // Continue to mock data update as fallback
      } else {
        console.log('✅ Successfully updated design in Supabase:', supabaseData);
        return NextResponse.json({
          success: true,
          data: supabaseData,
          message: 'Design updated successfully in database'
        });
      }
    } catch (supabaseError) {
      console.warn('❌ Supabase update failed with exception:', supabaseError);
      // Continue to mock data update as fallback
    }

    // Fallback: Update the mutable mock data
    console.log(`🔄 Falling back to mock data update for design ${designId}`);
    // The mock data is no longer used, so this section is effectively removed.
    // If you need to update mock data, you would manage it differently.
    
    console.warn(`❌ Design ${designId} not found in Supabase and no mock data to update.`);
    return NextResponse.json({ success: false, error: 'Design not found' }, { status: 404 });

  } catch (error) {
    console.error('Error in designs PATCH API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 