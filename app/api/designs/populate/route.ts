import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockCompletedDesigns } from '@/data/mock-designs';

export async function POST() {
  try {
    console.log('🔄 Starting database population...');
    
    // Check if table is empty
    const { data: existingData, error: checkError } = await supabase
      .from('designs')
      .select('*');
    
    if (checkError) {
      console.log('❌ Check failed:', checkError.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Check failed', 
        details: checkError.message 
      });
    }
    
    const existingCount = existingData?.length || 0;
    console.log('📊 Existing records:', existingCount);
    
    if (existingCount > 0) {
      console.log('⚠️ Table already has data, skipping population');
      return NextResponse.json({ 
        success: true, 
        message: 'Table already has data', 
        existingCount 
      });
    }
    
    // Transform mock data to database format
    const designsToInsert = mockCompletedDesigns.map((design: any) => ({
      design_id: design.designId,
      client_name: design.client,
      client_id: `client-${design.designId}`,
      designer: design.designer,
      created_date: design.completedDate,
      approval_status: design.approvalStatus,
      quote_status: design.designStatus,
      priority: design.priority,
      estimated_value: design.estimatedValue,
      materials: design.materials || [],
      complexity: design.complexity,
      next_action: design.nextAction,
      assigned_to: design.assignedTo,
      due_date: design.dueDate,
      files: design.files || [],
      notes: design.notes || '',
      call_log_id: `call-${design.designId}`,
      source_call_log: null
    }));
    
    console.log('📝 Inserting', designsToInsert.length, 'designs...');
    
    // Insert the data
    const { data: insertedData, error: insertError } = await supabase
      .from('designs')
      .insert(designsToInsert)
      .select();
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Insert failed', 
        details: insertError.message 
      });
    }
    
    console.log('✅ Successfully inserted', insertedData?.length || 0, 'designs');
    
    return NextResponse.json({
      success: true,
      message: 'Database populated successfully',
      insertedCount: insertedData?.length || 0,
      sampleData: insertedData?.[0] || null
    });
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Population failed', 
      details: error 
    });
  }
} 