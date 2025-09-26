"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

// Simple mock data
const emergencySuppliers = [
  {
    id: 1,
    name: "GoldRush Materials",
    specialty: "Precious metals",
    responseTime: "1-2 hours",
    availability: "Available",
    pricePremium: "15%",
    lastUsed: "2 weeks ago",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Diamond Direct",
    specialty: "Gemstones",
    responseTime: "3-4 hours",
    availability: "Limited",
    pricePremium: "20%",
    lastUsed: "1 month ago",
    rating: 4.5,
  },
  {
    id: 3,
    name: "FastCast Metals",
    specialty: "Casting services",
    responseTime: "Same day",
    availability: "Available",
    pricePremium: "25%",
    lastUsed: "3 days ago",
    rating: 4.7,
  },
]

export function EmergencySuppliers() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {emergencySuppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{supplier.name}</CardTitle>
                <Badge variant={supplier.availability === "Available" ? "success" : "warning"}>
                  {supplier.availability}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{supplier.specialty}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Response: {supplier.responseTime}</span>
                  </div>
                  <div>Premium: {supplier.pricePremium}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>Last used: {supplier.lastUsed}</div>
                  <div>Rating: {supplier.rating}/5</div>
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
