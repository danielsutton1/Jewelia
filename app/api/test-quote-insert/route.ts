import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Test the exact data that the upload function sends - using only fields that exist in the database
    const testQuoteData = {
      quote_number: 'Q-2025-UPLOAD-DEBUG',
      customer_name: 'Upload Debug Customer',
      customer_id: null, // Set to null since we don't have a valid UUID
      total_amount: 5000,
      status: 'sent',
      description: 'Upload Debug Design',
      valid_until: '2025-12-31',
      notes: 'Debug test from upload functionality',
      assignee: 'Daniel Sutton',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🔍 Testing quote insertion with data:', testQuoteData);

    // Try to insert into database
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert(testQuoteData)
      .select()
      .single();

    if (quoteError) {
      console.log('❌ Database insert failed:', quoteError);
      return NextResponse.json({
        success: false,
        error: quoteError.message,
        details: quoteError
      });
    }

    console.log('✅ Database insert successful:', quote);
    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Quote created successfully in database'
    });

  } catch (error: any) {
    console.error('Test quote insert error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
} 