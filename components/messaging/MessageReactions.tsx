'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Smile, Heart, ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react'

interface MessageReaction {
  id: string
  emoji: string
  count: number
  users: string[]
  isReacted: boolean
}

interface MessageReactionsProps {
  messageId: string
  reactions: MessageReaction[]
  onReact: (messageId: string, emoji: string) => void
  onRemoveReaction: (messageId: string, emoji: string) => void
  onReply: (messageId: string) => void
}

const QUICK_REACTIONS = [
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '😊', label: 'Smile' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '🔥', label: 'Fire' }
]

export function MessageReactions({
  messageId,
  reactions,
  onReact,
  onRemoveReaction,
  onReply
}: MessageReactionsProps) {
  const [showReactions, setShowReactions] = useState(false)

  const handleReaction = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji)
    
    if (existingReaction?.isReacted) {
      onRemoveReaction(messageId, emoji)
    } else {
      onReact(messageId, emoji)
    }
    setShowReactions(false)
  }

  const getReactionDisplay = (reaction: MessageReaction) => {
    return (
      <Button
        key={reaction.emoji}
        variant={reaction.isReacted ? "default" : "outline"}
        size="sm"
        className={`h-6 px-2 text-xs ${reaction.isReacted ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}`}
        onClick={() => handleReaction(reaction.emoji)}
      >
        <span className="mr-1">{reaction.emoji}</span>
        {reaction.count}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      {/* Quick reaction buttons */}
      <div className="flex items-center gap-1">
        {reactions.map(getReactionDisplay)}
      </div>

      {/* Add reaction button */}
      <Popover open={showReactions} onOpenChange={setShowReactions}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-3 gap-1">
            {QUICK_REACTIONS.map(({ emoji, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={() => handleReaction(emoji)}
                title={label}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Reply button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-gray-100"
        onClick={() => onReply(messageId)}
        title="Reply"
      >
        <MessageCircle className="h-3 w-3" />
      </Button>

      {/* More options */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-gray-100"
        title="More options"
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>
    </div>
  )
} 