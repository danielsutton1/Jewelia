// Comprehensive mock Supabase client for all services
// This replaces direct createClient imports to ensure consistent mocking

export const createMockSupabaseClient = () => {
  console.log('🔧 Creating mock Supabase client for service...')
  
  // Mock user for demo purposes
  const mockUser = {
    id: 'test-user-id',
    email: 'test@jewelia.com',
    user_metadata: {
      full_name: 'Test User',
      role: 'admin'
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    confirmation_sent_at: undefined,
    confirmed_at: undefined,
    recovery_sent_at: undefined,
    phone: undefined,
    phone_confirmed_at: undefined,
    factors: undefined,
    identities: []
  }

  // Mock session for demo purposes
  const mockSession = {
    access_token: 'test-token',
    refresh_token: 'test-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser
  }

  // Store auth state
  let currentUser: any = null
  let currentSession: any = null
  let authStateChangeCallbacks: Array<{ event: string; session: any; callback: Function }> = []

  const mockClient = {
    auth: {
      getUser: () => {
        console.log('🔍 Mock getUser called, returning:', currentUser)
        return Promise.resolve({ data: { user: currentUser }, error: null })
      },
      signIn: () => {
        console.log('🔍 Mock signIn called, returning:', currentUser)
        return Promise.resolve({ data: { user: currentUser }, error: null })
      },
      signOut: () => {
        console.log('🔓 Mock signOut called, clearing user state')
        currentUser = null
        currentSession = null
        // Trigger auth state change
        authStateChangeCallbacks.forEach(({ event, callback }) => {
          if (event === 'SIGNED_OUT') {
            try {
              callback('SIGNED_OUT', null)
            } catch (error) {
              console.log('Error in auth state change callback:', error)
            }
          }
        })
        return Promise.resolve({ error: null })
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        console.log('🔄 Mock onAuthStateChange called, storing callback')
        // Store callback for later use
        const callbackObj = { event: 'SIGNED_IN', session: currentSession, callback }
        authStateChangeCallbacks.push(callbackObj)
        
        // Return subscription object
        return {
          data: { 
            subscription: { 
              unsubscribe: () => {
                console.log('🔄 Unsubscribing from mock auth state change')
                // Remove callback
                authStateChangeCallbacks = authStateChangeCallbacks.filter(cb => cb !== callbackObj)
              } 
            } 
          }
        }
      },
      getSession: () => {
        console.log('🔍 Mock getSession called, returning:', currentSession)
        return Promise.resolve({ data: { session: currentSession }, error: null })
      },
      refreshSession: () => {
        console.log('🔄 Mock refreshSession called, returning:', currentSession)
        return Promise.resolve({ data: { session: currentSession }, error: null })
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        console.log('🔐 Mock signInWithPassword called with:', email)
        
        // Handle demo login
        if (email === 'test@jewelia.com' && password === 'testpassword123') {
          console.log('✅ Demo credentials accepted, setting mock user')
          currentUser = mockUser
          currentSession = mockSession
          
          // Trigger auth state change for all stored callbacks
          authStateChangeCallbacks.forEach(({ event, callback }) => {
            if (event === 'SIGNED_IN') {
              try {
                console.log('🔄 Triggering auth state change callback for SIGNED_IN')
                callback('SIGNED_IN', currentSession)
              } catch (error) {
                console.log('Error in auth state change callback:', error)
              }
            }
          })
          
          return Promise.resolve({ data: { user: currentUser, session: currentSession }, error: null })
        }
        
        // For other credentials, return error
        console.log('❌ Invalid credentials, returning error')
        return Promise.resolve({ 
          data: { user: null, session: null }, 
          error: { message: 'Invalid credentials' } 
        })
      }
    },
    from: (table: string) => {
      // Create a comprehensive mock query builder that supports all methods
      const queryBuilder = {
        select: (columns?: string) => {
          // Handle count queries
          if (columns === '*') {
            return {
              eq: (column: string, value: any) => ({
                eq: (column2: string, value2: any) => Promise.resolve({ data: 0, error: null }),
                single: () => Promise.resolve({ data: 0, error: null }),
                maybeSingle: () => Promise.resolve({ data: 0, error: null }),
              }),
              single: () => Promise.resolve({ data: 0, error: null }),
              maybeSingle: () => Promise.resolve({ data: 0, error: null }),
            }
          }
          
          // Create a chainable query builder
          const chainableBuilder = {
            eq: (column: string, value: any) => chainableBuilder,
            neq: (column: string, value: any) => chainableBuilder,
            gt: (column: string, value: any) => chainableBuilder,
            lt: (column: string, value: any) => chainableBuilder,
            gte: (column: string, value: any) => chainableBuilder,
            lte: (column: string, value: any) => chainableBuilder,
            like: (column: string, value: string) => chainableBuilder,
            ilike: (column: string, value: string) => chainableBuilder,
            in: (column: string, values: any[]) => chainableBuilder,
            or: (condition: string) => chainableBuilder,
            and: (condition: string) => chainableBuilder,
            order: (column: string, options?: { ascending?: boolean }) => chainableBuilder,
            limit: (count: number) => chainableBuilder,
            range: (from: number, to: number) => chainableBuilder,
            single: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
          }
          
          return chainableBuilder
        },
        insert: (values: any) => Promise.resolve({ data: null, error: null }),
        update: (values: any) => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        upsert: (values: any) => Promise.resolve({ data: null, error: null }),
      }
      
      return queryBuilder
    },
    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: any) => Promise.resolve({ data: null, error: null }),
        download: (path: string) => Promise.resolve({ data: null, error: null }),
        remove: (paths: string[]) => Promise.resolve({ data: null, error: null }),
        list: (path?: string) => Promise.resolve({ data: [], error: null }),
      }),
    },
    functions: {
      invoke: (name: string, options?: any) => Promise.resolve({ data: null, error: null }),
    },
    realtime: {
      channel: (name: string) => ({
        on: (event: string, callback: Function) => ({ unsubscribe: () => {} }),
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
    },
  }

  console.log('✅ Mock Supabase client created successfully')
  return mockClient as any
}

// Export a default mock client instance
export const mockSupabaseClient = createMockSupabaseClient()

// Mock the createClient function to return our mock client
export const createClient = (url: string, key: string, options?: any) => {
  console.log('🔧 Mock createClient called, returning mock client')
  return mockSupabaseClient
}
