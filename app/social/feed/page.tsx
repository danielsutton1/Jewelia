'use client'

import React, { useState, useEffect } from 'react'
import { EnhancedSocialPost } from '@/components/social/EnhancedSocialPost'
import { UserProfileCard } from '@/components/social/UserProfileCard'
import { SocialPost } from '@/types/social-network'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock,
  Users,
  Hash
} from 'lucide-react'

export default function SocialFeedPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'trending' | 'recent'>('all')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      
      // Use the public API endpoint that doesn't require authentication
      const response = await fetch('/api/social/posts/public')
      
      if (response.status === 401) {
        setError('Please log in to view posts. You can test the API directly in the console.')
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.data.posts || [])
      } else {
        setError(data.error || 'Failed to fetch posts')
      }
    } catch (err) {
      setError('Error fetching posts')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = (postId: string) => {
    console.log('Like post:', postId)
    // TODO: Implement like functionality
  }

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId)
    // TODO: Implement comment functionality
  }

  const handleShare = (postId: string) => {
    console.log('Share post:', postId)
    // TODO: Implement share functionality
  }

  const handleBookmark = (postId: string) => {
    console.log('Bookmark post:', postId)
    // TODO: Implement bookmark functionality
  }

  const filteredPosts = posts.filter(post => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        post.content.toLowerCase().includes(searchLower) ||
        post.user?.full_name?.toLowerCase().includes(searchLower) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.industry_context?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (filterType) {
      case 'trending':
        return (b.like_count + b.comment_count + b.share_count) - (a.like_count + a.comment_count + a.share_count)
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPosts} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
              <p className="text-gray-600">Connect with jewelry industry professionals</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType('all')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  All Posts
                </Button>
                <Button
                  variant={filterType === 'trending' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType('trending')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </Button>
                <Button
                  variant={filterType === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType('recent')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Recent
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Feed Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Posts</span>
                  <Badge variant="secondary">{posts.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <Badge variant="secondary">
                    {new Set(posts.map(p => p.user_id)).size}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tags</span>
                  <Badge variant="secondary">
                    {new Set(posts.flatMap(p => p.tags || [])).size}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {sortedPosts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No posts found' : 'No posts yet'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? `No posts match "${searchTerm}"`
                      : 'Be the first to share something with the community!'
                    }
                  </p>
                  {!searchTerm && (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {sortedPosts.map((post) => (
                  <EnhancedSocialPost
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onBookmark={handleBookmark}
                    showUserProfile={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
