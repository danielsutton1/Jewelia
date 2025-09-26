import { createSupabaseServerClient } from '@/lib/supabase/server'
import { 
  SocialPost, 
  SocialComment, 
  SocialPostLike, 
  SocialCommentLike,
  SocialPostShare,
  SocialBookmark,
  CreatePostRequest,
  CreateCommentRequest,
  CreateLikeRequest,
  CreateShareRequest,
  FeedFilters,
  FeedResponse,
  ContentRecommendation
} from '@/types/social-content'
import { SocialProfile } from '@/types/social-profile'
import { z } from 'zod'

// Validation schemas
const CreatePostSchema = z.object({
  content: z.string().min(1).max(10000),
  content_type: z.enum(['text', 'image', 'video', 'link', 'poll']).default('text'),
  media_urls: z.array(z.string().url()).optional(),
  link_preview: z.object({
    url: z.string().url(),
    title: z.string(),
    description: z.string(),
    image_url: z.string().url().optional(),
    site_name: z.string().optional(),
    domain: z.string().optional(),
  }).optional(),
  is_public: z.boolean().default(true),
  allow_comments: z.boolean().default(true),
  allow_shares: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  mood: z.string().optional(),
  industry_context: z.string().optional(),
})

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  media_urls: z.array(z.string().url()).optional(),
  parent_comment_id: z.string().uuid().optional(),
})

const CreateLikeSchema = z.object({
  reaction_type: z.enum(['like', 'love', 'wow', 'haha', 'sad', 'angry']).default('like'),
})

const CreateShareSchema = z.object({
  share_message: z.string().max(500).optional(),
  share_platform: z.enum(['internal', 'external']).default('internal'),
})

export class SocialContentService {
  private supabase = createSupabaseServerClient() as any

