import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('🔍 Attempting to fetch quotes from Supabase database...');
    
    // Try to fetch quotes directly from the database using actual schema
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.log('❌ Database fetch failed:', error.message);
      return NextResponse.json({ 
        success: true, 
        data: [], 
        total: 0, 
        page: Math.floor(offset / limit) + 1, 
        limit, 
        totalPages: 0 
      });
    } else if (data && data.length > 0) {
      console.log('✅ Successfully fetched quotes from database:', data.length, 'quotes');
      console.log('📊 Sample quote data:', data[0]);
      
      // Transform the database data to match the quote interface
      const transformedDatabaseData = data.map((quote: any) => ({
        id: quote.id,
        quote_id: quote.id,
        client_name: `Customer ${quote.customer_id || 'Unknown'}`,
        client_id: quote.customer_id,
        design_id: quote.id,
        total_amount: quote.total_amount || 0,
        status: quote.status || 'draft',
        valid_until: quote.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [],
        notes: quote.notes || '',
        created_at: quote.created_at,
        updated_at: quote.updated_at
      }));

      console.log('✅ Returning Supabase quotes:', transformedDatabaseData.length, 'quotes');
      return NextResponse.json({ 
        success: true, 
        data: transformedDatabaseData, 
        total: data.length, 
        page: Math.floor(offset / limit) + 1, 
        limit, 
        totalPages: Math.ceil(data.length / limit) 
      });
    }

    // If database fetch succeeded but returned no data, return empty array
    console.log('⚠️ No quotes found in Supabase database');
    return NextResponse.json({ 
      success: true, 
      data: [], 
      total: 0, 
      page: Math.floor(offset / limit) + 1, 
      limit, 
      totalPages: 0 
    });
    
  } catch (error) {
    console.error('Error in quotes API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const body = await request.json();
    
    // Create a new quote record in the quotes table using actual schema
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        quote_number: body.quote_number || `Q-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6)}`,
        customer_id: body.client_id || body.customer_id,
        total_amount: body.total_amount || 0,
        status: body.status || 'draft',
        notes: body.notes || 'Quote created'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quote:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Quote created successfully'
    });

  } catch (error) {
    console.error('Error in quotes API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const body = await request.json()

    if (!body.quote_id) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    // Prepare update data - DO NOT include budget field to preserve original budget
    const updateData = {
      total_amount: body.total_amount,
        status: body.status,
        description: body.description,
      valid_until: body.valid_until,
        notes: body.notes,
        items: body.items,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      customer_address: body.customer_address,
      subtotal: body.subtotal,
      tax_rate: body.tax_rate,
      tax_amount: body.tax_amount,
      discount_total: body.discount_total,
      deposit_required: body.deposit_required,
      deposit_amount: body.deposit_amount,
      deposit_type: body.deposit_type,
      selected_tier: body.selected_tier,
      terms_and_conditions: body.terms_and_conditions,
        updated_at: new Date().toISOString(),
        // Add item field for proper quote identification
        item: body.item,
        // Add sent_at field for tracking when quote was sent
        sent_at: body.sent_at
    }

    console.log('Updating quote with data:', updateData)

    // Try to update in database
    let { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', body.quote_id)
      .select()
      .single()

    // If database fails, return error
    if (quoteError) {
      console.log('Database quote update failed:', quoteError.message)
      return NextResponse.json({
        success: false,
        error: 'Failed to update quote in database',
        details: quoteError.message
      }, { status: 500 })
    }

    console.log('Quote updated successfully in database:', quote)

    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Quote updated successfully'
    })

  } catch (error: any) {
    console.error('Update quote error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const body = await request.json()
    const { quote_id, total_amount, status, notes, valid_until, sent_at } = body

    if (!quote_id) {
      return NextResponse.json(
        { success: false, error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (total_amount !== undefined) updateData.total_amount = total_amount
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (valid_until !== undefined) updateData.valid_until = valid_until
    if (sent_at !== undefined) updateData.sent_at = sent_at

    console.log('Updating quote with data:', updateData)

    // Try to update in database
    let { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', quote_id)
      .select()
      .single()

    // If database fails, return error
    if (quoteError) {
      console.log('Database quote update failed:', quoteError.message)
      return NextResponse.json({
        success: false,
        error: 'Failed to update quote in database',
        details: quoteError.message
      }, { status: 500 })
    }

    console.log('Quote updated successfully in database:', quote)

    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Quote updated successfully'
    })

  } catch (error: any) {
    console.error('Update quote error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    // Delete quote
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting quote:', error)
      return NextResponse.json(
        { error: 'Failed to delete quote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete quote error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 