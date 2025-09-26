const { createClient } = require('@supabase/supabase-js');

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleQuotes = [
  {
    quote_number: 'Q-2025-001',
    customer_id: null, // Will be set to first customer
    total_amount: 2500.00,
    status: 'draft',
    description: 'Diamond engagement ring quote',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    notes: 'Customer requested 1.5 carat diamond with platinum setting',
    items: JSON.stringify([
      {
        name: 'Diamond Engagement Ring',
        description: '1.5 carat diamond with platinum setting',
        quantity: 1,
        unit_price: 2500.00,
        total_price: 2500.00
      }
    ])
  },
  {
    quote_number: 'Q-2025-002',
    customer_id: null, // Will be set to second customer
    total_amount: 1800.00,
    status: 'sent',
    description: 'Pearl necklace quote',
    valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    notes: 'South Sea pearls with 18k gold clasp',
    items: JSON.stringify([
      {
        name: 'Pearl Necklace',
        description: 'South Sea pearls with 18k gold clasp',
        quantity: 1,
        unit_price: 1800.00,
        total_price: 1800.00
      }
    ])
  },
  {
    quote_number: 'Q-2025-003',
    customer_id: null, // Will be set to third customer
    total_amount: 3200.00,
    status: 'accepted',
    description: 'Sapphire earrings quote',
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    notes: 'Customer accepted and paid deposit',
    items: JSON.stringify([
      {
        name: 'Sapphire Stud Earrings',
        description: 'Natural blue sapphires with white gold setting',
        quantity: 1,
        unit_price: 3200.00,
        total_price: 3200.00
      }
    ])
  },
  {
    quote_number: 'Q-2025-004',
    customer_id: null, // Will be set to fourth customer
    total_amount: 4500.00,
    status: 'sent',
    description: 'Wedding band set quote',
    valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
    notes: 'Matching his and hers wedding bands',
    items: JSON.stringify([
      {
        name: 'His Wedding Band',
        description: '14k white gold band',
        quantity: 1,
        unit_price: 1200.00,
        total_price: 1200.00
      },
      {
        name: 'Her Wedding Band',
        description: '14k white gold band with diamond accents',
        quantity: 1,
        unit_price: 3300.00,
        total_price: 3300.00
      }
    ])
  },
  {
    quote_number: 'Q-2025-005',
    customer_id: null, // Will be set to fifth customer
    total_amount: 950.00,
    status: 'declined',
    description: 'Silver bracelet quote',
    valid_until: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Expired 5 days ago
    notes: 'Customer found better price elsewhere',
    items: JSON.stringify([
      {
        name: 'Sterling Silver Bracelet',
        description: '925 sterling silver with turquoise stones',
        quantity: 1,
        unit_price: 950.00,
        total_price: 950.00
      }
    ])
  }
];

async function addSampleQuotes() {
  try {
    console.log('Adding sample quotes...');

    // First, get some customer IDs to assign to quotes
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .limit(5);

    if (customerError) {
      console.error('❌ Error fetching customers:', customerError);
      return;
    }

    if (!customers || customers.length === 0) {
      console.log('⚠️  No customers found. Creating quotes without customer assignments.');
    }

    // Add customer IDs to quotes
    const quotesWithCustomers = sampleQuotes.map((quote, index) => ({
      ...quote,
      customer_id: customers && customers[index] ? customers[index].id : null
    }));

    // Insert quotes
    const { data, error } = await supabase
      .from('quotes')
      .insert(quotesWithCustomers)
      .select('*');

    if (error) {
      if (error.message.includes('duplicate key')) {
        console.log('✅ Sample quotes already exist in database');
      } else {
        console.error('❌ Error adding sample quotes:', error);
      }
    } else {
      console.log('✅ Successfully added sample quotes!');
      console.log(`📊 Added ${data.length} quotes:`);
      data.forEach(quote => {
        console.log(`   - ${quote.quote_number}: $${quote.total_amount} (${quote.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Error in addSampleQuotes:', error);
  }
}

// Run the script
addSampleQuotes(); 