"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DeliveryPerformanceProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export default function DeliveryPerformance({
  timeRange,
  selectedSuppliers,
  selectedCategories,
}: DeliveryPerformanceProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  const onTimeDeliveryRate = 87
  const earlyDeliveries = 12
  const lateDeliveries = 13
  const totalDeliveries = 100

  // Mock trend data
  const trend = [
    { month: "Jan", rate: 82 },
    { month: "Feb", rate: 85 },
    { month: "Mar", rate: 83 },
    { month: "Apr", rate: 88 },
    { month: "May", rate: 86 },
    { month: "Jun", rate: 87 },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">On-Time Delivery Rate</CardTitle>
        <CardDescription>Performance across all suppliers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{onTimeDeliveryRate}%</span>
            <span className="text-sm text-muted-foreground">Target: 95%</span>
          </div>

          <Progress value={onTimeDeliveryRate} className="h-2" />

          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-green-50 p-2 rounded-md">
              <div className="font-medium text-green-700">{onTimeDeliveryRate}</div>
              <div className="text-xs text-muted-foreground">On Time</div>
            </div>
            <div className="bg-blue-50 p-2 rounded-md">
              <div className="font-medium text-blue-700">{earlyDeliveries}</div>
              <div className="text-xs text-muted-foreground">Early</div>
            </div>
            <div className="bg-red-50 p-2 rounded-md">
              <div className="font-medium text-red-700">{lateDeliveries}</div>
              <div className="text-xs text-muted-foreground">Late</div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-sm font-medium mb-2">6-Month Trend</div>
            <div className="flex items-end justify-between h-16">
              {trend.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-6 bg-primary rounded-t" style={{ height: `${(item.rate / 100) * 60}px` }}></div>
                  <div className="text-xs mt-1">{item.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
