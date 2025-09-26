"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for quality ratings
const qualityData = [
  { category: "Metal Suppliers", defectRate: 0.8, returnRate: 0.5, qualityScore: 4.7 },
  { category: "Stone Suppliers", defectRate: 1.2, returnRate: 0.9, qualityScore: 4.5 },
  { category: "Findings", defectRate: 1.5, returnRate: 1.1, qualityScore: 4.3 },
  { category: "Casting", defectRate: 0.7, returnRate: 0.4, qualityScore: 4.8 },
  { category: "Engraving", defectRate: 0.9, returnRate: 0.6, qualityScore: 4.6 },
  { category: "Plating", defectRate: 1.1, returnRate: 0.8, qualityScore: 4.4 },
]

export function QualityRatings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Ratings</CardTitle>
        <CardDescription>Defect rates, returns, and quality scores by partner category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              defectRate: {
                label: "Defect Rate (%)",
                color: "hsl(var(--chart-1))",
              },
              returnRate: {
                label: "Return Rate (%)",
                color: "hsl(var(--chart-2))",
              },
              qualityScore: {
                label: "Quality Score (0-5)",
                color: "hsl(var(--chart-3))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar yAxisId="left" dataKey="defectRate" fill="var(--color-defectRate)" />
                <Bar yAxisId="left" dataKey="returnRate" fill="var(--color-returnRate)" />
                <Bar yAxisId="right" dataKey="qualityScore" fill="var(--color-qualityScore)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-medium">Average Defect Rate</div>
            <div className="text-xl font-bold">1.03%</div>
          </div>
          <div>
            <div className="text-sm font-medium">Average Return Rate</div>
            <div className="text-xl font-bold">0.72%</div>
          </div>
          <div>
            <div className="text-sm font-medium">Average Quality Score</div>
            <div className="text-xl font-bold">4.55</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
