"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryCardsProps {
  inventory?: any[]
}

export function SummaryCards({ inventory = [] }: SummaryCardsProps) {
  // Calculate summary data
  const totalItems = inventory.length
  const totalValue = inventory.reduce((sum, item) => sum + (item.price || 0), 0)

  // Sample category data
  const categoryData = {
    Rings: 35,
    Necklaces: 28,
    Earrings: 22,
    Bracelets: 15,
  }

  // Sample location data
  const locationData = {
    "Main Showroom": 45,
    Vault: 30,
    Workshop: 15,
    "Display Cases": 10,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <h4 className="text-2xl font-bold">{totalItems}</h4>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUp className="mr-1 h-4 w-4" />
              <span>5%</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">+12 items this month</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <h4 className="text-2xl font-bold">${totalValue.toLocaleString()}</h4>
            </div>
            <div className="flex items-center text-sm text-red-600">
              <ArrowDown className="mr-1 h-4 w-4" />
              <span>2%</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">-$5,200 from last month</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Categories</p>
            <div className="mt-2 space-y-2">
              {Object.entries(categoryData).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-xs">{category}</span>
                  <div className="flex items-center">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${(count / totalItems) * 100}%` }} />
                    </div>
                    <span className="ml-2 text-xs">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Locations</p>
            <div className="mt-2 space-y-2">
              {Object.entries(locationData).map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <span className="text-xs">{location}</span>
                  <div className="flex items-center">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full",
                          location === "Main Showroom" && "bg-blue-500",
                          location === "Vault" && "bg-amber-500",
                          location === "Workshop" && "bg-green-500",
                          location === "Display Cases" && "bg-primary",
                        )}
                        style={{ width: `${(count / totalItems) * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-xs">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
