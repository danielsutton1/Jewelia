"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Minus, AlertTriangle, CheckCircle } from "lucide-react"
import { useState } from "react"

// Mock data for partner scorecards
const partnerScoreData = {
  "GoldCraft Suppliers": {
    overall: 4.7,
    previousOverall: 4.5,
    metrics: [
      { name: "Quality", score: 4.8, target: 4.5, trend: "up" },
      { name: "Delivery", score: 4.6, target: 4.5, trend: "up" },
      { name: "Cost", score: 4.3, target: 4.5, trend: "down" },
      { name: "Response Time", score: 4.9, target: 4.5, trend: "up" },
      { name: 'Communication", score: 4.7, target: 4.5  score: 4.9, target: 4.5, trend: "up' },
      { name: "Communication", score: 4.7, target: 4.5, trend: "up" },
      { name: "Relationship", score: 4.5, target: 4.5, trend: "neutral" },
    ],
    alerts: [
      { type: "warning", message: "Cost performance below target" },
      { type: "success", message: "Exceptional response time performance" },
    ],
  },
  "Diamond District Gems": {
    overall: 4.5,
    previousOverall: 4.6,
    metrics: [
      { name: "Quality", score: 4.9, target: 4.5, trend: "up" },
      { name: "Delivery", score: 4.2, target: 4.5, trend: "down" },
      { name: "Cost", score: 4.1, target: 4.5, trend: "down" },
      { name: "Response Time", score: 4.4, target: 4.5, trend: "down" },
      { name: "Communication", score: 4.6, target: 4.5, trend: "up" },
      { name: "Relationship", score: 4.8, target: 4.5, trend: "up" },
    ],
    alerts: [
      { type: "warning", message: "Delivery performance declining" },
      { type: "warning", message: "Response time below target" },
      { type: "success", message: "Outstanding quality ratings" },
    ],
  },
  "Precision Casting Co.": {
    overall: 4.6,
    previousOverall: 4.4,
    metrics: [
      { name: "Quality", score: 4.7, target: 4.5, trend: "up" },
      { name: "Delivery", score: 4.8, target: 4.5, trend: "up" },
      { name: "Cost", score: 4.2, target: 4.5, trend: "up" },
      { name: "Response Time", score: 4.5, target: 4.5, trend: "neutral" },
      { name: "Communication", score: 4.6, target: 4.5, trend: "up" },
      { name: "Relationship", score: 4.8, target: 4.5, trend: "up" },
    ],
    alerts: [
      { type: "success", message: "Significant improvement in all metrics" },
      { type: "success", message: "Strong delivery performance" },
    ],
  },
}

export function PartnerScorecard() {
  const [selectedPartner, setSelectedPartner] = useState("GoldCraft Suppliers")
  const partnerData = partnerScoreData[selectedPartner as keyof typeof partnerScoreData]

  // Helper function to render trend indicator
  const renderTrend = (trend: string, score: number, target: number) => {
    const diff = (score - target).toFixed(1)

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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Partner Scorecard</CardTitle>
          <CardDescription>Detailed performance metrics for individual partners</CardDescription>
        </div>
        <Select value={selectedPartner} onValueChange={setSelectedPartner}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select partner" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(partnerScoreData).map((partner) => (
              <SelectItem key={partner} value={partner}>
                {partner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Overall Score</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{partnerData.overall.toFixed(1)}</span>
              {partnerData.overall > partnerData.previousOverall ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                  <ArrowUp className="h-3 w-3" />
                  {(partnerData.overall - partnerData.previousOverall).toFixed(1)}
                </Badge>
              ) : partnerData.overall < partnerData.previousOverall ? (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                  <ArrowDown className="h-3 w-3" />
                  {(partnerData.previousOverall - partnerData.overall).toFixed(1)}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1">
                  <Minus className="h-3 w-3" />
                  0.0
                </Badge>
              )}
            </div>
          </div>
          <Progress value={partnerData.overall * 20} className="h-2" />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Performance Metrics</h3>
          {partnerData.metrics.map((metric, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{metric.score?.toFixed(1) || '0.0'}</span>
                  {renderTrend(metric.trend || 'stable', metric.score || 0, metric.target || 0)}
                </div>
              </div>
              <Progress
                value={(metric.score || 0) * 20}
                className={`h-2 ${(metric.score || 0) >= (metric.target || 0) ? "bg-green-100" : "bg-amber-100"}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Alerts & Notifications</h3>
          <div className="space-y-2">
            {partnerData.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-2 rounded-md flex items-start gap-2 ${
                  alert.type === "warning" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                }`}
              >
                {alert.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                ) : (
                  <CheckCircle className="h-4 w-4 mt-0.5" />
                )}
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
