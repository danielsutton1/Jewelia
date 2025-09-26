import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Update customers with company data using raw SQL to bypass schema cache
    const updates = [
      { id: '802932ba-6156-4ec1-88ec-279b2f0d16d5', company: 'Johnson & Associates' },
      { id: '3fcf1ad1-380d-4555-8d05-73515f37765e', company: 'Chen Technologies' },
      { id: '55d548a9-f5c5-4a23-b49e-7f48c9d8c669', company: 'Davis Consulting' },
      { id: '44a7e9a3-58fa-44c3-a87a-ac34917fcc31', company: 'Wilson Enterprises' },
      { id: '9db5c01f-adea-4ade-b843-5587e9d05b20', company: 'Anderson Manufacturing' },
      { id: 'a5810d13-6076-48a4-b981-e3008e6bd581', company: 'Wilson & Co.' },
      { id: '3baef741-a9fd-4b70-b0da-5d9e7e250553', company: 'Foster Design Studio' },
      { id: 'ca2ab5c5-88c8-4034-b268-415f1afad997', company: 'Kim Solutions' },
      { id: 'dbec946e-3f59-42d1-b0bf-ca2105af0ec9', company: 'Davis Creative' },
      { id: '031a23fe-e6f3-448d-b8fc-4af596a3228c', company: 'Brown & Associates' }
    ]

    let updatedCount = 0;
    for (const update of updates) {
      // Use raw SQL to bypass schema cache issues
      const { data, error } = await supabase.rpc('update_customer_company', {
        customer_id: update.id,
        company_name: update.company
      })

      if (error) {
        console.error(`Error updating customer ${update.id}:`, error)
        // Fallback to direct SQL if RPC doesn't exist
        const { error: sqlError } = await supabase
          .from('customers')
          .update({ company: update.company })
          .eq('id', update.id)
        
        if (sqlError) {
          console.error(`SQL fallback error for ${update.id}:`, sqlError)
        } else {
          updatedCount++;
          console.log(`Updated customer ${update.id} with company ${update.company}`);
        }
      } else {
        updatedCount++;
        console.log(`Updated customer ${update.id} with company ${update.company}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} customers with company data`, 
      updatedCount 
    });
  } catch (error) {
    console.error('Error populating company data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to populate company data', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 