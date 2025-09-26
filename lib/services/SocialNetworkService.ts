import { createSupabaseServerClient } from '@/lib/supabase/server'
import { 
  SocialPost, 
  CreatePostRequest, 
  UpdatePostRequest,
  SocialComment,
  CreateCommentRequest,
  UpdateCommentRequest,
  SocialPostLike,
  UserConnection,
  ConnectionRequest,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  ExtendedUser,
  UserProfileExtension,
  FeedFilters,
  FeedSortOptions,
  FeedResponse,
  DiscoveryFilters,
  UserRecommendation,
  SocialNetworkStats,
  ApiResponse
} from '@/types/social-network'

export class SocialNetworkService {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // =====================================================
  // USER PROFILE MANAGEMENT
  // =====================================================

  async getUserProfile(userId: string): Promise<ExtendedUser | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      const { data: profileExtension, error: profileError } = await supabase
        .from('user_profile_extensions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      return {
        ...user,
        profile_extension: profileExtension || undefined
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  async updateUserProfile(userId: string, updates: Partial<ExtendedUser>): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      // Update main user table
      const userUpdates: any = {}
      const profileUpdates: any = {}
      
      // Separate updates for different tables
      Object.keys(updates).forEach(key => {
        if (key === 'profile_extension') {
          Object.assign(profileUpdates, updates[key])
        } else if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          (userUpdates as any)[key] = (updates as any)[key]
        }
      })

      // Update user table
      if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update({ ...userUpdates, updated_at: new Date().toISOString() })
          .eq('id', userId)

