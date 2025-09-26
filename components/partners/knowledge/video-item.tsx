import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, MessageSquare, ThumbsUp, Flag } from "lucide-react"
import { translations } from "./translations"

interface VideoItemProps {
  video: {
    id: number
    title: string
    description: string
    thumbnail: string
    duration: string
    category: string
  }
  language: string
}

export function VideoItem({ video, language }: VideoItemProps) {
  const t = (translations as any)[language] || translations.en

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="icon" className="rounded-full">
            <Play className="h-6 w-6" />
          </Button>
        </div>
        <Badge className="absolute bottom-2 right-2">{video.duration}</Badge>
      </div>
      <CardContent className="pt-4">
        <h3 className="font-medium mb-1">{video.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
        <Badge variant="outline" className="mt-2">
          {video.category}
        </Badge>
      </CardContent>
      <div className="flex justify-between pt-0">
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{t.video.helpful}</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{t.video.comments}</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Flag className="h-4 w-4 mr-1" />
          <span>{t.video.report}</span>
        </Button>
      </div>
    </Card>
  )
}
