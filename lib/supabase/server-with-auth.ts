"use server"

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function createSupabaseServerClientWithAuth(request?: NextRequest) {
  const cookieStore = await cookies()

  // Create the base client
  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })

  // If we have a request with Authorization header, set the session
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        // First, verify the token is valid
        const { data: { user }, error: verifyError } = await client.auth.getUser(token)
        
        if (verifyError) {
          console.log('Token verification failed:', verifyError)
          return client
        }
        
        if (user) {
          // Set the session manually using the token
          const { data, error } = await client.auth.setSession({
            access_token: token,
            refresh_token: token, // Use the same token as refresh for now
          })
          
          if (error) {
            console.log('Failed to set session:', error)
          } else {
            console.log('Session set successfully for user:', data.user?.email)
          }
        }
      } catch (sessionError) {
        console.log('Error setting session:', sessionError)
      }
    }
  }

  return client
}
