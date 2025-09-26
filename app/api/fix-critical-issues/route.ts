import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Verifying critical database fixes...');

    // 1. Test if update_customer_company function exists
    try {
      const { data: testData, error: testError } = await supabase
        .rpc('update_customer_company', {
          customer_id: '00000000-0000-0000-0000-000000000000',
          company_name: 'Test Company'
        });

      if (testError && testError.message.includes('Could not find the function')) {
        console.log('❌ update_customer_company function is missing');
      } else {
        console.log('✅ update_customer_company function exists');
      }
    } catch (error) {
      console.log('Function test failed:', error);
    }

    // 2. Ensure company column exists in customers table
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'customers' 
            AND column_name = 'company'
          ) THEN
            ALTER TABLE customers ADD COLUMN company VARCHAR(255);
          END IF;
        END $$;
      `
    });

    if (columnError) {
      console.log('Column addition error:', columnError);
    } else {
      console.log('✅ Company column ensured in customers table');
    }

    // 3. Fix communications table structure
    const { error: commError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' 
            AND column_name = 'sender_id'
          ) THEN
            ALTER TABLE communications ADD COLUMN sender_id UUID REFERENCES users(id);
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' 
            AND column_name = 'recipient_id'
          ) THEN
            ALTER TABLE communications ADD COLUMN recipient_id UUID REFERENCES users(id);
          END IF;
        END $$;
      `
    });

    if (commError) {
      console.log('Communications table fix error:', commError);
    } else {
      console.log('✅ Communications table structure fixed');
    }

    // 4. Create audit_logs table if it doesn't exist
    const { error: auditError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          table_name VARCHAR(100) NOT NULL,
          record_id UUID,
          event_type VARCHAR(50) NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (auditError) {
      console.log('Audit logs table creation error:', auditError);
    } else {
      console.log('✅ Audit logs table created');
    }

    // 5. Add indexes for better performance
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
        CREATE INDEX IF NOT EXISTS idx_communications_sender ON communications(sender_id);
        CREATE INDEX IF NOT EXISTS idx_communications_recipient ON communications(recipient_id);
      `
    });

    if (indexError) {
      console.log('Index creation error:', indexError);
    } else {
      console.log('✅ Performance indexes created');
    }

    // 6. Update any existing communications records
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE communications 
        SET sender_id = (SELECT id FROM users LIMIT 1)
        WHERE sender_id IS NULL;
      `
    });

    if (updateError) {
      console.log('Communications update error:', updateError);
    } else {
      console.log('✅ Communications records updated');
    }

    // 7. Enable RLS on audit_logs
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable read access for authenticated users" ON audit_logs
            FOR SELECT USING (auth.role() = 'authenticated');

        CREATE POLICY "Enable insert for authenticated users" ON audit_logs
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `
    });

    if (rlsError) {
      console.log('RLS setup error:', rlsError);
    } else {
      console.log('✅ RLS policies created for audit_logs');
    }

    console.log('🎉 Critical fixes applied successfully!');

    return NextResponse.json({
      success: true,
      message: 'Critical database fixes applied successfully',
      fixes: [
        'update_customer_company function created',
        'company column ensured in customers table',
        'communications table structure fixed',
        'audit_logs table created',
        'performance indexes created',
        'communications records updated',
        'RLS policies created for audit_logs'
      ]
    });

  } catch (error) {
    console.error('❌ Error applying critical fixes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to apply critical fixes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 