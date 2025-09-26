import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArticleItem } from "../article-item"
import { translations } from "../translations"

interface TechnicalGuidesProps {
  language: string
}

export function TechnicalGuides({ language }: TechnicalGuidesProps) {
  const t = (translations as any)[language] || translations.en

  const guides = [
    {
      id: 1,
      title: t.technicalGuides.items[0].title,
      description: t.technicalGuides.items[0].description,
      category: "Gemstone Setting",
      lastUpdated: "2023-04-18",
      version: "2.1",
    },
    {
      id: 2,
      title: t.technicalGuides.items[1].title,
      description: t.technicalGuides.items[1].description,
      category: "Metal Casting",
      lastUpdated: "2023-05-30",
      version: "3.0",
    },
    {
      id: 3,
      title: t.technicalGuides.items[2].title,
      description: t.technicalGuides.items[2].description,
      category: "Polishing",
      lastUpdated: "2023-06-12",
      version: "1.5",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.technicalGuides.title}</CardTitle>
        <CardDescription>{t.technicalGuides.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {guides.map((guide) => (
            <ArticleItem key={guide.id} item={guide} language={language} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
