const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key] = value
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleProducts = [
  {
    Product: 'Diamond Engagement Ring',
    Price: 2500.00,
    Stock: 5,
    Category: 'Rings',
    SKU: 'RING-001',
    Image: '/assorted-jewelry-display.png',
    Status: 'Active'
  },
  {
    Product: 'Pearl Necklace',
    Price: 450.00,
    Stock: 12,
    Category: 'Necklaces',
    SKU: 'NECK-001',
    Image: '/gold-necklace.png',
    Status: 'Active'
  },
  {
    Product: 'Sapphire Stud Earrings',
    Price: 350.00,
    Stock: 8,
    Category: 'Earrings',
    SKU: 'EARR-001',
    Image: '/silver-earrings.png',
    Status: 'Active'
  },
  {
    Product: 'Tennis Bracelet',
    Price: 1800.00,
    Stock: 3,
    Category: 'Bracelets',
    SKU: 'BRAC-001',
    Image: '/emerald-bracelet.png',
    Status: 'Active'
  },
  {
    Product: 'Luxury Watch',
    Price: 3200.00,
    Stock: 2,
    Category: 'Watches',
    SKU: 'WATCH-001',
    Image: '/luxury-watch.png',
    Status: 'Active'
  }
]

async function addSampleProducts() {
  try {
    console.log('Adding sample products...')
    
    for (const product of sampleProducts) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
      
      if (error) {
        console.error(`Error adding ${product.Product}:`, error)
      } else {
        console.log(`✅ Added: ${product.Product}`)
      }
    }
    
    console.log('Sample products added successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

addSampleProducts() 