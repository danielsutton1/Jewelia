"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, DollarSign, Star } from "lucide-react"

// Simple mock data
const rushProviders = [
  {
    id: 1,
    name: "Express Jewelry Finishing",
    specialty: "Polishing & finishing",
    turnaround: "24 hours",
    availability: "Available",
    pricePremium: "30%",
    lastUsed: "1 week ago",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Rapid Setting Services",
    specialty: "Stone setting",
    turnaround: "48 hours",
    availability: "Available",
    pricePremium: "25%",
    lastUsed: "2 weeks ago",
    rating: 4.6,
  },
  {
    id: 3,
    name: "QuickSilver Plating",
    specialty: "Plating & coating",
    turnaround: "24-36 hours",
    availability: "Limited",
    pricePremium: "35%",
    lastUsed: "3 days ago",
    rating: 4.7,
  },
]

export function RushServiceProviders() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rushProviders.map((provider) => (
          <Card key={provider.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                <Badge variant={provider.availability === "Available" ? "success" : "warning"}>
                  {provider.availability}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{provider.specialty}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    <span>Turnaround: {provider.turnaround}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{provider.pricePremium}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>Last used: {provider.lastUsed}</div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-amber-500" />
                    <span>{provider.rating}/5</span>
                  </div>
                </div>
                <div className="pt-2 flex space-x-2">
                  <Button size="sm" className="flex-1">
                    Contact
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1">
                    Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
