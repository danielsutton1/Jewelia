"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

// Sample data
const customerSegments = [
  { name: "New", value: 120, color: "#8884d8" },
  { name: "Returning", value: 280, color: "#82ca9d" },
  { name: "Loyal", value: 180, color: "#ffc658" },
]

const customerAcquisition = [
  { name: "Direct", value: 150, color: "#0088FE" },
  { name: "Organic Search", value: 200, color: "#00C49F" },
  { name: "Social Media", value: 120, color: "#FFBB28" },
  { name: "Email", value: 80, color: "#FF8042" },
  { name: "Referral", value: 50, color: "#8884d8" },
]

const customerRetention = [
  { month: "Jan", retention: 85 },
  { month: "Feb", retention: 82 },
  { month: "Mar", retention: 88 },
  { month: "Apr", retention: 86 },
  { month: "May", retention: 90 },
  { month: "Jun", retention: 92 },
  { month: "Jul", retention: 89 },
  { month: "Aug", retention: 91 },
  { month: "Sep", retention: 87 },
  { month: "Oct", retention: 89 },
  { month: "Nov", retention: 93 },
  { month: "Dec", retention: 95 },
]

const customerLifetimeValue = [
  { segment: "New", value: 120 },
  { segment: "6 Months", value: 350 },
  { segment: "1 Year", value: 580 },
  { segment: "2 Years", value: 920 },
  { segment: "3+ Years", value: 1450 },
]

export function CustomerAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Distribution of customer types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} customers`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acquisition Channels</CardTitle>
            <CardDescription>How customers find your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerAcquisition}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {customerAcquisition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} customers`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Retention</CardTitle>
            <CardDescription>Monthly retention rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerRetention} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Retention Rate"]} />
                  <Bar dataKey="retention" fill="hsl(var(--primary))" name="Retention Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value</CardTitle>
            <CardDescription>Average value by customer tenure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerLifetimeValue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Average CLV"]} />
                  <Bar dataKey="value" fill="#82ca9d" name="Customer Lifetime Value ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
