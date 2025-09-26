'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { User, Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

export type UserRole = 'admin' | 'manager' | 'sales' | 'production' | 'logistics' | 'viewer'

interface UserPermissions {
  canViewCustomers: boolean
  canEditCustomers: boolean
  canViewOrders: boolean
  canEditOrders: boolean
  canViewInventory: boolean
  canEditInventory: boolean
  canViewProduction: boolean
  canEditProduction: boolean
  canViewAnalytics: boolean
  canManageUsers: boolean
  canViewFinancials: boolean
  canEditFinancials: boolean
  canViewReports: boolean
  canExportData: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  userRole: UserRole | null
  permissions: UserPermissions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  hasPermission: (permission: keyof UserPermissions) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Test user for development - properly typed to match Supabase User interface
const TEST_USER: User = {
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

// Role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewCustomers: true,
    canEditCustomers: true,
    canViewOrders: true,
    canEditOrders: true,
    canViewInventory: true,
    canEditInventory: true,
    canViewProduction: true,
    canEditProduction: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canViewFinancials: true,
    canEditFinancials: true,
    canViewReports: true,
    canExportData: true
  },
  manager: {
    canViewCustomers: true,
    canEditCustomers: true,
    canViewOrders: true,
    canEditOrders: true,
    canViewInventory: true,
    canEditInventory: true,
    canViewProduction: true,
    canEditProduction: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canViewFinancials: true,
    canEditFinancials: false,
    canViewReports: true,
    canExportData: true
  },
  sales: {
    canViewCustomers: true,
    canEditCustomers: true,
    canViewOrders: true,
    canEditOrders: true,
    canViewInventory: true,
    canEditInventory: false,
    canViewProduction: false,
    canEditProduction: false,
    canViewAnalytics: true,
    canManageUsers: false,
    canViewFinancials: false,
    canEditFinancials: false,
    canViewReports: false,
    canExportData: false
  },
  production: {
    canViewCustomers: false,
    canEditCustomers: false,
    canViewOrders: true,
    canEditOrders: false,
    canViewInventory: true,
    canEditInventory: true,
    canViewProduction: true,
    canEditProduction: true,
    canViewAnalytics: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditFinancials: false,
    canViewReports: false,
    canExportData: false
  },
  logistics: {
    canViewCustomers: false,
    canEditCustomers: false,
    canViewOrders: true,
    canEditOrders: false,
    canViewInventory: true,
    canEditInventory: true,
    canViewProduction: false,
    canEditProduction: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditFinancials: false,
    canViewReports: false,
    canExportData: false
  },
  viewer: {
    canViewCustomers: true,
    canEditCustomers: false,
    canViewOrders: true,
    canEditOrders: false,
    canViewInventory: true,
    canEditInventory: false,
    canViewProduction: true,
    canEditProduction: false,
    canViewAnalytics: true,
    canManageUsers: false,
    canViewFinancials: false,
    canEditFinancials: false,
    canViewReports: false,
    canExportData: false
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions>(ROLE_PERMISSIONS.viewer)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const isDemoModeRef = useRef(false)
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      return createSupabaseBrowserClient()
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      return null
    }
  }, [])

  // Get user role from user metadata
  const getUserRole = (user: User): UserRole => {
    const role = user.user_metadata?.role || 'viewer'
    return Object.keys(ROLE_PERMISSIONS).includes(role) ? role as UserRole : 'viewer'
  }

  // Update permissions based on role
  const updatePermissions = (role: UserRole) => {
    setPermissions(ROLE_PERMISSIONS[role])
  }

  // Keep ref in sync with state
  useEffect(() => {
    isDemoModeRef.current = isDemoMode
  }, [isDemoMode])

  useEffect(() => {
    if (!supabase) return
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const role = getUserRole(session.user)
          setUserRole(role)
          updatePermissions(role)
        }
      } catch (error) {
        console.warn('Failed to get initial session, using default state:', error)
        // Set default state on error
        setUser(null)
        setUserRole(null)
        setPermissions(ROLE_PERMISSIONS.viewer)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        try {
          console.log(`🔄 Auth state change: ${event}`, session ? 'with session' : 'no session')
          
          // Skip auth state changes if we're in demo mode
          if (isDemoModeRef.current) {
            console.log('🚫 Skipping auth state change - demo mode active')
            return
          }
          
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            const role = getUserRole(session.user)
            setUserRole(role)
            updatePermissions(role)
            console.log(`✅ User authenticated with role: ${role}`)
          } else {
            setUserRole(null)
            setPermissions(ROLE_PERMISSIONS.viewer)
            console.log('🔓 User signed out, reset to viewer permissions')
          }
          
          setLoading(false)

          if (event === 'SIGNED_IN') {
            toast.success('Successfully signed in!')
            // Redirect to customers page after successful login
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard/customers'
            }
          } else if (event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!')
          }
        } catch (error) {
          console.warn('Auth state change error:', error)
          setLoading(false)
        }
      }
    )

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      // Check for test user credentials - enhanced demo login
      if (email === 'test@jewelia.com' && password === 'testpassword123') {
        console.log('🔐 Demo login detected, creating mock session...')
        
        // Set demo mode to prevent auth state changes from overriding
        setIsDemoMode(true)
        isDemoModeRef.current = true
        
        // Create a mock session for test user
        const mockSession = {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: TEST_USER
        } as Session

        // Set all the state immediately
        setSession(mockSession)
        setUser(TEST_USER)
        setUserRole('admin')
        updatePermissions('admin')
        setLoading(false)
        
        console.log('✅ Demo login successful, user state updated')
        return
      }

      // Try real Supabase auth only if not demo
      console.log('🔐 Attempting real Supabase authentication...')
      setIsDemoMode(false) // Exit demo mode for real auth
      isDemoModeRef.current = false
      
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }
      } catch (supabaseError: any) {
        console.warn('Real Supabase auth failed, checking if this might be demo credentials:', supabaseError)
        
        // If Supabase auth fails and we're using test credentials, fall back to demo mode
        if (email === 'test@jewelia.com' && password === 'testpassword123') {
          console.log('🔄 Supabase auth failed, but using test credentials - falling back to demo mode')
          setIsDemoMode(true)
          isDemoModeRef.current = true
          
          // Create a mock session for test user
          const mockSession = {
            access_token: 'test-token',
            refresh_token: 'test-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: TEST_USER
          } as Session

          // Set all the state immediately
          setSession(mockSession)
          setUser(TEST_USER)
          setUserRole('admin')
          updatePermissions('admin')
          setLoading(false)
          
          console.log('✅ Demo login successful via fallback, user state updated')
          return
        }
        
        // If not test credentials, throw the original error
        throw supabaseError
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      // Prepare user metadata
      const metadata = {
        full_name: userData?.firstName && userData?.lastName 
          ? `${userData.firstName} ${userData.lastName}`
          : userData?.firstName || userData?.lastName || '',
        first_name: userData?.firstName || '',
        last_name: userData?.lastName || '',
        company: userData?.company || '',
        role: 'viewer' // Default role for new users
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        throw error
      }

      toast.success('Account created! Please check your email to verify your account.')
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  const signOut = async () => {
    try {
      // Clear test user session
      if (user?.email === 'test@jewelia.com' || isDemoMode) {
        setIsDemoMode(false)
        isDemoModeRef.current = false
        setSession(null)
        setUser(null)
        setUserRole(null)
        setPermissions(ROLE_PERMISSIONS.viewer)
        return
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Sign out error:', error)
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      toast.success('Password reset email sent!')
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw new Error(error.message || 'Failed to send reset email')
    }
  }

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions[permission] || false
  }

  const value = {
    user,
    session,
    loading,
    userRole,
    permissions,
    signIn,
    signUp,
    signOut,
    resetPassword,
    hasPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
