import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoItem } from "../video-item"
import { translations } from "../translations"

interface VideoTutorialsProps {
  language: string
}

export function VideoTutorials({ language }: VideoTutorialsProps) {
  const t = (translations as any)[language] || translations.en

  const videos = [
    {
      id: 1,
      title: t.videoTutorials.items[0].title,
      description: t.videoTutorials.items[0].description,
      thumbnail: "/jewelry-tutorial.png",
      duration: "12:45",
      category: "Gemstone Setting",
    },
    {
      id: 2,
      title: t.videoTutorials.items[1].title,
      description: t.videoTutorials.items[1].description,
      thumbnail: "/jewelry-casting.png",
      duration: "18:30",
      category: "Metal Casting",
    },
    {
      id: 3,
      title: t.videoTutorials.items[2].title,
      description: t.videoTutorials.items[2].description,
      thumbnail: "/jewelry-polishing.png",
      duration: "09:15",
      category: "Polishing",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.videoTutorials.title}</CardTitle>
        <CardDescription>{t.videoTutorials.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoItem key={video.id} video={video} language={language} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
