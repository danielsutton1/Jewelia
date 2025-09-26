"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, MapPin } from "lucide-react"

interface LocationViewProps {
  inventory: any[]
}

export function LocationView({ inventory }: LocationViewProps) {
  // Group inventory by location
  const locations = inventory.reduce(
    (acc, item) => {
      const location = item.location
      if (!acc[location]) {
        acc[location] = []
      }
      acc[location].push(item)
      return acc
    },
    {} as Record<string, any[]>,
  )

  // Location colors for visual distinction
  const locationColors: Record<string, string> = {
    "Main Showroom": "bg-blue-100 text-blue-800",
    Vault: "bg-amber-100 text-amber-800",
    Workshop: "bg-green-100 text-green-800",
    "Display Cases": "bg-purple-100 text-purple-800",
  }

  return (
    <div className="space-y-8">
      {Object.entries(locations).map(([location, items]) => (
        <div key={location}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${locationColors[location] || "bg-gray-100"}`}
              >
                <MapPin className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-semibold">{location}</h3>
              <Badge variant="outline">{(items as any[]).length} items</Badge>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(items as any[]).slice(0, 4).map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  {item.status === "low-stock" && (
                    <Badge className="absolute right-2 top-2 bg-amber-500">Low Stock</Badge>
                  )}
                  {item.status === "out-of-stock" && (
                    <Badge className="absolute right-2 top-2 bg-red-500">Out of Stock</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold line-clamp-1">{item.name}</h4>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-lg font-bold">${item.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">SKU: {item.sku}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(items as any[]).length > 4 && (
            <div className="mt-2 text-center">
              <Button variant="link" size="sm">
                Show {(items as any[]).length - 4} more items
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
