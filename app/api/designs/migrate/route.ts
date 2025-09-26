import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockCompletedDesigns } from '@/data/mock-designs';

export async function POST() {
  try {
    console.log('Starting designs migration...');

    // Step 1: Try to create the designs table using direct SQL
    // First, let's check if the table exists
    const { data: tableCheck, error: tableCheckError } = await supabase
      .from('designs')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('relation "public.designs" does not exist')) {
      console.log('Designs table does not exist, creating it...');
      
      // Since we can't use exec_sql, let's try to create the table by attempting an insert
      // This will fail but might trigger table creation in some cases
      // For now, we'll just return an error asking the user to create the table manually
      return NextResponse.json({ 
        success: false, 
        error: 'Designs table does not exist. Please run the SQL script manually in Supabase SQL editor.',
        instructions: 'Go to your Supabase dashboard > SQL Editor and run the script from scripts/create_designs_table_simple.sql',
        sqlScript: `
          CREATE TABLE IF NOT EXISTS designs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            design_id TEXT UNIQUE NOT NULL,
            client_name TEXT NOT NULL,
            client_id TEXT,
            designer TEXT NOT NULL,
            created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'revision-requested')),
            quote_status TEXT DEFAULT 'not-started' CHECK (quote_status IN ('not-started', 'in-progress', 'sent', 'accepted', 'rejected')),
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            estimated_value DECIMAL(10,2) DEFAULT 0,
            materials TEXT[] DEFAULT '{}',
            complexity TEXT DEFAULT 'moderate' CHECK (complexity IN ('simple', 'moderate', 'complex', 'expert')),
            client_feedback TEXT,
            revision_notes TEXT,
            next_action TEXT DEFAULT 'Design review',
            assigned_to TEXT,
            due_date TIMESTAMP WITH TIME ZONE,
            files TEXT[] DEFAULT '{}',
            notes TEXT,
            call_log_id TEXT,
            source_call_log JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }, { status: 400 });
    }

    console.log('Designs table exists, proceeding with migration...');

    // Step 2: Check if table already has data

    // Step 3: Check if table already has data
    const { data: existingData, error: checkError } = await supabase
      .from('designs')
      .select('count')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing data:', checkError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to check existing data',
        details: checkError 
      }, { status: 500 });
    }

    // If table has data, don't migrate
    if (existingData && existingData.length > 0) {
      console.log('Designs table already has data, skipping migration');
      return NextResponse.json({ 
        success: true, 
        message: 'Designs table already exists with data',
        migrated: false 
      });
    }

    // Step 4: Migrate mock data
    console.log('Migrating mock data...');
    const mockDataToInsert = mockCompletedDesigns.map((design: any) => ({
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

    const { data: insertedData, error: insertError } = await supabase
      .from('designs')
      .insert(mockDataToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting mock data:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to insert mock data',
        details: insertError 
      }, { status: 500 });
    }

    console.log(`Successfully migrated ${insertedData.length} designs to database`);
    return NextResponse.json({ 
      success: true, 
      message: `Successfully migrated ${insertedData.length} designs to database`,
      migrated: true,
      count: insertedData.length
    });

  } catch (error) {
    console.error('Error in designs migration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error during migration',
      details: error 
    }, { status: 500 });
  }
} 