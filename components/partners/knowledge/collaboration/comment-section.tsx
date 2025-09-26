"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { translations } from "../translations"

interface CommentSectionProps {
  articleId: number
  language: string
}

export function CommentSection({ articleId, language }: CommentSectionProps) {
  const [commentText, setCommentText] = useState("")
  const t = (translations as any)[language] || translations.en

  // Mock comments data
  const comments = [
    {
      id: 1,
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=40&width=40&query=user",
      },
      text: t.comments.sampleComments[0],
      date: "2023-07-15",
      isExpert: true,
    },
    {
      id: 2,
      user: {
        name: "Maria Garcia",
        avatar: "/placeholder.svg?height=40&width=40&query=person",
      },
      text: t.comments.sampleComments[1],
      date: "2023-07-16",
      isExpert: false,
    },
  ]

  return (
    <div className="border-t p-4 space-y-4">
      <h4 className="font-medium">{t.comments.title}</h4>

      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar>
            <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
            <AvatarFallback>{comment.user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center">
              <p className="font-medium">{comment.user.name}</p>
              {comment.isExpert && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {t.comments.expert}
                </Badge>
              )}
              <span className="ml-auto text-xs text-muted-foreground">{comment.date}</span>
            </div>
            <p className="text-sm mt-1">{comment.text}</p>
          </div>
        </div>
      ))}

      <div className="flex space-x-3 pt-2">
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40&query=profile" alt="You" />
          <AvatarFallback>YO</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={t.comments.placeholder}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="flex justify-end">
            <Button size="sm">{t.comments.submit}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Import Badge component since it's used in this file
import { Badge } from "@/components/ui/badge"
