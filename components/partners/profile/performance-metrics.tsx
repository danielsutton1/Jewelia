"use client"

import type { PartnerProfile } from "@/types/partner-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LineChart, BarChart, PieChart } from "lucide-react"

interface PerformanceMetricsProps {
  partner: PartnerProfile
}

export function PerformanceMetrics({ partner }: PerformanceMetricsProps) {
  const { performanceMetrics } = partner

  // Helper function to determine color based on score
  const getColorForScore = (score: number, type: "text" | "bg" = "text") => {
    const prefix = type === "text" ? "text" : "bg"
    if (score >= 9) return `${prefix}-green-600`
    if (score >= 7) return `${prefix}-green-500`
    if (score >= 5) return `${prefix}-yellow-500`
    return `${prefix}-red-500`
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <LineChart className="mr-2 h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Quality, delivery, pricing, and communication metrics</CardDescription>
          </div>
          <div className="text-sm text-gray-500">Last reviewed: {formatDate(performanceMetrics.lastReviewDate)}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Metrics */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium">Quality Rating</h3>
                  <p className="text-xs text-gray-500">Product quality and consistency</p>
                </div>
                <span className={`font-bold ${getColorForScore(performanceMetrics.qualityRating)}`}>
                  {performanceMetrics.qualityRating.toFixed(1)}/5
                </span>
              </div>
              <Progress value={performanceMetrics.qualityRating * 20} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium">On-Time Delivery</h3>
                  <p className="text-xs text-gray-500">Orders delivered by agreed date</p>
                </div>
                <span className={`font-bold ${getColorForScore(performanceMetrics.onTimeDelivery / 10)}`}>
                  {performanceMetrics.onTimeDelivery.toFixed(1)}%
                </span>
              </div>
              <Progress value={performanceMetrics.onTimeDelivery} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium">Price Competitiveness</h3>
                  <p className="text-xs text-gray-500">Value relative to market rates</p>
                </div>
                <span className={`font-bold ${getColorForScore(performanceMetrics.priceCompetitiveness)}`}>
                  {performanceMetrics.priceCompetitiveness.toFixed(1)}/10
                </span>
              </div>
              <Progress value={performanceMetrics.priceCompetitiveness * 10} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium">Communication Score</h3>
                  <p className="text-xs text-gray-500">Responsiveness and clarity</p>
                </div>
                <span className={`font-bold ${getColorForScore(performanceMetrics.communicationScore)}`}>
                  {performanceMetrics.communicationScore.toFixed(1)}/10
                </span>
              </div>
              <Progress value={performanceMetrics.communicationScore * 10} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium">Issue Resolution</h3>
                  <p className="text-xs text-gray-500">Problem-solving effectiveness</p>
                </div>
                <span className={`font-bold ${getColorForScore(performanceMetrics.issueResolution)}`}>
                  {performanceMetrics.issueResolution.toFixed(1)}/10
                </span>
              </div>
              <Progress value={performanceMetrics.issueResolution * 10} className="h-2" />
            </div>
          </div>

          {/* Performance Charts */}
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <BarChart className="w-4 h-4 mr-2 text-gray-500" />
                Performance Trend (Last 12 Months)
              </h3>
              <div className="h-40 flex items-center justify-center bg-gray-50 rounded border">
                <p className="text-gray-500 text-sm">Performance trend chart would appear here</p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <PieChart className="w-4 h-4 mr-2 text-gray-500" />
                Issue Distribution
              </h3>
              <div className="h-40 flex items-center justify-center bg-gray-50 rounded border">
                <p className="text-gray-500 text-sm">Issue distribution chart would appear here</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="text-sm font-medium">Average Response Time</h3>
                <p className="text-xs text-gray-500">Time to acknowledge inquiries</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{performanceMetrics.averageResponseTime}h</p>
                <p className="text-xs text-gray-500">Industry avg: 8h</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
