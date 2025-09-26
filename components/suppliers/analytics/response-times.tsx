"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface ResponseTimesProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export default function ResponseTimes({ timeRange, selectedSuppliers, selectedCategories }: ResponseTimesProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  const data = [
    { name: "RFQ Response", value: 1.2, target: 1 },
    { name: "Issue Resolution", value: 2.5, target: 2 },
    { name: "Order Confirmation", value: 0.8, target: 1 },
    { name: "Inquiry Response", value: 1.5, target: 1 },
    { name: "Change Request", value: 1.8, target: 1.5 },
  ]

  // Calculate average response time
  const averageResponseTime = data.reduce((sum, item) => sum + item.value, 0) / data.length

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Response Times</CardTitle>
        <CardDescription>Average days to respond by type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Average Response</span>
              <div className="text-2xl font-bold">{averageResponseTime.toFixed(1)} days</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Target</span>
              <div className="text-xl font-semibold">1.3 days</div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 3]} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value} days`, "Response Time"]}
                  labelFormatter={(label) => `Type: ${label}`}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Response Time (days)" />
                {data.map((entry, index) => (
                  <ReferenceLine
                    key={`ref-line-${index}`}
                    x={entry.target}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    isFront={true}
                    ifOverflow="extendDomain"
                    segment={[{ y: index - 0.4 }, { y: index + 0.4 }]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-md">
              <div className="font-medium text-green-700">2</div>
              <div className="text-xs text-muted-foreground">Meeting Target</div>
            </div>
            <div className="bg-amber-50 p-2 rounded-md">
              <div className="font-medium text-amber-700">3</div>
              <div className="text-xs text-muted-foreground">Exceeding Target</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
