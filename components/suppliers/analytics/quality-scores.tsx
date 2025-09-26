"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface QualityScoresProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export default function QualityScores({ timeRange, selectedSuppliers, selectedCategories }: QualityScoresProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  const data = [
    { name: "Diamond Direct", score: 96 },
    { name: "Precision Casting", score: 94 },
    { name: "Gem Source", score: 91 },
    { name: "Master Plating", score: 89 },
    { name: "Goldsmith Supplies", score: 87 },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#22c55e" // green-500
    if (score >= 80) return "#3b82f6" // blue-500
    if (score >= 70) return "#f59e0b" // amber-500
    return "#ef4444" // red-500
  }

  const averageScore = data.reduce((sum, item) => sum + item.score, 0) / data.length

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Quality Scores</CardTitle>
        <CardDescription>Inspection results and defect rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{averageScore.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">Average Score (out of 100)</span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}`, "Quality Score"]}
                  labelFormatter={(label) => `Supplier: ${label}`}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-md">
              <div className="font-medium text-green-700">3</div>
              <div className="text-xs text-muted-foreground">Top Tier (90+)</div>
            </div>
            <div className="bg-red-50 p-2 rounded-md">
              <div className="font-medium text-red-700">1</div>
              <div className="text-xs text-muted-foreground">Needs Improvement ({"<"}80)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
