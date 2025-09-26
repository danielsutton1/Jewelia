"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VisualFloorPlan } from "./visual-floor-plan"
import { ResourceAllocation } from "./resource-allocation"
import { RealTimeView } from "./real-time-view"
import { SafetyChecklist } from "./safety-checklist"
import { mockWorkshopData } from "./mock-data"

export function WorkshopFloorManager() {
  const [workshopData, setWorkshopData] = useState(mockWorkshopData)

  const handleWorkshopDataChange = (newData: typeof mockWorkshopData) => {
    setWorkshopData(newData)
  }

  return (
    <Tabs defaultValue="visual-plan" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto">
        <TabsTrigger value="visual-plan">Visual Floor Plan</TabsTrigger>
        <TabsTrigger value="resource-allocation">Resource Allocation</TabsTrigger>
        <TabsTrigger value="real-time">Real-Time View</TabsTrigger>
        <TabsTrigger value="safety">Safety Checklist</TabsTrigger>
      </TabsList>
      <TabsContent value="visual-plan" className="mt-6">
        <VisualFloorPlan workshopData={workshopData} onWorkshopDataChange={handleWorkshopDataChange} />
      </TabsContent>
      <TabsContent value="resource-allocation" className="mt-6">
        <ResourceAllocation workshopData={workshopData} onWorkshopDataChange={handleWorkshopDataChange} />
      </TabsContent>
      <TabsContent value="real-time" className="mt-6">
        <RealTimeView workshopData={workshopData} />
      </TabsContent>
      <TabsContent value="safety" className="mt-6">
        <SafetyChecklist workshopData={workshopData} />
      </TabsContent>
    </Tabs>
  )
}
