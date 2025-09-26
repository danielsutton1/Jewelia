"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users } from "lucide-react"

export function TrainingNeeds({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const trainingNeeds = [
    {
      id: "TN-001",
      skill: "Advanced Stone Setting",
      currentLevel: 65,
      targetLevel: 85,
      priority: "High",
      craftspeople: ["Michael Chen", "David Kim", "Olivia Williams"],
      impact: "Reduce stone setting defects by 30%",
    },
    {
      id: "TN-002",
      skill: "CAD Design Optimization",
      currentLevel: 70,
      targetLevel: 90,
      priority: "Medium",
      craftspeople: ["Emma Johnson", "Sophia Rodriguez"],
      impact: "Reduce design time by 15%",
    },
    {
      id: "TN-003",
      skill: "Platinum Casting",
      currentLevel: 60,
      targetLevel: 80,
      priority: "High",
      craftspeople: ["Michael Chen", "Emma Johnson"],
      impact: "Improve platinum casting yield by 20%",
    },
    {
      id: "TN-004",
      skill: "Quality Inspection",
      currentLevel: 75,
      targetLevel: 90,
      priority: "Medium",
      craftspeople: ["David Kim", "Sophia Rodriguez", "Olivia Williams"],
      impact: "Reduce customer returns by 25%",
    },
    {
      id: "TN-005",
      skill: "Micro-Pavé Setting",
      currentLevel: 55,
      targetLevel: 85,
      priority: "High",
      craftspeople: ["Michael Chen", "Sophia Rodriguez"],
      impact: "Enable new product line with 40% higher margins",
    },
  ]

  const getPriorityColor = (priority: any) => {
    switch (priority) {
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

  const getProgressColor = (current: any, target: any) => {
    const percentage = (current / target) * 100
    if (percentage < 60) return "bg-red-500"
    if (percentage < 80) return "bg-amber-500"
    return "bg-green-500"
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Training Needs</CardTitle>
        <CardDescription>Skill gaps and training priorities for craftspeople</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {trainingNeeds.map((training) => (
              <div key={training.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{training.skill}</h3>
                  <Badge variant="outline" className={getPriorityColor(training.priority)}>
                    {training.priority} Priority
                  </Badge>
                </div>
                <div className="mb-3 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current: {training.currentLevel}%</span>
                    <span>Target: {training.targetLevel}%</span>
                  </div>
                  <Progress
                    value={(training.currentLevel / training.targetLevel) * 100}
                    className={getProgressColor(training.currentLevel, training.targetLevel)}
                  />
                </div>
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Craftspeople:</span> {training.craftspeople.join(", ")}
                </div>
                <div className="text-sm text-green-600">
                  <span className="font-medium">Expected Impact:</span> {training.impact}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Plan Training
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
