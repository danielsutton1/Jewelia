import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArticleItem } from "../article-item"
import { translations } from "../translations"

interface BestPracticesProps {
  language: string
}

export function BestPractices({ language }: BestPracticesProps) {
  const t = (translations as any)[language] || translations.en

  const bestPractices = [
    {
      id: 1,
      title: t.bestPractices.items[0].title,
      description: t.bestPractices.items[0].description,
      category: "Production",
      lastUpdated: "2023-05-15",
      version: "1.2",
    },
    {
      id: 2,
      title: t.bestPractices.items[1].title,
      description: t.bestPractices.items[1].description,
      category: "Quality Control",
      lastUpdated: "2023-06-22",
      version: "2.0",
    },
    {
      id: 3,
      title: t.bestPractices.items[2].title,
      description: t.bestPractices.items[2].description,
      category: "Shipping",
      lastUpdated: "2023-07-10",
      version: "1.0",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.bestPractices.title}</CardTitle>
        <CardDescription>{t.bestPractices.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bestPractices.map((practice) => (
            <ArticleItem key={practice.id} item={practice} language={language} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
