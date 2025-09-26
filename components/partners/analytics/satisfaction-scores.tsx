"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

export function PartnerSatisfactionScores() {
  // Mock data for satisfaction scores
  const satisfactionData = [
    {
      metric: "Overall Satisfaction",
      score: 4.7,
      previousScore: 4.5,
      trend: "up",
      description: "General partner satisfaction",
    },
    {
      metric: "Communication",
      score: 4.8,
      previousScore: 4.7,
      trend: "up",
      description: "Clarity and responsiveness",
    },
    {
      metric: "Relationship",
      score: 4.6,
      previousScore: 4.6,
      trend: "neutral",
      description: "Long-term partnership quality",
    },
    {
      metric: "Problem Resolution",
      score: 4.5,
      previousScore: 4.6,
      trend: "down",
      description: "Issue handling effectiveness",
    },
    {
      metric: "Ease of Doing Business",
      score: 4.9,
      previousScore: 4.7,
      trend: "up",
      description: "Process and workflow efficiency",
    },
  ]

  // Helper function to render trend indicator
  const renderTrend = (trend: string, current: number, previous: number) => {
    const diff = (current - previous).toFixed(1)

    if (trend === "up") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
          <ArrowUp className="h-3 w-3" />
          {diff}
        </Badge>
      )
    } else if (trend === "down") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <ArrowDown className="h-3 w-3" />
          {diff}
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1">
          <Minus className="h-3 w-3" />
          {diff}
        </Badge>
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Satisfaction Scores</CardTitle>
        <CardDescription>Partner satisfaction metrics based on feedback and surveys</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {satisfactionData.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <div>
                  <span className="text-sm font-medium">{item.metric}</span>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{item.score.toFixed(1)}</span>
                  {renderTrend(item.trend, item.score, item.previousScore)}
                </div>
              </div>
              <Progress value={item.score * 20} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
