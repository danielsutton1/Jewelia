"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IssueReporting } from "./issue-reporting"
import { CorrectiveActions } from "@/components/quality-control/feedback/corrective-actions"
import { FollowUpTracking } from "@/components/quality-control/feedback/follow-up-tracking"
import { ProcessImprovement } from "@/components/quality-control/feedback/process-improvement"

export function FeedbackLoopDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Quality Feedback Loop</h2>
        <p className="text-muted-foreground">Manage quality issues, corrective actions, and process improvements</p>
      </div>

      <Tabs defaultValue="issues">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues">Issue Reporting</TabsTrigger>
          <TabsTrigger value="actions">Corrective Actions</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up Tracking</TabsTrigger>
          <TabsTrigger value="improvement">Process Improvement</TabsTrigger>
        </TabsList>
        <TabsContent value="issues" className="mt-6">
          <IssueReporting />
        </TabsContent>
        <TabsContent value="actions" className="mt-6">
          <CorrectiveActions />
        </TabsContent>
        <TabsContent value="follow-up" className="mt-6">
          <FollowUpTracking />
        </TabsContent>
        <TabsContent value="improvement" className="mt-6">
          <ProcessImprovement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
