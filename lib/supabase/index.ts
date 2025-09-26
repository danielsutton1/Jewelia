// Centralized Supabase exports
export { createSupabaseBrowserClient } from './browser'
export { createSupabaseServerClient } from './server'
export { createMockSupabaseClient, mockSupabaseClient, createClient } from './mock-client'

// Re-export the mock client as the default for services
export { mockSupabaseClient as supabase } from './mock-client'

// Re-export types if needed
export type { CookieOptions } from '@supabase/ssr'

// Debug logging
console.log('🔍 Supabase index.ts loaded successfully')
