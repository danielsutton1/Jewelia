"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
import { AlertCircle } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Sample data for craftspeople workload
const craftspeople = [
  { id: "1", name: "Michael Chen", capacity: 40, currentLoad: 32, overallocated: false },
  { id: "2", name: "Sophia Rodriguez", capacity: 40, currentLoad: 38, overallocated: false },
  { id: "3", name: "David Kim", capacity: 40, currentLoad: 25, overallocated: false },
  { id: "4", name: "Emma Johnson", capacity: 40, currentLoad: 40, overallocated: true },
  { id: "5", name: "James Wilson", capacity: 40, currentLoad: 15, overallocated: false },
  { id: "6", name: "Olivia Martinez", capacity: 40, currentLoad: 30, overallocated: false },
  { id: "7", name: "William Taylor", capacity: 40, currentLoad: 22, overallocated: false },
  { id: "8", name: "Ava Thompson", capacity: 40, currentLoad: 35, overallocated: false },
]

// Generate workload data for the heatmap
const generateHeatmapData = () => {
  const today = new Date()
  const days = 7 // Show a week of data
  const data: Record<string, Record<string, number>> = {}

  craftspeople.forEach((person) => {
    data[person.name] = {}
    for (let i = 0; i < days; i++) {
      const date = addDays(today, i)
      const dateStr = format(date, "yyyy-MM-dd")
      // Generate a random workload between 0 and 100%
      const baseLoad = (person.currentLoad / person.capacity) * 100
      const randomVariation = Math.floor(Math.random() * 30) - 15 // -15 to +15
      data[person.name][dateStr] = Math.min(100, Math.max(0, Math.round(baseLoad + randomVariation)))
    }
  })

  return data
}

export function ResourceWorkload() {
  const [heatmapData, setHeatmapData] = useState<Record<string, Record<string, number>>>({})
  const today = new Date()
  const days = 7 // Show a week of data

  useEffect(() => {
    setHeatmapData(generateHeatmapData())
  }, [])

  // Generate dates for the heatmap
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i))

  // Function to get color based on workload percentage
  const getHeatmapColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-amber-500"
    if (percentage >= 50) return "bg-yellow-400"
    if (percentage >= 25) return "bg-green-400"
    return "bg-emerald-300"
  }

  if (Object.keys(heatmapData).length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Loading workload...</div>
  }

  return (
    <div className="space-y-4">
      {/* Overallocation warning */}
      {craftspeople.some((person) => person.overallocated) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Resource Overallocation</AlertTitle>
          <AlertDescription>
            Some craftspeople are overallocated. Please review and adjust the schedule.
          </AlertDescription>
        </Alert>
      )}

      {/* Current workload */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Current Workload</h3>
        {craftspeople.map((person) => {
          const percentage = Math.round((person.currentLoad / person.capacity) * 100)
          let progressColor = "bg-emerald-500"

          if (percentage >= 90) {
            progressColor = "bg-red-500"
          } else if (percentage >= 75) {
            progressColor = "bg-amber-500"
          }

          return (
            <div key={person.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`/abstract-geometric-shapes.png?height=32&width=32&query=${person.name}`} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{person.name}</span>
                </div>
                <span className="text-xs font-medium">
                  {person.currentLoad}/{person.capacity} hours ({percentage}%)
                </span>
              </div>
              <Progress value={percentage} className={`h-2 ${progressColor}`} />
            </div>
          )
        })}
      </div>

      {/* Workload heatmap */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-medium">Workload Forecast</h3>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Date headers */}
            <div className="flex border-b">
              <div className="w-32 flex-shrink-0 p-2 font-medium">Craftsperson</div>
              {dates.map((date) => (
                <div key={date.toString()} className="w-12 flex-shrink-0 p-2 text-center text-xs">
                  <div>{format(date, "EEE")}</div>
                  <div>{format(date, "d")}</div>
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {craftspeople.map((person) => (
              <div key={person.id} className="flex border-b last:border-b-0">
                <div className="w-32 flex-shrink-0 p-2 text-sm">{person.name}</div>
                {dates.map((date) => {
                  const dateStr = format(date, "yyyy-MM-dd")
                  const percentage = heatmapData[person.name]?.[dateStr] || 0
                  const color = getHeatmapColor(percentage)

                  return (
                    <div key={dateStr} className="w-12 flex-shrink-0 p-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-6 w-6 rounded-sm ${color} mx-auto cursor-help`}
                              aria-label={`${person.name} workload on ${format(date, "MMM d")}: ${percentage}%`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {format(date, "MMM d")}: {percentage}% capacity
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
