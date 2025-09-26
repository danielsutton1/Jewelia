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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const churnRiskData = [
  { name: "Very Low", value: 45, color: "#4CAF50" },
  { name: "Low", value: 25, color: "#8BC34A" },
  { name: "Medium", value: 15, color: "#FFC107" },
  { name: "High", value: 10, color: "#FF9800" },
  { name: "Very High", value: 5, color: "#F44336" },
]

const churnFactorsData = [
  { factor: "Inactivity Period", score: 85 },
  { factor: "Declining Purchase Frequency", score: 72 },
  { factor: "Decreasing Order Value", score: 65 },
  { factor: "Support Interactions", score: 58 },
  { factor: "Website Engagement", score: 45 },
  { factor: "Email Response Rate", score: 40 },
]

export function ChurnPrediction() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Churn Prediction</CardTitle>
        <CardDescription>AI-powered customer churn risk analysis and contributing factors</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
            <TabsTrigger value="factors">Contributing Factors</TabsTrigger>
          </TabsList>
          <TabsContent value="distribution">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={churnRiskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {churnRiskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center">
                <div className="mb-6">
                  <h4 className="mb-2 font-medium">Churn Risk Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on AI analysis of customer behavior patterns, purchase history, and engagement metrics, 15% of
                    your customer base shows signs of potential churn risk (high or very high risk categories).
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Predicted Churn Rate</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">8.2%</div>
                    <div className="text-sm text-amber-500">+1.4% from last quarter</div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Projected over the next 90 days based on current trends
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="factors">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={churnFactorsData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="factor" width={150} />
                  <Tooltip formatter={(value) => [`${value}/100`, "Impact Score"]} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h4 className="mb-2 font-medium">Recommended Actions</h4>
              <ul className="list-disc pl-5 text-sm">
                <li>Re-engagement campaign for customers inactive for 60+ days</li>
                <li>Special offers for customers with declining purchase frequency</li>
                <li>Personalized recommendations based on past purchases</li>
                <li>Improve email engagement with more relevant content</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
