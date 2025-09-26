import { Circle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const categories = [
  {
    id: "meeting",
    name: "Meetings",
    color: "hsl(var(--primary))",
    count: 8,
  },
  {
    id: "call",
    name: "Calls",
    color: "#0ea5e9",
    count: 5,
  },
  {
    id: "demo",
    name: "Demos",
    color: "#8b5cf6",
    count: 3,
  },
  {
    id: "task",
    name: "Tasks",
    color: "#f59e0b",
    count: 12,
  },
  {
    id: "presentation",
    name: "Presentations",
    color: "#10b981",
    count: 4,
  },
]

export function EventCategories() {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3" fill={category.color} stroke="none" />
            <span>{category.name}</span>
          </div>
          <Badge variant="outline">{category.count}</Badge>
        </div>
      ))}
      <Button variant="outline" className="w-full mt-2">
        Manage Categories
      </Button>
    </div>
  )
}
