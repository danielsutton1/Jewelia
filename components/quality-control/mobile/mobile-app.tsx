"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileInspectionQueue } from "./mobile-inspection-queue"
import { MobileInspectionForm } from "./mobile-inspection-form"
import { MobileIssueTracking } from "./mobile-issue-tracking"
import { MobileHeader } from "./mobile-header"
import { useMobile } from "@/hooks/use-mobile"

export function MobileQualityControlApp() {
  const [activeTab, setActiveTab] = useState("queue")
  const isMobile = useMobile()

  if (!isMobile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold">Mobile View Only</h2>
          <p className="mt-2 text-muted-foreground">
            This interface is optimized for mobile devices. Please access it from a mobile device or resize your browser
            window.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />
      <main className="flex-1 overflow-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="inspect">Inspect</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>
          <TabsContent value="queue" className="mt-4">
            <MobileInspectionQueue />
          </TabsContent>
          <TabsContent value="inspect" className="mt-4">
            <MobileInspectionForm />
          </TabsContent>
          <TabsContent value="issues" className="mt-4">
            <MobileIssueTracking />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
