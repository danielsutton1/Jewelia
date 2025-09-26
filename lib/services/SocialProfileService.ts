import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SocialProfile, UserConnection, UserRelationship, SocialPreferences } from '@/types/social-profile'
import { z } from 'zod'

// Validation schemas
const CreateProfileSchema = z.object({
  display_name: z.string().min(2).max(255),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(1000).optional(),
  avatar_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  website_url: z.string().url().optional(),
  location: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  job_title: z.string().max(255).optional(),
  industry: z.string().max(100).optional(),
  social_links: z.record(z.string().url()).optional(),
  is_public: z.boolean().default(true),
  show_online_status: z.boolean().default(true),
  allow_messages: z.boolean().default(true),
  allow_follows: z.boolean().default(true),
})

const UpdateProfileSchema = CreateProfileSchema.partial()

const ConnectionRequestSchema = z.object({
  following_id: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'blocked']).default('pending'),
})

const RelationshipRequestSchema = z.object({
  user_b_id: z.string().uuid(),
  relationship_type: z.enum(['friend', 'colleague', 'mentor', 'mentee', 'partner']),
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
})

export class SocialProfileService {
  private supabase = createSupabaseServerClient() as any

  /**
   * Create a social profile for a user
   */
  async createProfile(userId: string, profileData: z.infer<typeof CreateProfileSchema>): Promise<SocialProfile> {
    try {
      const validatedData = CreateProfileSchema.parse(profileData)

      // Check if username is available
      const { data: existingProfile } = await this.supabase
        .from('social_profiles')
        .select('username')
        .eq('username', validatedData.username)
        .single()

      if (existingProfile) {
        throw new Error('Username already taken')
      }

      // Create profile
      const { data: profile, error } = await this.supabase
        .from('social_profiles')
        .insert([{
          user_id: userId,
          ...validatedData,
          social_links: validatedData.social_links || {},
        }])
        .select()
        .single()

      if (error) throw error

      // Create default social preferences
      await this.createDefaultPreferences(userId)

      return this.transformProfileData(profile)
    } catch (error) {
      console.error('Error creating social profile:', error)
      throw error
    }
  }

  /**
   * Get a social profile by user ID
   */
  async getProfile(userId: string): Promise<SocialProfile | null> {
    try {
      const { data: profile, error } = await this.supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return this.transformProfileData(profile)
    } catch (error) {
      console.error('Error getting social profile:', error)
      throw error
    }
  }

