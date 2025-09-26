'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  MapPin,
  Tag,
  Gem,
  DollarSign,
  Eye,
  Clock
} from 'lucide-react'
import { SocialPost, ReactionType } from '@/types/social-network'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface SocialPostCardProps {
  post: SocialPost
  onLike: (postId: string, reactionType: ReactionType) => void
  onComment: (postId: string) => void
  onShare: (postId: string) => void
  onBookmark: (postId: string) => void
  className?: string
}

const REACTION_ICONS: Record<ReactionType, React.ReactNode> = {
  like: <Heart className="h-4 w-4" />,
  love: <Heart className="h-4 w-4 fill-red-500 text-red-500" />,
  wow: <span className="text-2xl">😮</span>,
  haha: <span className="text-2xl">😂</span>,
  sad: <span className="text-2xl">😢</span>,
  angry: <span className="text-2xl">😠</span>,
  fire: <span className="text-2xl">🔥</span>,
  gem: <Gem className="h-4 w-4 text-blue-500" />
}

const REACTION_COLORS: Record<ReactionType, string> = {
  like: 'text-blue-600',
  love: 'text-red-600',
  wow: 'text-yellow-600',
  haha: 'text-yellow-600',
  sad: 'text-blue-600',
  angry: 'text-red-600',
  fire: 'text-orange-600',
  gem: 'text-blue-600'
}

export function SocialPostCard({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onBookmark,
  className = '' 
}: SocialPostCardProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleLike = () => {
    onLike(post.id, post.user_reaction || 'like')
  }

  const handleReaction = (reactionType: ReactionType) => {
    onLike(post.id, reactionType)
    setShowReactions(false)
  }

  const formatContent = (content: string) => {
    // Convert hashtags to clickable elements
    return content.replace(/#(\w+)/g, '<span class="text-blue-600 hover:underline cursor-pointer">#$1</span>')
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'showcase':
        return <Gem className="h-4 w-4 text-blue-500" />
      case 'achievement':
        return <span className="text-2xl">🏆</span>
      case 'video':
        return <span className="text-2xl">🎥</span>
      case 'image':
        return <span className="text-2xl">🖼️</span>
      case 'poll':
        return <span className="text-2xl">📊</span>
      default:
        return null
    }
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user?.avatar_url} alt={post.user?.full_name} />
            <AvatarFallback>
              {post.user?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* User Info and Post Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {post.user?.full_name}
              </span>
              {post.user?.role && (
                <Badge variant="secondary" className="text-xs">
                  {post.user.role}
                </Badge>
              )}
              {post.is_featured && (
                <Badge variant="default" className="text-xs bg-yellow-500">
                  Featured
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              
              {post.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{post.location}</span>
                  </div>
                </>
              )}

              {post.visibility !== 'public' && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {post.visibility === 'connections' ? 'Connections Only' : 'Private'}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Post Type Icon */}
          {getContentIcon(post.content_type) && (
            <div className="flex-shrink-0">
              {getContentIcon(post.content_type)}
            </div>
          )}

          {/* More Options */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        <div className="mb-4">
          <p 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
        </div>

        {/* Media Content */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-4">
            {post.media_urls.length === 1 ? (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={post.media_urls[0]} 
                  alt="Post media" 
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.media_urls.slice(0, 4).map((url, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Post media ${index + 1}`} 
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
                {post.media_urls.length > 4 && (
                  <div className="rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    +{post.media_urls.length - 4} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Post Metadata */}
        <div className="mb-4 space-y-2">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-secondary/80"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Jewelry Category and Price */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {post.jewelry_category && (
              <div className="flex items-center gap-1">
                <Gem className="h-3 w-3" />
                <span>{post.jewelry_category}</span>
              </div>
            )}
            
            {post.price_range && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{post.price_range}</span>
              </div>
            )}

            {post.industry_context && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>{post.industry_context}</span>
              </div>
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            {post.like_count > 0 && (
              <span>{post.like_count} like{post.like_count !== 1 ? 's' : ''}</span>
            )}
            {post.comment_count > 0 && (
              <span>{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</span>
            )}
            {post.share_count > 0 && (
              <span>{post.share_count} share{post.share_count !== 1 ? 's' : ''}</span>
            )}
            {post.view_count > 0 && (
              <span>{post.view_count} view{post.view_count !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-1">
            {/* Like Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
                className={cn(
                  "h-8 px-3",
                  post.is_liked && REACTION_COLORS[post.user_reaction || 'like']
                )}
              >
                {post.user_reaction ? REACTION_ICONS[post.user_reaction] : <Heart className="h-4 w-4" />}
                <span className="ml-2 text-xs">Like</span>
              </Button>

              {/* Reaction Picker */}
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                  {Object.entries(REACTION_ICONS).map(([reaction, icon]) => (
                    <Button
                      key={reaction}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:scale-110 transition-transform"
                      onClick={() => handleReaction(reaction as ReactionType)}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(post.id)}
              className="h-8 px-3"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="ml-2 text-xs">Comment</span>
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(post.id)}
              className="h-8 px-3"
            >
              <Share2 className="h-4 w-4" />
              <span className="ml-2 text-xs">Share</span>
            </Button>
          </div>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(post.id)}
            className={cn(
              "h-8 px-3",
              post.is_bookmarked && "text-blue-600"
            )}
          >
            <Bookmark className={cn(
              "h-4 w-4",
              post.is_bookmarked && "fill-current"
            )} />
            <span className="ml-2 text-xs">Save</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 