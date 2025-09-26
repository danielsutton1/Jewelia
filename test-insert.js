#!/usr/bin/env node

// Simple test script to insert data into Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jplmmjcwwhjrltlevkoh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbG1tamN3d2hqcmx0bGV2a29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTI1MDksImV4cCI6MjA2MzMyODUwOX0.PQTyBGcwNWCCnlDkjOUjKhfeys8kDLfYi_ohcw02vu0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  console.log('🧪 Testing database insert...')
  
  // Try to insert a simple customer record
  const { data, error } = await supabase
    .from('customers')
    .insert([
      {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '555-0123',
        created_at: new Date().toISOString()
      }
    ])
    .select()
  
  if (error) {
    console.error('❌ Error inserting customer:', error)
  } else {
    console.log('✅ Customer inserted successfully:', data)
  }
}

testInsert()
