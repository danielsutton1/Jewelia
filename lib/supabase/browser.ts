"use client"

import { createClient } from '@supabase/supabase-js'

// Global flag to prevent multiple client creation
let clientCreated = false
let cachedClient: any = null

export function createSupabaseBrowserClient() {
  // Return cached client if already created
  if (clientCreated && cachedClient) {
    return cachedClient
  }
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Return null for server-side rendering
    return null
  }
  
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }
  
  try {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey)
    clientCreated = true
    return cachedClient
  } catch (error) {
    console.error('Failed to create Supabase browser client:', error)
    throw error
  }
} 