  /**
   * Create a new social post
   */
  async createPost(userId: string, postData: CreatePostRequest): Promise<SocialPost> {
    try {
      const validatedData = CreatePostSchema.parse(postData)

      const { data: post, error } = await this.supabase
        .from('social_posts')
        .insert([{
          user_id: userId,
          ...validatedData,
          media_urls: validatedData.media_urls || [],
          tags: validatedData.tags || [],
        }])
        .select(`
          *,
          user:social_profiles!social_posts_user_id_fkey(*)
        `)
        .single()

      if (error) throw error

      // Update user's post count
      await this.updateUserPostCount(userId, 1)

      return this.transformPostData(post)
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  /**
   * Get a post by ID with full details
   */
  async getPost(postId: string, userId?: string): Promise<SocialPost | null> {
    try {
      const { data: post, error } = await this.supabase
        .from('social_posts')
        .select(`
          *,
          user:social_profiles!social_posts_user_id_fkey(*),
          comments:social_comments(*),
          likes:social_post_likes(*),
          shares:social_post_shares(*)
        `)
        .eq('id', postId)
        .eq('is_public', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      // Check if user has liked/bookmarked this post
      if (userId) {
        const [isLiked, isBookmarked] = await Promise.all([
          this.checkIfUserLikedPost(postId, userId),
          this.checkIfUserBookmarkedPost(postId, userId)
        ])
        
        post.is_liked_by_user = isLiked
        post.is_bookmarked_by_user = isBookmarked
      }

      return this.transformPostData(post)
    } catch (error) {
      console.error('Error getting post:', error)
      throw error
    }
  }

  /**
   * Get user's feed with personalized content
   */
  async getUserFeed(userId: string, filters?: FeedFilters, cursor?: string): Promise<FeedResponse> {
    try {
      let query = this.supabase
        .from('social_posts')
        .select(`
          *,
          user:social_profiles!social_posts_user_id_fkey(*),
          comments:social_comments(count),
          likes:social_post_likes(count),
          shares:social_post_shares(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type)
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters?.industry_context) {
        query = query.eq('industry_context', filters.industry_context)
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      if (filters?.time_range) {
        const now = new Date()
        let startDate: Date
        
        switch (filters.time_range) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            break
          case 'year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            break
          default:
            startDate = new Date(0)
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }

      if (filters?.engagement_min) {
        query = query.gte('like_count', filters.engagement_min)
      }

      // Pagination
      if (cursor) {
        query = query.lt('created_at', cursor)
      }

      const limit = 20
      query = query.limit(limit + 1) // Get one extra to check if there are more

      const { data: posts, error } = await query

      if (error) throw error

      const hasMore = posts.length > limit
      const postsToReturn = hasMore ? posts.slice(0, limit) : posts
      const nextCursor = hasMore ? posts[limit - 1].created_at : undefined

      // Transform posts and check user engagement
      const transformedPosts = await Promise.all(
        postsToReturn.map(async (post: any) => {
          const [isLiked, isBookmarked] = await Promise.all([
            this.checkIfUserLikedPost(post.id, userId),
            this.checkIfUserBookmarkedPost(post.id, userId)
          ])
          
          return {
            ...this.transformPostData(post),
            is_liked_by_user: isLiked,
            is_bookmarked_by_user: isBookmarked,
          }
        })
      )

      return {
        posts: transformedPosts,
        has_more: hasMore,
        next_cursor: nextCursor,
        total_count: postsToReturn.length,
      }
    } catch (error) {
      console.error('Error getting user feed:', error)
      throw error
    }
  }

  /**
   * Create a comment on a post
   */
  async createComment(userId: string, postId: string, commentData: CreateCommentRequest): Promise<SocialComment> {
    try {
      const validatedData = CreateCommentSchema.parse(commentData)

      // Check if post exists and allows comments
      const { data: post, error: postError } = await this.supabase
        .from('social_posts')
        .select('id, allow_comments')
        .eq('id', postId)
        .single()

      if (postError || !post) {
        throw new Error('Post not found')
      }

      if (!post.allow_comments) {
        throw new Error('Comments are not allowed on this post')
      }

      const { data: comment, error } = await this.supabase
        .from('social_comments')
        .insert([{
          post_id: postId,
          user_id: userId,
          ...validatedData,
          media_urls: validatedData.media_urls || [],
        }])
        .select(`
          *,
          user:social_profiles!social_comments_user_id_fkey(*)
        `)
        .single()

      if (error) throw error

      return this.transformCommentData(comment)
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }

  /**
   * Like or unlike a post
   */
  async togglePostLike(userId: string, postId: string, likeData?: CreateLikeRequest): Promise<boolean> {
    try {
      const validatedData = CreateLikeSchema.parse(likeData || {})

      // Check if user already liked the post
      const { data: existingLike, error: checkError } = await this.supabase
        .from('social_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await this.supabase
          .from('social_post_likes')
          .delete()
          .eq('id', existingLike.id)

        if (deleteError) throw deleteError
        return false // Post is now unliked
      } else {
        // Like the post
        const { error: insertError } = await this.supabase
          .from('social_post_likes')
          .insert([{
            post_id: postId,
            user_id: userId,
            reaction_type: validatedData.reaction_type,
          }])

        if (insertError) throw insertError
        return true // Post is now liked
      }
    } catch (error) {
      console.error('Error toggling post like:', error)
      throw error
    }
  }

  /**
   * Share a post
   */
  async sharePost(userId: string, postId: string, shareData?: CreateShareRequest): Promise<SocialPostShare> {
    try {
      const validatedData = CreateShareSchema.parse(shareData || {})

      // Check if post exists and allows shares
      const { data: post, error: postError } = await this.supabase
        .from('social_posts')
        .select('id, allow_shares')
        .eq('id', postId)
        .single()

      if (postError || !post) {
        throw new Error('Post not found')
      }

      if (!post.allow_shares) {
        throw new Error('Shares are not allowed on this post')
      }

      const { data: share, error } = await this.supabase
        .from('social_post_shares')
        .insert([{
          original_post_id: postId,
          shared_by_user_id: userId,
          ...validatedData,
        }])
        .select(`
          *,
          original_post:social_posts!social_post_shares_original_post_id_fkey(*),
          shared_by_user:social_profiles!social_post_shares_shared_by_user_id_fkey(*)
        `)
        .single()

      if (error) throw error

      return this.transformShareData(share)
    } catch (error) {
      console.error('Error sharing post:', error)
      throw error
    }
  }

  /**
   * Bookmark or unbookmark a post
   */
  async toggleBookmark(userId: string, postId: string): Promise<boolean> {
    try {
      // Check if user already bookmarked the post
      const { data: existingBookmark, error: checkError } = await this.supabase
        .from('social_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingBookmark) {
        // Remove bookmark
        const { error: deleteError } = await this.supabase
          .from('social_bookmarks')
          .delete()
          .eq('id', existingBookmark.id)

        if (deleteError) throw deleteError
        return false // Post is now unbookmarked
      } else {
        // Add bookmark
        const { error: insertError } = await this.supabase
          .from('social_bookmarks')
          .insert([{
            post_id: postId,
            user_id: userId,
          }])

        if (insertError) throw insertError
        return true // Post is now bookmarked
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      throw error
    }
  }

  /**
   * Get user's bookmarked posts
   */
  async getUserBookmarks(userId: string, limit = 20, offset = 0): Promise<SocialPost[]> {
    try {
      const { data: bookmarks, error } = await this.supabase
        .from('social_bookmarks')
        .select(`
          *,
          post:social_posts!social_bookmarks_post_id_fkey(
            *,
            user:social_profiles!social_posts_user_id_fkey(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return bookmarks.map((bookmark: any) => ({
        ...this.transformPostData(bookmark.post),
        is_bookmarked_by_user: true,
      }))
    } catch (error) {
      console.error('Error getting user bookmarks:', error)
      throw error
    }
  }

  /**
   * Get content recommendations for a user
   */
  async getContentRecommendations(userId: string, limit = 10): Promise<ContentRecommendation[]> {
    try {
      // Get user's interests from their profile and activity
      const { data: userProfile } = await this.supabase
        .from('social_profiles')
        .select('industry, tags, location')
        .eq('user_id', userId)
        .single()

      // Get posts that match user's interests
      let query = this.supabase
        .from('social_posts')
        .select(`
          *,
          user:social_profiles!social_posts_user_id_fkey(*)
        `)
        .eq('is_public', true)
        .neq('user_id', userId) // Don't recommend user's own posts

      // Apply interest-based filters
      if (userProfile?.industry) {
        query = query.eq('industry_context', userProfile.industry)
      }

      if (userProfile?.tags && userProfile.tags.length > 0) {
        query = query.overlaps('tags', userProfile.tags)
      }

      if (userProfile?.location) {
        query = query.ilike('location', `%${userProfile.location}%`)
      }

      // Order by engagement and recency
      query = query.order('like_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      const { data: posts, error } = await query

      if (error) throw error

      // Calculate recommendation scores
      const recommendations: ContentRecommendation[] = posts.map((post: any, index: number) => {
        const recency = Math.max(0, 1 - (Date.now() - new Date(post.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
        const engagement = Math.min(1, post.like_count / 100)
        const relevance = userProfile?.industry === post.industry_context ? 1 : 0.5
        
        const score = (recency * 0.3) + (engagement * 0.4) + (relevance * 0.3)

        return {
          post: this.transformPostData(post),
          score,
          reason: this.getRecommendationReason(post, userProfile),
          factors: {
            user_interest: relevance,
            engagement_rate: engagement,
            recency,
            relevance,
          }
        }
      })

      // Sort by score
      return recommendations.sort((a, b) => b.score - a.score)
    } catch (error) {
      console.error('Error getting content recommendations:', error)
      throw error
    }
  }

  /**
   * Record a post view
   */
  async recordPostView(postId: string, userId?: string, viewSource: string = 'feed'): Promise<void> {
    try {
      await this.supabase
        .from('social_post_views')
        .insert([{
          post_id: postId,
          viewer_user_id: userId,
          view_source: viewSource,
        }])
    } catch (error) {
      console.error('Error recording post view:', error)
      // Don't throw - view tracking is not critical
    }
  }

  // Helper methods
  private async checkIfUserLikedPost(postId: string, userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('social_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      return !!data
    } catch {
      return false
    }
  }

  private async checkIfUserBookmarkedPost(postId: string, userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('social_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      return !!data
    } catch {
      return false
    }
  }

  private async updateUserPostCount(userId: string, increment: number): Promise<void> {
    try {
      await this.supabase
        .from('social_profiles')
        .update({ post_count: this.supabase.raw(`post_count + ${increment}`) })
        .eq('user_id', userId)
    } catch (error) {
      console.error('Error updating user post count:', error)
      // Don't throw - this is not critical
    }
  }

  private getRecommendationReason(post: any, userProfile: any): string {
    if (userProfile?.industry === post.industry_context) {
      return 'Matches your industry expertise'
    }
    if (userProfile?.location && post.location?.includes(userProfile.location)) {
      return 'Local content from your area'
    }
    if (post.like_count > 50) {
      return 'Highly engaging content'
    }
    return 'Recommended based on your interests'
  }

  // Data transformation methods
  private transformPostData(data: any): SocialPost {
    return {
      id: data.id,
      user_id: data.user_id,
      content: data.content,
      content_type: data.content_type,
      media_urls: data.media_urls || [],
      link_preview: data.link_preview,
      like_count: data.like_count || 0,
      comment_count: data.comment_count || 0,
      share_count: data.share_count || 0,
      view_count: data.view_count || 0,
      is_public: data.is_public,
      allow_comments: data.allow_comments,
      allow_shares: data.allow_shares,
      is_pinned: data.is_pinned,
      tags: data.tags || [],
      location: data.location,
      mood: data.mood,
      industry_context: data.industry_context,
      created_at: data.created_at,
      updated_at: data.updated_at,
      published_at: data.published_at,
      user: data.user ? this.transformProfileData(data.user) : undefined,
      comments: data.comments ? data.comments.map(this.transformCommentData) : undefined,
      likes: data.likes ? data.likes.map(this.transformLikeData) : undefined,
      shares: data.shares ? data.shares.map(this.transformShareData) : undefined,
    }
  }

  private transformCommentData(data: any): SocialComment {
    return {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      parent_comment_id: data.parent_comment_id,
      content: data.content,
      media_urls: data.media_urls || [],
      like_count: data.like_count || 0,
      reply_count: data.reply_count || 0,
      is_edited: data.is_edited,
      is_hidden: data.is_hidden,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: data.user ? this.transformProfileData(data.user) : undefined,
    }
  }

  private transformLikeData(data: any): SocialPostLike {
    return {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      reaction_type: data.reaction_type,
      created_at: data.created_at,
    }
  }

  private transformShareData(data: any): SocialPostShare {
    return {
      id: data.id,
      original_post_id: data.original_post_id,
      shared_by_user_id: data.shared_by_user_id,
      share_message: data.share_message,
      share_platform: data.share_platform,
      created_at: data.created_at,
      original_post: data.original_post ? this.transformPostData(data.original_post) : undefined,
      shared_by_user: data.shared_by_user ? this.transformProfileData(data.shared_by_user) : undefined,
    }
  }

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
} 