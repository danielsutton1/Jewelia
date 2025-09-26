import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArticleItem } from "../article-item"
import { translations } from "../translations"

interface TroubleshootingProps {
  language: string
}

export function Troubleshooting({ language }: TroubleshootingProps) {
  const t = (translations as any)[language] || translations.en

  const troubleshootingGuides = [
    {
      id: 1,
      title: t.troubleshooting.items[0].title,
      description: t.troubleshooting.items[0].description,
      category: "Gemstone Setting",
      lastUpdated: "2023-05-20",
      version: "1.3",
    },
    {
      id: 2,
      title: t.troubleshooting.items[1].title,
      description: t.troubleshooting.items[1].description,
      category: "Metal Casting",
      lastUpdated: "2023-06-15",
      version: "2.1",
    },
    {
      id: 3,
      title: t.troubleshooting.items[2].title,
      description: t.troubleshooting.items[2].description,
      category: "Polishing",
      lastUpdated: "2023-07-05",
      version: "1.2",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.troubleshooting.title}</CardTitle>
        <CardDescription>{t.troubleshooting.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {troubleshootingGuides.map((guide) => (
            <ArticleItem key={guide.id} item={guide} language={language} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
