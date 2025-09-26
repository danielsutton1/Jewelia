"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CatalogItem {
  id: string
  name: string
  category: string
  price: number
  unit: string
  image?: string
  inStock: boolean
}

interface CatalogBrowserProps {
  supplierId?: string
  onAddItem: (item: CatalogItem) => void
}

export function CatalogBrowser({ supplierId, onAddItem }: CatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<CatalogItem[]>([])
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Simulate fetching catalog items from API
  useEffect(() => {
    // In a real app, this would be an API call with the supplierId
    const mockItems: CatalogItem[] = [
      {
        id: "catalog-diamond-001",
        name: "Round Diamond 1ct VS1 E",
        category: "Gemstones",
        price: 2000.0,
        unit: "piece",
        image: "/catalog/round-diamond-1ct.png",
        inStock: true,
      },
      {
        id: "catalog-diamond-002",
        name: "Emerald Cut Diamond 1.5ct VS2 G",
        category: "Gemstones",
        price: 3200.0,
        unit: "piece",
        image: "/catalog/emerald-cut-diamond.png",
        inStock: true,
      },
      {
        id: "catalog-ruby-001",
        name: "Ruby 4mm Round",
        category: "Gemstones",
        price: 280.0,
        unit: "piece",
        image: "/catalog/ruby-round.png",
        inStock: true,
      },
      {
        id: "catalog-sapphire-001",
        name: "Blue Sapphire 3mm Round",
        category: "Gemstones",
        price: 120.0,
        unit: "piece",
        image: "/catalog/sapphire-oval.png",
        inStock: true,
      },
      {
        id: "catalog-emerald-001",
        name: "Emerald 5mm Cushion",
        category: "Gemstones",
        price: 450.0,
        unit: "piece",
        image: "/catalog/emerald-cushion.png",
        inStock: false,
      },
      {
        id: "catalog-gold-001",
        name: "14K Gold Wire - 1mm",
        category: "Precious Metals",
        price: 45.0,
        unit: "meter",
        image: "/catalog/gold-wire-14k.png",
        inStock: true,
      },
      {
        id: "catalog-gold-002",
        name: "18K Gold Sheet - 0.5mm",
        category: "Precious Metals",
        price: 80.0,
        unit: "sheet",
        image: "/catalog/gold-wire-14k.png",
        inStock: true,
      },
      {
        id: "catalog-silver-001",
        name: "Sterling Silver Wire - 1mm",
        category: "Precious Metals",
        price: 8.0,
        unit: "meter",
        image: "/catalog/silver-sheet.png",
        inStock: true,
      },
      {
        id: "catalog-silver-002",
        name: "Sterling Silver Sheet - 0.5mm",
        category: "Precious Metals",
        price: 75.0,
        unit: "sheet",
        image: "/catalog/silver-sheet.png",
        inStock: true,
      },
      {
        id: "catalog-platinum-001",
        name: "Platinum Wire - 1mm",
        category: "Precious Metals",
        price: 120.0,
        unit: "meter",
        image: "/catalog/platinum-wire.png",
        inStock: true,
      },
      {
        id: "catalog-finding-001",
        name: "Gold Lobster Clasp - 14K",
        category: "Findings",
        price: 25.0,
        unit: "piece",
        image: "/catalog/lobster-clasp-gold.png",
        inStock: true,
      },
      {
        id: "catalog-finding-002",
        name: "Silver Jump Rings - 5mm",
        category: "Findings",
        price: 0.5,
        unit: "piece",
        image: "/catalog/jump-rings-silver.png",
        inStock: true,
      },
      {
        id: "catalog-finding-003",
        name: "Gold Earring Backs",
        category: "Findings",
        price: 8.0,
        unit: "pair",
        image: "/catalog/earring-backs-gold.png",
        inStock: true,
      },
      {
        id: "catalog-casting-001",
        name: "Ring Casting - Model A",
        category: "Castings",
        price: 28.0,
        unit: "piece",
        image: "/catalog/ring-blank-silver.png",
        inStock: true,
      },
      {
        id: "catalog-casting-002",
        name: "Pendant Casting - Model B",
        category: "Castings",
        price: 36.0,
        unit: "piece",
        image: "/catalog/ring-blank-silver.png",
        inStock: true,
      },
    ]

    setItems(mockItems)
    setFilteredItems(mockItems)
  }, [supplierId])

  // Filter items based on search query and selected category
  useEffect(() => {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }, [searchQuery, selectedCategory, items])

  // Get unique categories
  const categories = Array.from(new Set(items.map((item) => item.category)))

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search catalog..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden mr-4">
                    {item.image ? (
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-center text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <span className="mx-1">•</span>
                      <span>
                        ${item.price.toFixed(2)} / {item.unit}
                      </span>
                      <span className="mx-1">•</span>
                      <span className={item.inStock ? "text-green-600" : "text-red-600"}>
                        {item.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2"
                    onClick={() => onAddItem(item)}
                    disabled={!item.inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
