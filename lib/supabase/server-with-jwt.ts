"use server"

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function createSupabaseClientWithJWT(request: NextRequest) {
  // Create a regular Supabase client
  const client = createClient(supabaseUrl, supabaseAnonKey)
  
  // Check for Authorization header
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    try {
      // Verify the token and get user info
      const { data: { user }, error } = await client.auth.getUser(token)
      
      if (error) {
        console.log('JWT verification failed:', error.message)
        return { client, user: null, error }
      }
      
      if (user) {
        console.log('JWT verified for user:', user.email)
        return { client, user, error: null }
      }
    } catch (error) {
      console.log('Error verifying JWT:', error)
      return { client, user: null, error }
    }
  }
  
  return { client, user: null, error: new Error('No valid authorization header') }
}
