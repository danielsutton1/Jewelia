// 🔑 GET JWT TOKEN SCRIPT
// This script helps you get a JWT token from Supabase

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from your .env.local file)
const supabaseUrl = 'https://jplmmjcwwhjrltlevkoh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbG1tamN3d2hqcmx0bGV2a29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTI1MDksImV4cCI6MjA2MzMyODUwOX0.PQTyBGcwNWCCnlDkjOUjKhfeys8kDLfYi_ohcw02vu0';

async function getJWTToken() {
  try {
    console.log('🔑 Getting JWT token from Supabase...');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Sign in with your email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'danielsutton1@gmail.com',
      password: 'Jewelia1$'
    });
    
    if (error) {
      console.error('❌ Error signing in:', error.message);
      return;
    }
    
    if (data.session) {
      console.log('✅ Successfully signed in!');
      console.log('🔑 JWT Token:');
      console.log(data.session.access_token);
      console.log('');
      console.log('📝 Copy this token and use it in your API calls');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Instructions
console.log('📋 INSTRUCTIONS:');
console.log('1. Get your Supabase anon key from .env.local file');
console.log('2. Replace "your-anon-key-here" with your actual anon key');
console.log('3. Replace "your-password-here" with your actual password');
console.log('4. Run: node get-jwt-token.js');
console.log('');

// Check if credentials are set
if (supabaseAnonKey === 'your-anon-key-here') {
  console.log('⚠️  Please update the script with your actual credentials first');
} else {
  getJWTToken();
}
