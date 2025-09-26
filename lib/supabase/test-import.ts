// Test file to verify module imports
import { createSupabaseBrowserClient } from './browser'
import { createSupabaseServerClient } from './server'

console.log('🧪 Test imports working:')
console.log('Browser client:', typeof createSupabaseBrowserClient)
console.log('Server client:', typeof createSupabaseServerClient)

export { createSupabaseBrowserClient, createSupabaseServerClient }
