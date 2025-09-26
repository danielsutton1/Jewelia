'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Filter, 
  Search, 
  TrendingUp, 
  Clock,
  ThumbsUp,
  MessageSquare,
  Share,
  Star
} from 'lucide-react'
import { SocialPost, FeedFilters, FeedSortOptions } from '@/types/social-network'
import { SocialPostCard } from './SocialPostCard'
import { CreatePostDialog } from './CreatePostDialog'
import { useAuth } from '@/components/providers/auth-provider'

interface SocialFeedProps {
  initialFilters?: FeedFilters
  showCreatePost?: boolean
  className?: string
}

export function SocialFeed({ 
  initialFilters = {}, 
  showCreatePost = true,
  className = '' 
}: SocialFeedProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FeedFilters>(initialFilters)
  const [sortOptions, setSortOptions] = useState<FeedSortOptions>({
    sort_by: 'latest',
    sort_order: 'desc'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Fetch posts from API
  const fetchPosts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!user) return

    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sort_by: sortOptions.sort_by,
        sort_order: sortOptions.sort_order,
        ...(filters.content_types?.length && { content_types: filters.content_types.join(',') }),
        ...(filters.jewelry_categories?.length && { jewelry_categories: filters.jewelry_categories.join(',') }),
        ...(filters.tags?.length && { tags: filters.tags.join(',') }),
        ...(filters.location && { location: filters.location }),
        ...(filters.price_range && { price_range: filters.price_range }),
        ...(filters.following_only && { following_only: 'true' }),
        ...(filters.user_id && { user_id: filters.user_id })
      })

      const response = await fetch(`/api/social/feed?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        if (reset) {
          setPosts(data.data.posts)
        } else {
          setPosts(prev => [...prev, ...data.data.posts])
        }
        setHasMore(data.data.has_more)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [user, filters, sortOptions])

  // Load more posts
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, false)
    }
  }, [loading, hasMore, page, fetchPosts])

  // Refresh posts
  const refreshPosts = useCallback(() => {
    fetchPosts(1, true)
  }, [fetchPosts])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FeedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1)
  }, [])

  // Handle sort changes
  const handleSortChange = useCallback((newSortOptions: Partial<FeedSortOptions>) => {
    setSortOptions(prev => ({ ...prev, ...newSortOptions }))
    setPage(1)
  }, [])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      handleFilterChange({ tags: [query.trim()] })
    } else {
      handleFilterChange({ tags: undefined })
    }
  }, [handleFilterChange])

  // Handle tab changes
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    setPage(1)
    
    switch (tab) {
      case 'all':
        handleFilterChange({ following_only: false })
        break
      case 'following':
        handleFilterChange({ following_only: true })
        break
      case 'showcase':
        handleFilterChange({ content_types: ['showcase'] })
        break
      case 'achievements':
        handleFilterChange({ content_types: ['achievement'] })
        break
      default:
        break
    }
  }, [handleFilterChange])

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchPosts(1, true)
    }
  }, [user, fetchPosts])

  // Refresh when filters or sort options change
  useEffect(() => {
    if (user) {
      fetchPosts(1, true)
    }
  }, [filters, sortOptions, user, fetchPosts])

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to view the social feed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Social Feed</CardTitle>
              <p className="text-muted-foreground">Connect with the jewelry community</p>
            </div>
            {showCreatePost && (
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Post
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search posts, tags, or users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <Select
                value={sortOptions.sort_by}
                onValueChange={(value) => handleSortChange({ sort_by: value as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Latest
                    </div>
                  </SelectItem>
                  <SelectItem value="trending">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Trending
                    </div>
                  </SelectItem>
                  <SelectItem value="most_liked">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      Most Liked
                    </div>
                  </SelectItem>
                  <SelectItem value="most_commented">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Most Commented
                    </div>
                  </SelectItem>
                  <SelectItem value="most_shared">
                    <div className="flex items-center gap-2">
                      <Share className="h-4 w-4" />
                      Most Shared
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOptions.sort_order}
                onValueChange={(value) => handleSortChange({ sort_order: value as any })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">↓</SelectItem>
                  <SelectItem value="asc">↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <span>All Posts</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <span>Following</span>
              </TabsTrigger>
              <TabsTrigger value="showcase" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Showcase</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <span>Achievements</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="p-4">
              {/* Posts */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    onLike={(postId, reactionType) => {
                      // Handle like/unlike
                      setPosts(prev => 
                        prev.map(p => 
                          p.id === postId 
                            ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 }
                            : p
                        )
                      )
                    }}
                    onComment={(postId) => {
                      // Handle comment
                      setPosts(prev => 
                        prev.map(p => 
                          p.id === postId 
                            ? { ...p, comment_count: p.comment_count + 1 }
                            : p
                        )
                      )
                    }}
                    onShare={(postId) => {
                      // Handle share
                      setPosts(prev => 
                        prev.map(p => 
                          p.id === postId 
                            ? { ...p, share_count: p.share_count + 1 }
                            : p
                        )
                      )
                    }}
                    onBookmark={(postId) => {
                      // Handle bookmark
                      setPosts(prev => 
                        prev.map(p => 
                          p.id === postId 
                            ? { ...p, is_bookmarked: !p.is_bookmarked }
                            : p
                        )
                      )
                    }}
                  />
                ))}

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading posts...</p>
                  </div>
                )}

                {/* Load More */}
                {!loading && hasMore && (
                  <div className="text-center py-4">
                    <Button onClick={loadMore} variant="outline">
                      Load More Posts
                    </Button>
                  </div>
                )}

                {/* No Posts */}
                {!loading && posts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground text-lg">
                      {activeTab === 'following' 
                        ? 'No posts from people you follow yet. Start following some users!'
                        : 'No posts found. Be the first to share something!'
                      }
                    </div>
                    {showCreatePost && (
                      <Button 
                        onClick={() => setShowCreateDialog(true)} 
                        className="mt-4"
                      >
                        Create Your First Post
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      {showCreateDialog && (
        <CreatePostDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onPostCreated={(newPost) => {
            setPosts(prev => [newPost, ...prev])
            setShowCreateDialog(false)
          }}
        />
      )}
    </div>
  )
} 