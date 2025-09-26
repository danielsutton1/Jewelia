"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingDown, AlertTriangle, Clock, DollarSign, Truck } from "lucide-react"

export function ImprovementAreas() {
  // Mock data for improvement areas
  const improvementAreas = [
    {
      id: 1,
      area: "Response Time",
      partners: ["Diamond District Gems", "Master Engravers Guild"],
      impact: "high",
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      description: "Slow response times affecting project timelines",
      recommendation: "Implement SLA agreements with response time requirements",
    },
    {
      id: 2,
      area: "Cost Management",
      partners: ["GoldCraft Suppliers", "Shine Plating Services"],
      impact: "medium",
      icon: <DollarSign className="h-5 w-5 text-amber-500" />,
      description: "Costs increasing faster than industry benchmarks",
      recommendation: "Negotiate volume-based discounts and long-term pricing agreements",
    },
    {
      id: 3,
      area: "Delivery Performance",
      partners: ["Diamond District Gems", "Pearl Perfection"],
      impact: "high",
      icon: <Truck className="h-5 w-5 text-amber-500" />,
      description: "Inconsistent delivery times affecting production schedules",
      recommendation: "Implement delivery performance incentives and penalties",
    },
    {
      id: 4,
      area: "Quality Consistency",
      partners: ["Elite Craftspeople", "Swift Shipping Partners"],
      impact: "medium",
      icon: <TrendingDown className="h-5 w-5 text-amber-500" />,
      description: "Increasing variance in quality metrics",
      recommendation: "Establish more rigorous quality control checkpoints",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement Areas</CardTitle>
        <CardDescription>Key areas for partner relationship improvement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {improvementAreas.map((area) => (
            <div key={area.id} className="border rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {area.icon}
                  <div>
                    <h3 className="font-medium">{area.area}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{area.description}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    area.impact === "high"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {area.impact === "high" ? "High Impact" : "Medium Impact"}
                </Badge>
              </div>

              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">Affected Partners:</div>
                <div className="flex flex-wrap gap-1">
                  {area.partners.map((partner, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p className="text-sm">{area.recommendation}</p>
              </div>

              <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                View detailed action plan
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
