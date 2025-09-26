"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, PercentIcon, CheckCircle } from "lucide-react"

// Simple mock data
const overflowPartners = [
  {
    id: 1,
    name: "Artisan Workshop Collective",
    specialty: "Full production",
    capacity: "60% available",
    leadTime: "1 week",
    pricePremium: "10%",
    lastUsed: "2 months ago",
    reliability: "High",
  },
  {
    id: 2,
    name: "Jewelry Makers Guild",
    specialty: "Custom pieces",
    capacity: "40% available",
    leadTime: "10 days",
    pricePremium: "15%",
    lastUsed: "3 weeks ago",
    reliability: "Medium",
  },
  {
    id: 3,
    name: "Precision Manufacturing Partners",
    specialty: "High volume production",
    capacity: "75% available",
    leadTime: "5 days",
    pricePremium: "20%",
    lastUsed: "1 month ago",
    reliability: "High",
  },
]

export function OverflowCapacity() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overflowPartners.map((partner) => (
          <Card key={partner.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{partner.name}</CardTitle>
                <Badge
                  variant={
                    partner.capacity.startsWith("7")
                      ? "success"
                      : partner.capacity.startsWith("6")
                        ? "success"
                        : partner.capacity.startsWith("5")
                          ? "default"
                          : "warning"
                  }
                >
                  {partner.capacity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{partner.specialty}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Lead time: {partner.leadTime}</span>
                  </div>
                  <div className="flex items-center">
                    <PercentIcon className="h-4 w-4 mr-1" />
                    <span>{partner.pricePremium}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>Last used: {partner.lastUsed}</div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span>Reliability: {partner.reliability}</span>
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
