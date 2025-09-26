"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Users, BarChart } from "lucide-react"

interface AuditDashboardProps {
  onStartNewAudit: () => void
}

export function AuditDashboard({ onStartNewAudit }: AuditDashboardProps) {
  // Mock data for the dashboard
  const activeAudits = [
    {
      id: "AUD-2023-05",
      name: "Main Showroom Quarterly Audit",
      startDate: "2023-05-15",
      progress: 65,
      assignedUsers: ["John Doe", "Jane Smith"],
      status: "In Progress",
      itemsScanned: 87,
      totalItems: 134,
      discrepancies: 12,
    },
    {
      id: "AUD-2023-06",
      name: "Vault Monthly Verification",
      startDate: "2023-06-01",
      progress: 32,
      assignedUsers: ["Alice Johnson"],
      status: "In Progress",
      itemsScanned: 45,
      totalItems: 142,
      discrepancies: 3,
    },
  ]

  const recentAudits = [
    {
      id: "AUD-2023-04",
      name: "Display Cases Audit",
      completionDate: "2023-04-28",
      status: "Completed",
      discrepancies: 8,
      resolved: 8,
    },
    {
      id: "AUD-2023-03",
      name: "Workshop Inventory Check",
      completionDate: "2023-03-15",
      status: "Completed",
      discrepancies: 5,
      resolved: 4,
    },
  ]

  const auditStats = {
    totalAudits: 24,
    completedThisMonth: 3,
    pendingResolution: 2,
    averageAccuracy: 96.5,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audit Dashboard</h2>
        <Button onClick={onStartNewAudit}>Start New Audit</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.totalAudits}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.pendingResolution}</div>
            <p className="text-xs text-muted-foreground mt-1">Discrepancies to resolve</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all audits</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Audits */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Audits</h3>
        <div className="space-y-4">
          {activeAudits.map((audit) => (
            <Card key={audit.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{audit.name}</CardTitle>
                    <CardDescription>
                      Started: {audit.startDate} • ID: {audit.id}
                    </CardDescription>
                  </div>
                  <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                    {audit.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">
                    {audit.itemsScanned} of {audit.totalItems} items scanned
                  </div>
                  <div className="text-sm font-medium">{audit.progress}%</div>
                </div>
                <Progress value={audit.progress} className="h-2" />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Assigned to: {audit.assignedUsers.join(", ")}</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                    <span className="text-sm font-medium text-amber-500">{audit.discrepancies} discrepancies</span>
                  </div>
                </div>
              </CardContent>
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  Continue Audit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Audits */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recently Completed Audits</h3>
        <div className="space-y-4">
          {recentAudits.map((audit) => (
            <Card key={audit.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{audit.name}</CardTitle>
                    <CardDescription>
                      Completed: {audit.completionDate} • ID: {audit.id}
                    </CardDescription>
                  </div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    {audit.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      {audit.resolved} of {audit.discrepancies} discrepancies resolved
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8">
                    <BarChart className="h-4 w-4 mr-1" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
