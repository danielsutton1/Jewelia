"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, ArrowRight, TrendingUp, Users, Handshake, Award, BarChart4, CheckCircle } from "lucide-react"

export function RecommendationEngine() {
  // Mock data for recommendations
  const recommendations = [
    {
      id: 1,
      title: "Consolidate Metal Suppliers",
      type: "strategic",
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      description: "Consolidate orders with top-performing metal suppliers to increase volume discounts",
      impact: "Potential 12% cost reduction",
      difficulty: "medium",
      partners: ["GoldCraft Suppliers", "Silver Stream Supply"],
    },
    {
      id: 2,
      title: "Implement Quarterly Reviews",
      type: "relationship",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "Schedule quarterly performance reviews with key partners",
      impact: "Improved communication and alignment",
      difficulty: "low",
      partners: ["Diamond District Gems", "Precision Casting Co.", "Master Engravers Guild"],
    },
    {
      id: 3,
      title: "Develop Partner Certification Program",
      type: "quality",
      icon: <Award className="h-5 w-5 text-amber-500" />,
      description: "Create a certification program for partners to standardize quality expectations",
      impact: "15% reduction in quality issues",
      difficulty: "high",
      partners: ["All Partners"],
    },
    {
      id: 4,
      title: "Negotiate Long-term Contracts",
      type: "financial",
      icon: <Handshake className="h-5 w-5 text-green-500" />,
      description: "Secure 2-year contracts with price protection clauses",
      impact: "Stabilized costs and improved planning",
      difficulty: "medium",
      partners: ["GoldCraft Suppliers", "Diamond District Gems", "Pearl Perfection"],
    },
  ]

  // Helper function to get recommendation type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "strategic":
        return "text-purple-700 bg-purple-50 border-purple-200"
      case "relationship":
        return "text-blue-700 bg-blue-50 border-blue-200"
      case "quality":
        return "text-amber-700 bg-amber-50 border-amber-200"
      case "financial":
        return "text-green-700 bg-green-50 border-green-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  // Helper function to get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "low":
        return (
          <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
            Easy to Implement
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
            Moderate Effort
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">
            Significant Effort
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Recommendation Engine
        </CardTitle>
        <CardDescription>AI-powered recommendations to optimize partner relationships</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {rec.icon}
                  <div>
                    <h3 className="font-medium">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className={getTypeColor(rec.type)}>
                  {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">{rec.impact}</p>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm">{rec.partners.join(", ")}</p>
                </div>
                {getDifficultyBadge(rec.difficulty)}
              </div>

              <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                View implementation plan
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
