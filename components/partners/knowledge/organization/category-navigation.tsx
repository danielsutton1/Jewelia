import { Button } from "@/components/ui/button"
import { translations } from "../translations"

interface CategoryNavigationProps {
  language: string
}

export function CategoryNavigation({ language }: CategoryNavigationProps) {
  const t = (translations as any)[language] || translations.en

  const categories = [
    { id: "all", name: t.categories.all },
    { id: "gemstone-setting", name: t.categories.gemstoneSettings },
    { id: "metal-casting", name: t.categories.metalCasting },
    { id: "polishing", name: t.categories.polishing },
    { id: "quality-control", name: t.categories.qualityControl },
    { id: "shipping", name: t.categories.shipping },
    { id: "production", name: t.categories.production },
  ]

  return (
    <div className="space-y-1">
      <h3 className="font-medium mb-2">{t.categories.title}</h3>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={category.id === "all" ? "default" : "ghost"}
          className="w-full justify-start"
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}
