"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts"

interface CategoryAnalysisProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export default function CategoryAnalysis({ timeRange, selectedSuppliers, selectedCategories }: CategoryAnalysisProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  const data = [
    { category: "Gemstones", score: 88, benchmark: 85 },
    { category: "Precious Metals", score: 92, benchmark: 87 },
    { category: "Findings", score: 85, benchmark: 82 },
    { category: "Casting", score: 90, benchmark: 86 },
    { category: "Plating", score: 87, benchmark: 84 },
    { category: "Packaging", score: 94, benchmark: 88 },
    { category: "Shipping", score: 89, benchmark: 85 },
  ]

  // Calculate average score across categories
  const averageScore = data.reduce((sum, item) => sum + item.score, 0) / data.length
  const benchmarkAverage = data.reduce((sum, item) => sum + item.benchmark, 0) / data.length

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Category Analysis</CardTitle>
        <CardDescription>Performance by product/service category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Average Score</span>
              <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">vs. Benchmark</span>
              <div className="text-xl font-semibold text-green-600">
                +{(averageScore - benchmarkAverage).toFixed(1)}
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Performance Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar
                  name="Industry Benchmark"
                  dataKey="benchmark"
                  stroke="#6b7280"
                  fill="#6b7280"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-md">
              <div className="font-medium text-green-700">6</div>
              <div className="text-xs text-muted-foreground">Categories Above Benchmark</div>
            </div>
            <div className="bg-amber-50 p-2 rounded-md">
              <div className="font-medium text-amber-700">1</div>
              <div className="text-xs text-muted-foreground">Categories Below Benchmark</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
