import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Provider } from '@supabase/supabase-js'

export interface SocialAuthConfig {
  redirectTo?: string
  scopes?: string
}

export class SocialAuthService {
  private supabase = createSupabaseBrowserClient()

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: Provider, config?: SocialAuthConfig) {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: config?.redirectTo || `${window.location.origin}/auth/callback`,
          scopes: config?.scopes || 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
      return { success: false, error }
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(config?: SocialAuthConfig) {
    return this.signInWithProvider('google', config)
  }

  /**
   * Sign in with Facebook
   */
  async signInWithFacebook(config?: SocialAuthConfig) {
    return this.signInWithProvider('facebook', config)
  }

  /**
   * Sign in with LinkedIn
   */
  async signInWithLinkedIn(config?: SocialAuthConfig) {
    return this.signInWithProvider('linkedin', config)
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub(config?: SocialAuthConfig) {
    return this.signInWithProvider('github', config)
  }

  /**
   * Get available OAuth providers
   */
  getAvailableProviders(): Provider[] {
    return ['google', 'facebook', 'linkedin', 'github']
  }

  /**
   * Check if user has connected social accounts
   */
  async getConnectedAccounts(userId: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      if (error || !user) throw error

      // Get user's identities (connected accounts)
      const identities = user.identities || []
      return {
        success: true,
        data: identities.map((identity: any) => ({
          provider: identity.provider,
          id: identity.id,
          created_at: identity.created_at,
        }))
      }
    } catch (error) {
      console.error('Error getting connected accounts:', error)
      return { success: false, error }
    }
  }

  /**
   * Disconnect social account
   */
  async disconnectAccount(provider: Provider) {
    try {
      // Note: Supabase doesn't directly support disconnecting OAuth accounts
      // This would typically require additional backend logic
      console.warn('Account disconnection requires backend implementation')
      return { success: false, error: 'Not implemented' }
    } catch (error) {
      console.error('Error disconnecting account:', error)
      return { success: false, error }
    }
  }
}

export const socialAuthService = new SocialAuthService() 