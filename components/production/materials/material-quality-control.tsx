"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  Download,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Award,
  Zap
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface QualityIssue {
  id: string
  material: string
  supplier: string
  issueType: "defect" | "contamination" | "wrong_spec" | "damage" | "certification"
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "investigating" | "resolved" | "closed"
  reportedDate: string
  resolvedDate?: string
  description: string
  impact: string
  resolution?: string
  inspector: string
}

interface QualityMetrics {
  totalInspections: number
  passedInspections: number
  failedInspections: number
  qualityScore: number
  openIssues: number
  resolvedIssues: number
  averageResolutionTime: number
  topIssues: Array<{
    type: string
    count: number
    percentage: number
  }>
}

// Sample quality data
const sampleQualityIssues: QualityIssue[] = [
  {
    id: "QI001",
    material: "14K Yellow Gold",
    supplier: "GoldCorp Metals",
    issueType: "contamination",
    severity: "high",
    status: "investigating",
    reportedDate: "2024-01-15",
    description: "Gold purity test shows 13.5K instead of 14K",
    impact: "Production delay, potential rework required",
    inspector: "Sarah Johnson"
  },
  {
    id: "QI002",
    material: "Diamond 1ct Round",
    supplier: "Diamond Source Inc",
    issueType: "certification",
    severity: "medium",
    status: "resolved",
    reportedDate: "2024-01-12",
    resolvedDate: "2024-01-14",
    description: "Missing GIA certificate for diamond",
    impact: "Cannot proceed with production",
    resolution: "Supplier provided certificate, issue resolved",
    inspector: "Mike Chen"
  },
  {
    id: "QI003",
    material: "Sapphire 2ct Oval",
    supplier: "Gemstone World",
    issueType: "defect",
    severity: "critical",
    status: "open",
    reportedDate: "2024-01-16",
    description: "Visible crack in sapphire stone",
    impact: "Stone unusable, replacement needed",
    inspector: "Lisa Rodriguez"
  }
]

const sampleQualityMetrics: QualityMetrics = {
  totalInspections: 156,
  passedInspections: 142,
  failedInspections: 14,
  qualityScore: 91,
  openIssues: 3,
  resolvedIssues: 12,
  averageResolutionTime: 2.5,
  topIssues: [
    { type: "Certification Issues", count: 5, percentage: 35 },
    { type: "Contamination", count: 4, percentage: 28 },
    { type: "Defects", count: 3, percentage: 21 },
    { type: "Wrong Specifications", count: 2, percentage: 16 }
  ]
}

export function MaterialQualityControl() {
  const [issues, setIssues] = useState<QualityIssue[]>(sampleQualityIssues)
  const [metrics, setMetrics] = useState<QualityMetrics>(sampleQualityMetrics)

  const handleAddIssue = () => {
    toast({ title: "Add Issue", description: "Navigate to add new quality issue form." })
  }

  const handleResolveIssue = (id: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id 
        ? { ...issue, status: "resolved", resolvedDate: new Date().toISOString().split('T')[0] }
        : issue
    ))
    toast({ title: "Issue Resolved", description: `Quality issue ${id} has been marked as resolved.` })
  }

  const handleExportReport = () => {
    toast({ title: "Export Started", description: "Quality report export has been initiated." })
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-red-100 text-red-800">Open</Badge>
      case "investigating":
        return <Badge className="bg-amber-100 text-amber-800">Investigating</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case "defect":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "contamination":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "wrong_spec":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "damage":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "certification":
        return <Shield className="h-4 w-4 text-purple-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Control</h2>
          <p className="text-muted-foreground">Monitor material quality, track issues, and maintain standards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleExportReport} aria-label="Export Report">
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddIssue}>
            <Plus className="h-4 w-4 mr-2" />
            Add Issue
          </Button>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.qualityScore}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.passedInspections} of {metrics.totalInspections} passed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{metrics.openIssues}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.resolvedIssues} resolved this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResolutionTime} days</div>
            <p className="text-xs text-muted-foreground">
              Average time to resolve
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Inspections</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failedInspections}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.failedInspections / metrics.totalInspections) * 100)}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Alerts */}
      {metrics.openIssues > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Quality Issues Require Attention</AlertTitle>
          <AlertDescription>
            {metrics.openIssues} quality issues are currently open and require investigation or resolution.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Issues ({issues.length})</CardTitle>
              <CardDescription>Track and manage material quality issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getIssueTypeIcon(issue.issueType)}
                      <div>
                        <div className="font-medium">{issue.material}</div>
                        <div className="text-sm text-muted-foreground">
                          {issue.supplier} • {issue.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Reported by {issue.inspector} on {issue.reportedDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(issue.severity)}
                      {getStatusBadge(issue.status)}
                      {issue.status === "open" && (
                        <Button size="sm" onClick={() => handleResolveIssue(issue.id)}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Results</CardTitle>
                <CardDescription>Recent material inspection outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Pass Rate</span>
                      <span className="text-sm font-medium">{Math.round((metrics.passedInspections / metrics.totalInspections) * 100)}%</span>
                    </div>
                    <Progress value={(metrics.passedInspections / metrics.totalInspections) * 100} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{metrics.passedInspections}</div>
                      <div className="text-xs text-muted-foreground">Passed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{metrics.failedInspections}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Issue Types</CardTitle>
                <CardDescription>Most common quality issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topIssues.map((issue) => (
                    <div key={issue.type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{issue.type}</span>
                        <span className="text-sm">{issue.count} issues</span>
                      </div>
                      <Progress value={issue.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends</CardTitle>
              <CardDescription>Quality performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+5%</div>
                    <div className="text-sm text-muted-foreground">Quality Score Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">-2 days</div>
                    <div className="text-sm text-muted-foreground">Faster Resolution</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">-15%</div>
                    <div className="text-sm text-muted-foreground">Issue Reduction</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Recent Improvements</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Implemented stricter supplier quality requirements</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Enhanced inspection protocols for precious metals</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Improved certification verification process</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Reports</CardTitle>
                <CardDescription>Generate and view quality reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Monthly Quality Report
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Supplier Quality Analysis
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Issue Resolution Report
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Inspection Summary
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Standards</CardTitle>
                <CardDescription>Current quality standards and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Minimum Quality Score</span>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Max Resolution Time</span>
                    <span className="text-sm font-medium">5 days</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Target Pass Rate</span>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 