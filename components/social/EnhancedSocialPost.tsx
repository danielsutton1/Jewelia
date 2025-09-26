import React from 'react'
import { SocialPost } from '@/types/social-network'
import { UserProfileCard } from './UserProfileCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  MapPin,
  Tag,
  Eye,
  Calendar
} from 'lucide-react'

interface EnhancedSocialPostProps {
  post: SocialPost
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onBookmark?: (postId: string) => void
  showUserProfile?: boolean
  className?: string
}

export function EnhancedSocialPost({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onBookmark,
  showUserProfile = true,
  className = '' 
}: EnhancedSocialPostProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={`border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-blue-100">
              <AvatarImage src={post.user?.avatar_url || ''} alt={post.user?.full_name || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(post.user?.full_name || 'U')}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {post.user?.full_name || 'Unknown User'}
                </h3>
                {(post.user as any)?.is_verified && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700">
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                {(post.user as any)?.job_title && (
                  <span className="truncate">{(post.user as any).job_title}</span>
                )}
                {(post.user as any)?.company && (
                  <span className="truncate">at {(post.user as any).company}</span>
                )}
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 leading-relaxed mb-3">
            {post.content}
          </p>
          
          {/* Media URLs */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {post.media_urls.map((url, index) => (
                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Metadata */}
        <div className="space-y-2 mb-4">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tag className="h-3 w-3 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Location */}
          {post.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-2 text-gray-400" />
              {post.location}
            </div>
          )}
          
          {/* Industry Context */}
          {post.industry_context && (
            <div className="flex items-center text-sm text-gray-600">
              <Eye className="h-3 w-3 mr-2 text-gray-400" />
              {post.industry_context}
            </div>
          )}
          
          {/* Jewelry Category */}
          {post.jewelry_category && (
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-purple-50 text-purple-700">
              {post.jewelry_category}
            </Badge>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <span>{post.view_count} views</span>
            <span>{post.like_count} likes</span>
            <span>{post.comment_count} comments</span>
            <span>{post.share_count} shares</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(post.published_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-9 px-3 ${post.is_liked ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => onLike?.(post.id)}
            >
              <Heart className={`h-4 w-4 mr-2 ${post.is_liked ? 'fill-current' : ''}`} />
              Like
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3 text-gray-600 hover:text-gray-800"
              onClick={() => onComment?.(post.id)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Comment
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3 text-gray-600 hover:text-gray-800"
              onClick={() => onShare?.(post.id)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 ${post.is_bookmarked ? 'text-blue-500 hover:text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => onBookmark?.(post.id)}
          >
            <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* User Profile Card - Expandable */}
        {showUserProfile && post.user && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <UserProfileCard user={post.user} showFullProfile={false} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

