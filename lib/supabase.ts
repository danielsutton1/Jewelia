import { createClient } from '@supabase/supabase-js'

// Get environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// For development, provide fallback values if environment variables are missing
const getSupabaseUrl = () => {
  if (supabaseUrl) return supabaseUrl
  if (typeof window !== 'undefined') {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not found in environment variables')
  }
  return 'https://jplmmjcwwhjrltlevkoh.supabase.co'
}

const getSupabaseAnonKey = () => {
  if (supabaseAnonKey) return supabaseAnonKey
  if (typeof window !== 'undefined') {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment variables')
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbG1tamN3d2hqcmx0bGV2a29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTI1MDksImV4cCI6MjA2MzMyODUwOX0.PQTyBGcwNWCCnlDkjOUjKhfeys8kDLfYi_ohcw02vu0'
}

// Create the main Supabase client with improved connection handling
export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'jewelia-crm'
    }
  }
})

// Create admin client only if service role key is available
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(getSupabaseUrl(), supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'jewelia-crm-admin'
        }
      }
    })
  : null

// Connection health check function
export const checkSupabaseConnection = async () => {
  try {
    // Try a simple query to test connection
    const { data, error } = await supabase.from('customers').select('count').limit(1)
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Supabase connection failed:', err)
    return false
  }
}

// Fallback database client for when Supabase is unavailable
export const createFallbackClient = () => {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Database unavailable' } })
        }),
        limit: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Database unavailable' } })
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: null, error: { message: 'Database unavailable' } })
        })
      })
    })
  }
}

// Retry mechanism for database operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      console.warn(`Database operation failed, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded')
}
