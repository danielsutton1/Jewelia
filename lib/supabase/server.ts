"use server"

import { createClient } from '@supabase/supabase-js'

// Global flag to prevent multiple client creation
let serverClientCreated = false
let cachedServerClient: any = null

export async function createSupabaseServerClient() {
  // Return cached client if already created
  if (serverClientCreated && cachedServerClient) {
    return cachedServerClient
  }
  
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }
  
  try {
    // Use service role key if available for server-side operations
    const key = supabaseServiceKey || supabaseAnonKey
    
    cachedServerClient = createClient(supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    serverClientCreated = true
    return cachedServerClient
  } catch (error) {
    console.error('Failed to create Supabase server client:', error)
    throw error
  }
} 