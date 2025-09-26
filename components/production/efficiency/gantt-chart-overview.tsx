"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function GanttChartOverview({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const workOrders = [
    {
      id: "WO-1001",
      name: "Diamond Ring Set",
      stages: [
        { name: "Design", start: 0, duration: 2, status: "completed" },
        { name: "Casting", start: 2, duration: 1, status: "completed" },
        { name: "Stone Setting", start: 3, duration: 2, status: "in-progress" },
        { name: "Polishing", start: 5, duration: 1, status: "pending" },
        { name: "QC", start: 6, duration: 1, status: "pending" },
      ],
    },
    {
      id: "WO-1002",
      name: "Gold Necklace",
      stages: [
        { name: "Design", start: 1, duration: 1, status: "completed" },
        { name: "Casting", start: 2, duration: 2, status: "completed" },
        { name: "Polishing", start: 4, duration: 1, status: "in-progress" },
        { name: "QC", start: 5, duration: 1, status: "pending" },
      ],
    },
    {
      id: "WO-1003",
      name: "Sapphire Earrings",
      stages: [
        { name: "Design", start: 0, duration: 1, status: "completed" },
        { name: "Casting", start: 1, duration: 1, status: "completed" },
        { name: "Stone Setting", start: 2, duration: 2, status: "completed" },
        { name: "Polishing", start: 4, duration: 1, status: "completed" },
        { name: "QC", start: 5, duration: 1, status: "in-progress" },
      ],
    },
    {
      id: "WO-1004",
      name: "Pearl Bracelet",
      stages: [
        { name: "Design", start: 2, duration: 1, status: "completed" },
        { name: "Assembly", start: 3, duration: 2, status: "in-progress" },
        { name: "QC", start: 5, duration: 1, status: "pending" },
      ],
    },
    {
      id: "WO-1005",
      name: "Emerald Pendant",
      stages: [
        { name: "Design", start: 1, duration: 2, status: "completed" },
        { name: "Casting", start: 3, duration: 1, status: "completed" },
        { name: "Stone Setting", start: 4, duration: 2, status: "in-progress" },
        { name: "Polishing", start: 6, duration: 1, status: "pending" },
        { name: "QC", start: 7, duration: 1, status: "pending" },
      ],
    },
  ]

  const days = Array.from({ length: 10 }, (_, i) => i)

  const getStatusColor = (status: any) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "pending":
        return "bg-gray-300"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Production Timeline</CardTitle>
        <CardDescription>Gantt chart overview of work orders and production stages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-full bg-gray-300"></div>
            <span className="text-xs">Pending</span>
          </div>
        </div>
        <ScrollArea className="h-[350px] w-full">
          <div className="min-w-[800px]">
            <div className="flex border-b">
              <div className="w-[200px] p-2 font-medium">Work Order</div>
              <div className="flex flex-1">
                {days.map((day) => (
                  <div key={day} className="w-[60px] border-l p-2 text-center text-xs font-medium">
                    Day {day + 1}
                  </div>
                ))}
              </div>
            </div>
            {workOrders.map((workOrder) => (
              <div key={workOrder.id} className="flex border-b">
                <div className="w-[200px] p-2">
                  <div className="font-medium">{workOrder.name}</div>
                  <div className="text-xs text-muted-foreground">{workOrder.id}</div>
                </div>
                <div className="relative flex flex-1">
                  {days.map((day) => (
                    <div key={day} className="w-[60px] border-l p-2"></div>
                  ))}
                  {workOrder.stages.map((stage, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute top-2 h-8 rounded ${getStatusColor(stage.status)}`}
                            style={{
                              left: `${stage.start * 60 + 2}px`,
                              width: `${stage.duration * 60 - 4}px`,
                            }}
                          >
                            <div className="flex h-full items-center justify-center overflow-hidden text-xs text-white">
                              {stage.name}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-medium">{stage.name}</div>
                            <div className="text-xs">
                              Duration: {stage.duration} day{stage.duration > 1 ? "s" : ""}
                            </div>
                            <div className="text-xs">
                              Status: <Badge variant="outline">{stage.status}</Badge>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
