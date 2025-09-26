import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const currentYear = new Date().getFullYear();
    
    // First, check if quotes table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'quotes')
      .single();

    if (tableError || !tableExists) {
      // Table doesn't exist, create it with sample data
      console.log('Quotes table not found, creating it...');
      
      // Create the table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS quotes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            quote_number TEXT UNIQUE NOT NULL,
            customer_id UUID,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
            description TEXT,
            valid_until DATE,
            notes TEXT,
            items JSONB DEFAULT '[]',
            assignee_id UUID,
            sent_at TIMESTAMP WITH TIME ZONE,
            accepted_at TIMESTAMP WITH TIME ZONE,
            declined_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );

          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
          CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
          CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);
          CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
          CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until);

          -- Enable RLS
          ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

          -- Create RLS policies
          DROP POLICY IF EXISTS "Users can view quotes" ON quotes;
          CREATE POLICY "Users can view quotes" ON quotes FOR SELECT USING (true);

          DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
          CREATE POLICY "Users can create quotes" ON quotes FOR INSERT WITH CHECK (true);

          DROP POLICY IF EXISTS "Users can update quotes" ON quotes;
          CREATE POLICY "Users can update quotes" ON quotes FOR UPDATE USING (true);

          DROP POLICY IF EXISTS "Users can delete quotes" ON quotes;
          CREATE POLICY "Users can delete quotes" ON quotes FOR DELETE USING (true);
        `
      });

      if (createError) {
        console.error('Error creating quotes table:', createError);
        // Continue with fallback
      } else {
        // Insert sample quotes
        const { error: insertError } = await supabase.rpc('exec_sql', {
          sql: `
            INSERT INTO quotes (quote_number, customer_id, total_amount, status, notes, valid_until)
            SELECT 
              'Q-${currentYear}-001', 
              (SELECT id FROM customers LIMIT 1), 
              1500.00, 
              'draft', 
              'Sample quote for testing',
              CURRENT_DATE + INTERVAL '30 days'
            WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-${currentYear}-001');

            INSERT INTO quotes (quote_number, customer_id, total_amount, status, notes, valid_until)
            SELECT 
              'Q-${currentYear}-002', 
              (SELECT id FROM customers LIMIT 1), 
              2500.00, 
              'sent', 
              'Another sample quote',
              CURRENT_DATE + INTERVAL '30 days'
            WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-${currentYear}-002');

            INSERT INTO quotes (quote_number, customer_id, total_amount, status, notes, valid_until)
            SELECT 
              'Q-${currentYear}-003', 
              (SELECT id FROM customers LIMIT 1), 
              3200.00, 
              'accepted', 
              'Third sample quote',
              CURRENT_DATE + INTERVAL '30 days'
            WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-${currentYear}-003');
          `
        });

        if (insertError) {
          console.error('Error inserting sample quotes:', insertError);
        }
      }
    }
    
    // Now try to get the highest quote number for the current year
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('quote_number')
      .ilike('quote_number', `Q-${currentYear}-%`)
      .order('quote_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching quotes:', error);
      // Return fallback number
      const fallbackNumber = `Q-${currentYear}-001`;
      return NextResponse.json({
        success: true,
        data: {
          nextQuoteNumber: fallbackNumber,
          currentYear,
          nextNumber: 1
        }
      });
    }

    let nextNumber = 1;
    
    if (quotes && quotes.length > 0) {
      // Extract the number from the highest quote number
      const lastQuoteNumber = quotes[0].quote_number;
      const match = lastQuoteNumber.match(new RegExp(`Q-${currentYear}-(\\d+)`));
      
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Format the next quote number with leading zeros
    const nextQuoteNumber = `Q-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;

    return NextResponse.json({
      success: true,
      data: {
        nextQuoteNumber,
        currentYear,
        nextNumber
      }
    });

  } catch (error: any) {
    console.error('Next quote number API error:', error);
    // Return fallback number
    const currentYear = new Date().getFullYear();
    const fallbackNumber = `Q-${currentYear}-001`;
    return NextResponse.json({
      success: true,
      data: {
        nextQuoteNumber: fallbackNumber,
        currentYear,
        nextNumber: 1
      }
    });
  }
} 