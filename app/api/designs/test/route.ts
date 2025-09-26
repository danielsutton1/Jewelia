import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test 1: Check if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('designs')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Table check failed:', tableError.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Table check failed', 
        details: tableError.message 
      });
    }
    
    console.log('✅ Table exists, found', tableCheck?.length || 0, 'records');
    
    // Test 2: Get all records
    const { data: allData, error: allError } = await supabase
      .from('designs')
      .select('*');
    
    if (allError) {
      console.log('❌ Get all failed:', allError.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Get all failed', 
        details: allError.message 
      });
    }
    
    console.log('✅ Got all data:', allData?.length || 0, 'records');
    
    // Test 3: Check table structure (skip if RPC not available)
    let structureData = null;
    try {
      const { data: structureResult, error: structureError } = await supabase
        .rpc('get_table_structure', { table_name: 'designs' });
      structureData = structureResult;
    } catch (e) {
      console.log('⚠️ RPC not available, skipping structure check');
    }
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      recordCount: allData?.length || 0,
      sampleData: allData?.[0] || null,
      structure: structureData || 'RPC not available'
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed', 
      details: error 
    });
  }
} 