        if (userError) throw userError
      }

      // Update or create profile extension
      if (Object.keys(profileUpdates).length > 0) {
        const { data: existingProfile } = await supabase
          .from('user_profile_extensions')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (existingProfile) {
          const { error: profileError } = await supabase
            .from('user_profile_extensions')
            .update({ ...profileUpdates, updated_at: new Date().toISOString() })
            .eq('id', existingProfile.id)

          if (profileError) throw profileError
        } else {
          const { error: profileError } = await supabase
            .from('user_profile_extensions')
            .insert({ user_id: userId, ...profileUpdates })

          if (profileError) throw profileError
        }
      }

      return true
    } catch (error) {
      console.error('Error updating user profile:', error)
      return false
    }
  }

  // =====================================================
  // SOCIAL POSTS MANAGEMENT
  // =====================================================

  async createPost(userId: string, postData: CreatePostRequest): Promise<SocialPost | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: post, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          ...postData,
          published_at: postData.scheduled_at || new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) throw error

      // Log activity
      await this.logUserActivity(userId, 'post_created', { post_id: post.id })

      return post
    } catch (error) {
      console.error('Error creating post:', error)
      return null
    }
  }

  async getPost(postId: string, userId?: string): Promise<SocialPost | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: post, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', postId)
        .single()

      if (error) throw error

      // Check if user liked/bookmarked this post
      if (userId) {
        const [likeData, bookmarkData] = await Promise.all([
          supabase
            .from('social_post_likes')
            .select('reaction_type')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single(),
          supabase
            .from('social_bookmarks')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single()
        ])

        post.is_liked = !!likeData.data
        post.user_reaction = likeData.data?.reaction_type
        post.is_bookmarked = !!bookmarkData.data
      }

      return post
    } catch (error) {
      console.error('Error fetching post:', error)
      return null
    }
  }

  async updatePost(postId: string, userId: string, updates: UpdatePostRequest): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      // Verify ownership
      const { data: post } = await supabase
        .from('social_posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (!post || post.user_id !== userId) {
        throw new Error('Unauthorized to update this post')
      }

      const { error } = await supabase
        .from('social_posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', postId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error updating post:', error)
      return false
    }
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      // Verify ownership
      const { data: post } = await supabase
        .from('social_posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (!post || post.user_id !== userId) {
        throw new Error('Unauthorized to delete this post')
      }

      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error deleting post:', error)
      return false
    }
  }

  /**
   * Get posts by a specific user
   */
  async getUserPosts(userId: string, limit: number = 20, offset: number = 0): Promise<SocialPost[]> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: posts, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          user:users(*)
        `)
        .eq('user_id', userId)
        .eq('visibility', 'public')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return posts || []
    } catch (error) {
      console.error('Error fetching user posts:', error)
      return []
    }
  }

  // =====================================================
  // SOCIAL FEED SYSTEM
  // =====================================================

  async getSocialFeed(
    userId: string,
    filters: FeedFilters = {},
    sortOptions: FeedSortOptions = { sort_by: 'latest', sort_order: 'desc' },
    page: number = 1,
    limit: number = 20
  ): Promise<FeedResponse> {
    try {
      const supabase = await this.getSupabase()
      
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          user:users(*)
        `)
        .eq('visibility', 'public')
        .eq('is_approved', true)

      // Apply filters
      if (filters.content_types?.length) {
        query = query.in('content_type', filters.content_types)
      }
      if (filters.jewelry_categories?.length) {
        query = query.in('jewelry_category', filters.jewelry_categories)
      }
      if (filters.tags?.length) {
        query = query.overlaps('tags', filters.tags)
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters.following_only) {
        // Get posts from users the current user follows
        const { data: following } = await supabase
          .from('user_connections')
          .select('following_id')
          .eq('follower_id', userId)
          .eq('connection_status', 'accepted')
        
        if (following?.length) {
          const followingIds = following.map((f: any) => f.following_id)
          query = query.in('user_id', followingIds)
        } else {
          // Return empty result if not following anyone
          return { posts: [], has_more: false, total_count: 0 }
        }
      }

      // Apply sorting
      switch (sortOptions.sort_by) {
        case 'latest':
          query = query.order('created_at', { ascending: sortOptions.sort_order === 'asc' })
          break
        case 'trending':
          query = query.order('like_count', { ascending: sortOptions.sort_order === 'asc' })
          break
        case 'most_liked':
          query = query.order('like_count', { ascending: false })
          break
        case 'most_commented':
          query = query.order('comment_count', { ascending: false })
          break
        case 'most_shared':
          query = query.order('share_count', { ascending: false })
          break
      }

      // Apply pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data: posts, error, count } = await query

      if (error) throw error

      // Enhance posts with user interaction data
      const enhancedPosts = await Promise.all(
        posts.map(async (post: any) => {
          const [likeData, bookmarkData] = await Promise.all([
            supabase
              .from('social_post_likes')
              .select('reaction_type')
              .eq('post_id', post.id)
              .eq('user_id', userId)
              .single(),
            supabase
              .from('social_bookmarks')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', userId)
              .single()
          ])

          return {
            ...post,
            is_liked: !!likeData.data,
            user_reaction: likeData.data?.reaction_type,
            is_bookmarked: !!bookmarkData.data
          }
        })
      )

      return {
        posts: enhancedPosts,
        has_more: posts.length === limit,
        total_count: count || 0
      }
    } catch (error) {
      console.error('Error fetching social feed:', error)
      return { posts: [], has_more: false, total_count: 0 }
    }
  }

  // =====================================================
  // SOCIAL INTERACTIONS
  // =====================================================

  async likePost(postId: string, userId: string, reactionType: string = 'like'): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('social_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        // Update existing like
        const { error } = await supabase
          .from('social_post_likes')
          .update({ reaction_type: reactionType })
          .eq('id', existingLike.id)

        if (error) throw error
      } else {
        // Create new like
        const { error } = await supabase
          .from('social_post_likes')
          .insert({
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType
          })

        if (error) throw error
      }

      // Log activity
      await this.logUserActivity(userId, 'like_given', { post_id: postId, reaction_type: reactionType })

      return true
    } catch (error) {
      console.error('Error liking post:', error)
      return false
    }
  }

  async unlikePost(postId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      const { error } = await supabase
        .from('social_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error unliking post:', error)
      return false
    }
  }

  async addComment(userId: string, commentData: CreateCommentRequest): Promise<SocialComment | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: comment, error } = await supabase
        .from('social_comments')
        .insert({
          user_id: userId,
          ...commentData
        })
        .select(`
          *,
          user:users(*)
        `)
        .single()

      if (error) throw error

      // Log activity
      await this.logUserActivity(userId, 'comment_added', { post_id: commentData.post_id, comment_id: comment.id })

      return comment
    } catch (error) {
      console.error('Error adding comment:', error)
      return null
    }
  }

  async bookmarkPost(userId: string, postId: string, folder: string = 'general', notes?: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      const { error } = await supabase
        .from('social_bookmarks')
        .upsert({
          user_id: userId,
          post_id: postId,
          folder,
          notes
        })

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error bookmarking post:', error)
      return false
    }
  }

  async removeBookmark(userId: string, postId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      const { error } = await supabase
        .from('social_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error removing bookmark:', error)
      return false
    }
  }

  // =====================================================
  // USER CONNECTIONS
  // =====================================================

  async sendConnectionRequest(userId: string, requestData: CreateConnectionRequest): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from('connection_requests')
        .select('id')
        .eq('requester_id', userId)
        .eq('recipient_id', requestData.recipient_id)
        .single()

      if (existingRequest) {
        throw new Error('Connection request already sent')
      }

      const { error } = await supabase
        .from('connection_requests')
        .insert({
          requester_id: userId,
          ...requestData
        })

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error sending connection request:', error)
      return false
    }
  }

  async acceptConnectionRequest(requestId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      // Get the request
      const { data: request, error: fetchError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('id', requestId)
        .eq('recipient_id', userId)
        .single()

      if (fetchError || !request) {
        throw new Error('Connection request not found')
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Create connection
      const { error: connectionError } = await supabase
        .from('user_connections')
        .insert({
          follower_id: request.requester_id,
          following_id: request.recipient_id,
          connection_status: 'accepted',
          connection_type: request.request_type || 'professional'
        })

      if (connectionError) throw connectionError

      // Log activity
      await this.logUserActivity(userId, 'connection_made', { 
        connection_id: requestId, 
        connected_user_id: request.requester_id 
      })

      return true
    } catch (error) {
      console.error('Error accepting connection request:', error)
      return false
    }
  }

  async getConnections(userId: string): Promise<UserConnection[]> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: connections, error } = await supabase
        .from('user_connections')
        .select(`
          *,
          follower:users!user_connections_follower_id_fkey(*),
          following:users!user_connections_following_id_fkey(*)
        `)
        .or(`follower_id.eq.${userId},following_id.eq.${userId}`)
        .eq('connection_status', 'accepted')

      if (error) throw error

      return connections || []
    } catch (error) {
      console.error('Error fetching connections:', error)
      return []
    }
  }

  // =====================================================
  // DISCOVERY AND RECOMMENDATIONS
  // =====================================================

  async getRecommendedUsers(userId: string, limit: number = 10): Promise<UserRecommendation[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get current user's interests and specialties
      const { data: currentUser } = await supabase
        .from('users')
        .select('specialties')
        .eq('id', userId)
        .single()

      const { data: profileExtension } = await supabase
        .from('user_profile_extensions')
        .select('interests')
        .eq('user_id', userId)
        .single()

      const userInterests = [
        ...(currentUser?.specialties || []),
        ...(profileExtension?.interests || [])
      ]

      // Find users with similar interests
      const { data: recommendations, error } = await supabase
        .from('users')
        .select(`
          *,
          profile_extension:user_profile_extensions(*)
        `)
        .neq('id', userId)
        .eq('is_public_profile', true)
        .overlaps('specialties', userInterests)
        .limit(limit)

      if (error) throw error

      // Calculate compatibility scores
      const scoredRecommendations = recommendations.map((user: any) => {
        const mutualInterests = user.specialties.filter((s: any) => userInterests.includes(s))
        const compatibilityScore = Math.min(100, (mutualInterests.length / Math.max(userInterests.length, 1)) * 100)
        
        return {
          user,
          compatibility_score: Math.round(compatibilityScore),
          mutual_interests: mutualInterests,
          mutual_connections: 0, // TODO: Implement mutual connections calculation
          recent_activity: 'recently active' // TODO: Implement recent activity calculation
        }
      })

      return scoredRecommendations.sort((a: any, b: any) => b.compatibility_score - a.compatibility_score)
    } catch (error) {
      console.error('Error getting user recommendations:', error)
      return []
    }
  }

  // =====================================================
  // ANALYTICS AND STATISTICS
  // =====================================================

  async getSocialNetworkStats(): Promise<SocialNetworkStats> {
    try {
      const supabase = await this.getSupabase()
      
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: totalConnections },
        { count: activeUsersToday },
        { count: postsToday },
        { count: connectionsToday }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('social_posts').select('*', { count: 'exact', head: true }),
        supabase.from('user_connections').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('social_posts').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_connections').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      // Get top categories
      const { data: topCategories } = await supabase
        .from('social_posts')
        .select('jewelry_category')
        .not('jewelry_category', 'is', null)

      const categoryCounts = topCategories?.reduce((acc: any, post: any) => {
        if (post.jewelry_category) {
          acc[post.jewelry_category] = (acc[post.jewelry_category] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}

      const topCategoriesArray = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, post_count: count as number }))
        .sort((a: any, b: any) => (b.post_count as number) - (a.post_count as number))
        .slice(0, 5)

      // Get trending tags
      const { data: allPosts } = await supabase
        .from('social_posts')
        .select('tags')

      const tagCounts = allPosts?.reduce((acc: any, post: any) => {
        post.tags?.forEach((tag: any) => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>) || {}

      const trendingTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, usage_count: count as number }))
        .sort((a: any, b: any) => (b.usage_count as number) - (a.usage_count as number))
        .slice(0, 10)

      return {
        total_users: totalUsers || 0,
        total_posts: totalPosts || 0,
        total_connections: totalConnections || 0,
        active_users_today: activeUsersToday || 0,
        posts_today: postsToday || 0,
        connections_today: connectionsToday || 0,
        top_categories: topCategoriesArray,
        trending_tags: trendingTags
      }
    } catch (error) {
      console.error('Error getting social network stats:', error)
      return {
        total_users: 0,
        total_posts: 0,
        total_connections: 0,
        active_users_today: 0,
        posts_today: 0,
        connections_today: 0,
        top_categories: [],
        trending_tags: []
      }
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  private async logUserActivity(
    userId: string, 
    activityType: string, 
    activityData?: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData,
          visibility: 'public'
        })
    } catch (error) {
      console.error('Error logging user activity:', error)
    }
  }
}

// Export singleton instance
export const socialNetworkService = new SocialNetworkService() 