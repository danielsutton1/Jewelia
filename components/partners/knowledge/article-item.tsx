"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ThumbsUp, Clock, FileText, Flag } from "lucide-react"
import { CommentSection } from "./collaboration/comment-section"
import { translations } from "./translations"

interface ArticleItemProps {
  item: {
    id: number
    title: string
    description: string
    category: string
    lastUpdated: string
    version: string
  }
  language: string
}

export function ArticleItem({ item, language }: ArticleItemProps) {
  const [showComments, setShowComments] = useState(false)
  const t = (translations as any)[language] || translations.en

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <Badge>{item.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{item.description}</p>

        <div className="flex items-center mt-4 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span className="mr-4">
            {t.article.lastUpdated}: {item.lastUpdated}
          </span>

          <FileText className="h-3 w-3 mr-1" />
          <span>
            {t.article.version}: {item.version}
          </span>
        </div>
      </CardContent>
      <div className="flex justify-between pt-0">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{t.article.helpful}</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setShowComments(!showComments)}>
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{t.article.comments}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Flag className="h-4 w-4 mr-1" />
          <span>{t.article.requestUpdate}</span>
        </Button>
      </div>

      {showComments && <CommentSection articleId={item.id} language={language} />}
    </Card>
  )
}