  /**
   * Get a public profile by username
   */
  async getPublicProfile(username: string): Promise<SocialProfile | null> {
    try {
      const { data: profile, error } = await this.supabase
        .from('social_profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return this.transformProfileData(profile)
    } catch (error) {
      console.error('Error getting public profile:', error)
      throw error
    }
  }

  /**
   * Update a social profile
   */
  async updateProfile(userId: string, updates: z.infer<typeof UpdateProfileSchema>): Promise<SocialProfile> {
    try {
      const validatedData = UpdateProfileSchema.parse(updates)

      // If username is being updated, check availability
      if (validatedData.username) {
        const { data: existingProfile } = await this.supabase
          .from('social_profiles')
          .select('username')
          .eq('username', validatedData.username)
          .neq('user_id', userId)
          .single()

        if (existingProfile) {
          throw new Error('Username already taken')
        }
      }

      const { data: profile, error } = await this.supabase
        .from('social_profiles')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return this.transformProfileData(profile)
    } catch (error) {
      console.error('Error updating social profile:', error)
      throw error
    }
  }

  /**
   * Search for profiles
   */
  async searchProfiles(query: string, filters?: {
    industry?: string
    location?: string
    is_verified?: boolean
  }): Promise<SocialProfile[]> {
    try {
      let supabaseQuery = this.supabase
        .from('social_profiles')
        .select('*')
        .eq('is_public', true)
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)

      if (filters?.industry) {
        supabaseQuery = supabaseQuery.eq('industry', filters.industry)
      }

      if (filters?.location) {
        supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`)
      }

      if (filters?.is_verified !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_verified', filters.is_verified)
      }

      const { data: profiles, error } = await supabaseQuery
        .order('follower_count', { ascending: false })
        .limit(50)

      if (error) throw error

      return profiles.map((profile: any) => this.transformProfileData(profile))
    } catch (error) {
      console.error('Error searching profiles:', error)
      throw error
    }
  }

  /**
   * Create a connection request (follow)
   */
  async createConnection(followerId: string, connectionData: z.infer<typeof ConnectionRequestSchema>): Promise<UserConnection> {
    try {
      const validatedData = ConnectionRequestSchema.parse(connectionData)

      // Check if connection already exists
      const { data: existingConnection } = await this.supabase
        .from('user_connections')
        .select('*')
        .eq('follower_id', followerId)
        .eq('following_id', validatedData.following_id)
        .single()

      if (existingConnection) {
        throw new Error('Connection already exists')
      }

      // Create connection
      const { data: connection, error } = await this.supabase
        .from('user_connections')
        .insert([{
          follower_id: followerId,
          following_id: validatedData.following_id,
          status: validatedData.status,
        }])
        .select()
        .single()

      if (error) throw error

      return this.transformConnectionData(connection)
    } catch (error) {
      console.error('Error creating connection:', error)
      throw error
    }
  }

  /**
   * Update connection status
   */
  async updateConnectionStatus(
    connectionId: string,
    userId: string,
    status: 'accepted' | 'rejected' | 'blocked'
  ): Promise<UserConnection> {
    try {
      const { data: connection, error } = await this.supabase
        .from('user_connections')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connectionId)
        .eq('following_id', userId) // Only the person being followed can update status
        .select()
        .single()

      if (error) throw error

      return this.transformConnectionData(connection)
    } catch (error) {
      console.error('Error updating connection status:', error)
      throw error
    }
  }

  /**
   * Get user's connections
   */
  async getUserConnections(userId: string, type: 'followers' | 'following'): Promise<UserConnection[]> {
    try {
      const column = type === 'followers' ? 'following_id' : 'follower_id'
      const { data: connections, error } = await this.supabase
        .from('user_connections')
        .select(`
          *,
          ${type === 'followers' ? 'follower:social_profiles!user_connections_follower_id_fkey(*)' : 'following:social_profiles!user_connections_following_id_fkey(*)'}
        `)
        .eq(column, userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })

      if (error) throw error

      return connections.map((connection: any) => this.transformConnectionData(connection))
    } catch (error) {
      console.error('Error getting user connections:', error)
      throw error
    }
  }

  /**
   * Create a relationship request
   */
  async createRelationship(userAId: string, relationshipData: z.infer<typeof RelationshipRequestSchema>): Promise<UserRelationship> {
    try {
      const validatedData = RelationshipRequestSchema.parse(relationshipData)

      // Check if relationship already exists
      const { data: existingRelationship } = await this.supabase
        .from('user_relationships')
        .select('*')
        .or(`user_a_id.eq.${userAId},user_b_id.eq.${userAId}`)
        .or(`user_a_id.eq.${validatedData.user_b_id},user_b_id.eq.${validatedData.user_b_id}`)
        .single()

      if (existingRelationship) {
        throw new Error('Relationship already exists')
      }

      // Create relationship
      const { data: relationship, error } = await this.supabase
        .from('user_relationships')
        .insert([{
          user_a_id: userAId,
          user_b_id: validatedData.user_b_id,
          relationship_type: validatedData.relationship_type,
          status: validatedData.status,
        }])
        .select()
        .single()

      if (error) throw error

      return this.transformRelationshipData(relationship)
    } catch (error) {
      console.error('Error creating relationship:', error)
      throw error
    }
  }

  /**
   * Get user's relationships
   */
  async getUserRelationships(userId: string): Promise<UserRelationship[]> {
    try {
      const { data: relationships, error } = await this.supabase
        .from('user_relationships')
        .select(`
          *,
          user_a:social_profiles!user_relationships_user_a_id_fkey(*),
          user_b:social_profiles!user_relationships_user_b_id_fkey(*)
        `)
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })

      if (error) throw error

      return relationships.map((relationship: any) => this.transformRelationshipData(relationship))
    } catch (error) {
      console.error('Error getting user relationships:', error)
      throw error
    }
  }

  /**
   * Create default social preferences
   */
  private async createDefaultPreferences(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('social_preferences')
        .insert([{
          user_id: userId,
          // All defaults are set in the schema
        }])
    } catch (error) {
      console.error('Error creating default preferences:', error)
      // Don't throw - this is not critical
    }
  }

  /**
   * Get social preferences
   */
  async getPreferences(userId: string): Promise<SocialPreferences | null> {
    try {
      const { data: preferences, error } = await this.supabase
        .from('social_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return preferences
    } catch (error) {
      console.error('Error getting preferences:', error)
      throw error
    }
  }

  /**
   * Update social preferences
   */
  async updatePreferences(userId: string, updates: Partial<SocialPreferences>): Promise<SocialPreferences> {
    try {
      const { data: preferences, error } = await this.supabase
        .from('social_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return preferences
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }

  /**
   * Transform profile data from database
   */
  private transformProfileData(data: any): SocialProfile {
    return {
      id: data.id,
      user_id: data.user_id,
      display_name: data.display_name,
      username: data.username,
      bio: data.bio,
      avatar_url: data.avatar_url,
      cover_image_url: data.cover_image_url,
      website_url: data.website_url,
      location: data.location,
      company: data.company,
      job_title: data.job_title,
      industry: data.industry,
      follower_count: data.follower_count || 0,
      following_count: data.following_count || 0,
      post_count: data.post_count || 0,
      like_count: data.like_count || 0,
      social_links: data.social_links || {},
      is_public: data.is_public,
      show_online_status: data.show_online_status,
      allow_messages: data.allow_messages,
      allow_follows: data.allow_follows,
      is_verified: data.is_verified,
      badges: data.badges || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_active_at: data.last_active_at,
    }
  }

  /**
   * Transform connection data from database
   */
  private transformConnectionData(data: any): UserConnection {
    return {
      id: data.id,
      follower_id: data.follower_id,
      following_id: data.following_id,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      follower: data.follower ? this.transformProfileData(data.follower) : undefined,
      following: data.following ? this.transformProfileData(data.following) : undefined,
    }
  }

  /**
   * Transform relationship data from database
   */
  private transformRelationshipData(data: any): UserRelationship {
    return {
      id: data.id,
      user_a_id: data.user_a_id,
      user_b_id: data.user_b_id,
      relationship_type: data.relationship_type,
      status: data.status,
      mutual_connection: data.mutual_connection,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_a: data.user_a ? this.transformProfileData(data.user_a) : undefined,
      user_b: data.user_b ? this.transformProfileData(data.user_b) : undefined,
    }
  }
} 