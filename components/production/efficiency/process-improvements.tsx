"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronRight, TrendingUp } from "lucide-react"

export function ProcessImprovements({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const improvements = [
    {
      id: "PI-001",
      title: "Optimize Stone Setting Workflow",
      description: "Reorganize the stone setting station to reduce movement and improve tool access",
      impact: "High",
      stage: "Stone Setting",
      estimatedGain: "15% reduction in cycle time",
      status: "recommended",
    },
    {
      id: "PI-002",
      title: "Implement Pre-polish Quality Check",
      description: "Add a quick inspection before polishing to catch defects earlier",
      impact: "Medium",
      stage: "Polishing",
      estimatedGain: "30% reduction in rework",
      status: "in-progress",
    },
    {
      id: "PI-003",
      title: "Standardize Casting Setup Procedures",
      description: "Create and enforce standard procedures for casting setup to reduce variability",
      impact: "Medium",
      stage: "Casting",
      estimatedGain: "10% improvement in first-pass yield",
      status: "implemented",
    },
    {
      id: "PI-004",
      title: "Cross-train QC Personnel",
      description: "Train QC staff on multiple inspection types to improve resource flexibility",
      impact: "Low",
      stage: "Quality Control",
      estimatedGain: "20% improvement in resource utilization",
      status: "recommended",
    },
    {
      id: "PI-005",
      title: "Batch Similar Designs",
      description: "Group similar designs in production to reduce setup time between tasks",
      impact: "High",
      stage: "All",
      estimatedGain: "12% increase in throughput",
      status: "planned",
    },
  ]

  const getStatusColor = (status: any) => {
    switch (status) {
      case "implemented":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "planned":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "recommended":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getImpactColor = (impact: any) => {
    switch (impact) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-orange-100 text-orange-800"
      case "Low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Process Improvements</CardTitle>
        <CardDescription>Recommended and implemented process improvements</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {improvements.map((improvement) => (
              <div key={improvement.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{improvement.title}</h3>
                    <Badge variant="outline" className={getImpactColor(improvement.impact)}>
                      {improvement.impact} Impact
                    </Badge>
                  </div>
                  <Badge variant="outline" className={getStatusColor(improvement.status)}>
                    {improvement.status.charAt(0).toUpperCase() + improvement.status.slice(1)}
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{improvement.description}</p>
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <span className="font-medium">Stage:</span> {improvement.stage}
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>{improvement.estimatedGain}</span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm">
                    Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
