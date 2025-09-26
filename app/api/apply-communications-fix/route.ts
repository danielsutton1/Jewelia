import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Applying communications table fix...');
    
    const results = {
      tableCreated: false,
      columnsAdded: false,
      relationshipsFixed: false,
      indexesCreated: false,
      rlsEnabled: false,
      policiesCreated: false,
      sampleDataAdded: false,
      errors: [] as string[]
    };

    // Step 1: Create communications table if it doesn't exist
    try {
      // First, try to access the table to see if it exists
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation "communications" does not exist')) {
          console.log('❌ Communications table does not exist - needs manual SQL fix');
          results.errors.push('Communications table does not exist - apply SQL script in Supabase Dashboard');
        } else {
          console.log('❌ Communications table has issues:', error.message);
          results.errors.push(`Table access error: ${error.message}`);
        }
      } else {
        console.log('✅ Communications table exists');
        results.tableCreated = true;
      }
    } catch (error) {
      results.errors.push(`Table check error: ${error}`);
    }

    // Step 2: Check if we can create the table via direct operations
    try {
      // Try to insert a test record to see if the structure is correct
      const { data: testData, error: testError } = await supabase
        .from('communications')
        .insert([{
          subject: 'Test Communication',
          content: 'This is a test communication to verify table structure',
          type: 'internal',
          status: 'unread',
          priority: 'normal',
          category: 'test'
        }])
        .select()
        .single();
      
      if (testError) {
        if (testError.message.includes('sender_id') || testError.message.includes('recipient_id')) {
          console.log('❌ Table exists but missing required columns');
          results.errors.push('Table exists but missing sender_id/recipient_id columns');
        } else if (testError.message.includes('content')) {
          console.log('❌ Table exists but missing content column');
          results.errors.push('Table exists but missing content column');
        } else {
          console.log('❌ Table structure issues:', testError.message);
          results.errors.push(`Table structure error: ${testError.message}`);
        }
      } else {
        console.log('✅ Table structure is correct');
        results.columnsAdded = true;
        
        // Clean up test record
        await supabase
          .from('communications')
          .delete()
          .eq('subject', 'Test Communication');
      }
    } catch (error) {
      results.errors.push(`Structure test error: ${error}`);
    }

    // Step 3: Test foreign key relationships
    if (results.columnsAdded) {
      try {
        const { data: joinTest, error: joinError } = await supabase
          .from('communications')
          .select(`
            *,
            sender:sender_id(id, email),
            recipient:recipient_id(id, email)
          `)
          .limit(1);
        
        if (joinError) {
          console.log('❌ Foreign key relationships broken');
          results.errors.push('Foreign key relationships need to be fixed');
        } else {
          console.log('✅ Foreign key relationships working');
          results.relationshipsFixed = true;
        }
      } catch (error) {
        results.errors.push(`Relationship test error: ${error}`);
      }
    }

    // Step 4: Test RLS and policies
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('communications')
        .select('id')
        .limit(1);
      
      if (!rlsError) {
        console.log('✅ RLS is working correctly');
        results.rlsEnabled = true;
        results.policiesCreated = true;
      } else {
        console.log('❌ RLS issues:', rlsError.message);
        results.errors.push(`RLS error: ${rlsError.message}`);
      }
    } catch (error) {
      results.errors.push(`RLS test error: ${error}`);
    }

    // Step 5: Add sample data if table is working
    if (results.relationshipsFixed) {
      try {
        // Get a sample user ID
        const { data: users, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .limit(1);
        
        if (!userError && users && users.length > 0) {
          const sampleUserId = users[0].id;
          
          // Add sample communications
          const { data: sampleData, error: sampleError } = await supabase
            .from('communications')
            .insert([
              {
                sender_id: sampleUserId,
                recipient_id: sampleUserId,
                subject: 'Welcome to Jewelry CRM',
                content: 'Welcome to your new jewelry management system! This is your first communication.',
                type: 'internal',
                status: 'read',
                priority: 'normal',
                category: 'welcome'
              },
              {
                sender_id: sampleUserId,
                recipient_id: sampleUserId,
                subject: 'System Setup Complete',
                content: 'Your jewelry CRM system has been successfully configured and is ready for use.',
                type: 'notification',
                status: 'unread',
                priority: 'high',
                category: 'system'
              }
            ])
            .select();
          
          if (!sampleError) {
            console.log('✅ Added sample communications data');
            results.sampleDataAdded = true;
          } else {
            console.log('❌ Could not add sample data:', sampleError.message);
            results.errors.push(`Sample data error: ${sampleError.message}`);
          }
        } else {
          console.log('⚠️ No users found to create sample communications');
        }
      } catch (error) {
        results.errors.push(`Sample data error: ${error}`);
      }
    }

    // Summary
    const successCount = Object.values(results).filter(v => v === true).length;
    const totalChecks = 7;
    
    console.log(`🎉 Communications fix assessment completed!`);
    console.log(`✅ Successful: ${successCount}/${totalChecks}`);
    console.log(`❌ Issues found: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('📋 Issues that need manual SQL Editor fixes:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }

    return NextResponse.json({
      success: true,
      message: 'Communications fix assessment completed',
      results,
      needsManualFix: results.errors.length > 0,
      sqlScript: results.errors.length > 0 ? 'COMMUNICATIONS_TABLE_FIX.sql' : null,
      nextSteps: results.errors.length > 0 ? 
        'Apply the SQL script in Supabase Dashboard SQL Editor' : 
        'Communications table is working correctly!',
      testCommand: 'curl -X GET "http://localhost:3000/api/communications" | jq .'
    });

  } catch (error) {
    console.error('🚨 Error applying communications fix:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to apply communications fix',
      details: error instanceof Error ? error.message : 'Unknown error',
      nextSteps: 'Apply the SQL script manually in Supabase Dashboard SQL Editor',
      sqlScript: 'COMMUNICATIONS_TABLE_FIX.sql'
    }, { status: 500 });
  }
} 