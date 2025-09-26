'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Link,
  Smile,
  MapPin,
  Hash,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { SocialPost, CreatePostRequest } from '@/types/social-content'
import { SocialProfile } from '@/types/social-profile'
import { toast } from 'sonner'

interface SocialFeedProps {
  userId?: string
  userProfile?: SocialProfile
}

export default function SocialFeed({ userId, userProfile }: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingPost, setCreatingPost] = useState(false)
  const [newPost, setNewPost] = useState<CreatePostRequest>({
    content: '',
    content_type: 'text',
    is_public: true,
    allow_comments: true,
    allow_shares: true,
  })
  const [activeTab, setActiveTab] = useState('feed')
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string>()

  // Fetch posts from API
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      const url = new URL('/api/social/posts', window.location.origin)
      
      if (reset) {
        setCursor(undefined)
        setPosts([])
      }
      
      if (cursor && !reset) {
        url.searchParams.set('cursor', cursor)
      }

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Failed to fetch posts')
      
      const data = await response.json()
      
      if (reset) {
        setPosts(data.posts)
      } else {
        setPosts(prev => [...prev, ...data.posts])
      }
      
      setHasMore(data.has_more)
      setCursor(data.next_cursor)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [cursor])

  // Create new post
  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast.error('Please enter some content')
      return
    }

    try {
      setCreatingPost(true)
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      })

      if (!response.ok) throw new Error('Failed to create post')

      const createdPost = await response.json()
      
      // Add new post to the beginning of the feed
      setPosts(prev => [createdPost, ...prev])
      
      // Reset form
      setNewPost({
        content: '',
        content_type: 'text',
        is_public: true,
        allow_comments: true,
        allow_shares: true,
      })
      
      toast.success('Post created successfully!')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setCreatingPost(false)
    }
  }

  // Toggle post like
  const handleToggleLike = async (postId: string) => {
    if (!userId) {
      toast.error('Please log in to like posts')
      return
    }

    try {
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: 'like' }),
      })

      if (!response.ok) throw new Error('Failed to toggle like')

      const { is_liked } = await response.json()
      
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked_by_user: is_liked,
              like_count: is_liked ? post.like_count + 1 : Math.max(0, post.like_count - 1)
            }
          : post
      ))
      
      toast.success(is_liked ? 'Post liked!' : 'Post unliked')
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to like post')
    }
  }

  // Toggle bookmark
  const handleToggleBookmark = async (postId: string) => {
    if (!userId) {
      toast.error('Please log in to bookmark posts')
      return
    }

    try {
      const response = await fetch(`/api/social/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to toggle bookmark')

      const { is_bookmarked } = await response.json()
      
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_bookmarked_by_user: is_bookmarked }
          : post
      ))
      
      toast.success(is_bookmarked ? 'Post bookmarked!' : 'Bookmark removed')
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to bookmark post')
    }
  }

  // Share post
  const handleShare = async (post: SocialPost) => {
    try {
      const response = await fetch(`/api/social/posts/${post.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_platform: 'internal' }),
      })

      if (!response.ok) throw new Error('Failed to share post')

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === post.id 
          ? { ...p, share_count: p.share_count + 1 }
          : p
      ))
      
      toast.success('Post shared successfully!')
    } catch (error) {
      console.error('Error sharing post:', error)
      toast.error('Failed to share post')
    }
  }

  // Load more posts
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPosts()
    }
  }

  // Initial load
  useEffect(() => {
    fetchPosts(true)
  }, [])

  // Post creation form
  const PostCreationForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback>
              {userProfile?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's happening in the jewelry world today?"
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[100px] resize-none border-0 focus-visible:ring-0"
              maxLength={10000}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewPost(prev => ({ ...prev, content_type: 'image' }))}
              className={newPost.content_type === 'image' ? 'bg-blue-50 text-blue-600' : ''}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewPost(prev => ({ ...prev, content_type: 'video' }))}
              className={newPost.content_type === 'video' ? 'bg-blue-50 text-blue-600' : ''}
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewPost(prev => ({ ...prev, content_type: 'link' }))}
              className={newPost.content_type === 'link' ? 'bg-blue-50 text-blue-600' : ''}
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewPost(prev => ({ ...prev, content_type: 'poll' }))}
              className={newPost.content_type === 'poll' ? 'bg-blue-50 text-blue-600' : ''}
            >
              <Hash className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleCreatePost}
            disabled={creatingPost || !newPost.content.trim()}
            className="px-6"
          >
            {creatingPost ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {creatingPost ? 'Posting...' : 'Post'}
          </Button>
        </div>
        
        {/* Post settings */}
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newPost.is_public}
              onChange={(e) => setNewPost(prev => ({ ...prev, is_public: e.target.checked }))}
              className="rounded"
            />
            <span>Public</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newPost.allow_comments}
              onChange={(e) => setNewPost(prev => ({ ...prev, allow_comments: e.target.checked }))}
              className="rounded"
            />
            <span>Allow comments</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newPost.allow_shares}
              onChange={(e) => setNewPost(prev => ({ ...prev, allow_shares: e.target.checked }))}
              className="rounded"
            />
            <span>Allow shares</span>
          </label>
        </div>
      </CardContent>
    </Card>
  )

  // Individual post component
  const PostCard = ({ post }: { post: SocialPost }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user?.avatar_url} />
            <AvatarFallback>
              {post.user?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">
                {post.user?.display_name || 'Unknown User'}
              </span>
              {post.user?.is_verified && (
                <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span>{post.location}</span>
                </>
              )}
              {post.industry_context && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">{post.industry_context}</Badge>
                </>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <p className="text-sm leading-relaxed">{post.content}</p>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Engagement stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span>{post.like_count} likes</span>
            <span>{post.comment_count} comments</span>
            <span>{post.share_count} shares</span>
            <span>{post.view_count} views</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleLike(post.id)}
            className={`flex items-center space-x-2 ${
              post.is_liked_by_user ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${post.is_liked_by_user ? 'fill-current' : ''}`} />
            <span>Like</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-500"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare(post)}
            className="flex items-center space-x-2 text-gray-500"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleBookmark(post.id)}
            className={`flex items-center space-x-2 ${
              post.is_bookmarked_by_user ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${post.is_bookmarked_by_user ? 'fill-current' : ''}`} />
            <span>Bookmark</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* Post creation form */}
          {userId && <PostCreationForm />}

          {/* Posts feed */}
          <div className="space-y-4">
            {loading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <p>No posts yet. Be the first to share something!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {/* Load more button */}
                {hasMore && (
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="text-center py-8 text-gray-500">
          <p>Trending content coming soon...</p>
        </TabsContent>

        <TabsContent value="following" className="text-center py-8 text-gray-500">
          <p>Following feed coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  )
} 