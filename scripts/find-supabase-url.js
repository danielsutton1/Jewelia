// Find Your Supabase Project URL
// Run this in your browser console on any page

console.log('🔍 Finding your Supabase project URL...')

// Method 1: Check if environment variables are loaded
if (typeof process !== 'undefined' && process.env) {
  console.log('Environment variables found:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Not set')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set')
} else {
  console.log('❌ Environment variables not accessible in browser')
}

// Method 2: Check if Supabase client is working
try {
  // Try to access the Supabase client
  if (window.supabase) {
    console.log('✅ Supabase client found in window object')
    console.log('Supabase URL:', window.supabase.supabaseUrl)
  } else {
    console.log('❌ Supabase client not found in window object')
  }
} catch (error) {
  console.log('❌ Error accessing Supabase client:', error.message)
}

// Method 3: Check network requests
console.log('\n📡 Check your browser\'s Network tab for requests to:')
console.log('- https://[YOUR-PROJECT-REF].supabase.co')
console.log('- Look for any failed requests to Supabase endpoints')

// Method 4: Manual check
console.log('\n🔧 Manual Check:')
console.log('1. Go to your Supabase Dashboard')
console.log('2. Look at the URL in your browser')
console.log('3. It should look like: https://[PROJECT-REF].supabase.co')
console.log('4. Copy the PROJECT-REF part')

console.log('\n💡 If you find your project URL, update your .env.local file with:')
console.log('NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co')
