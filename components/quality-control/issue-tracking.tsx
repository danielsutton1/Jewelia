"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, Plus, AlertTriangle, CheckCircle, Clock, MessageSquare } from "lucide-react"

export function IssueTracking() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("issues")

  // Mock data for quality issues
  const issues = [
    {
      id: "ISS-1234",
      partner: "Precision Casting Co.",
      issue: "Surface porosity in casting",
      severity: "major",
      status: "open",
      date: "2023-11-15",
      assignedTo: "Alex Johnson",
      dueDate: "2023-11-22",
      progress: 0,
    },
    {
      id: "ISS-1233",
      partner: "Master Engravers Guild",
      issue: "Inconsistent engraving depth",
      severity: "minor",
      status: "in-progress",
      date: "2023-11-14",
      assignedTo: "Sarah Williams",
      dueDate: "2023-11-21",
      progress: 35,
    },
    {
      id: "ISS-1232",
      partner: "Diamond District Gems",
      issue: "Stone color variation",
      severity: "minor",
      status: "in-progress",
      date: "2023-11-13",
      assignedTo: "Michael Brown",
      dueDate: "2023-11-20",
      progress: 65,
    },
    {
      id: "ISS-1231",
      partner: "GoldCraft Suppliers",
      issue: "Clasp alignment problem",
      severity: "major",
      status: "resolved",
      date: "2023-11-12",
      assignedTo: "Alex Johnson",
      dueDate: "2023-11-19",
      progress: 100,
    },
    {
      id: "ISS-1230",
      partner: "Elite Craftspeople",
      issue: "Missing hallmark",
      severity: "minor",
      status: "resolved",
      date: "2023-11-11",
      assignedTo: "Sarah Williams",
      dueDate: "2023-11-18",
      progress: 100,
    },
    {
      id: "ISS-1229",
      partner: "Pearl Perfection",
      issue: "Irregular pearl shape",
      severity: "critical",
      status: "resolved",
      date: "2023-11-10",
      assignedTo: "Michael Brown",
      dueDate: "2023-11-17",
      progress: 100,
    },
  ]

  // Mock data for corrective actions
  const correctiveActions = [
    {
      id: "CA-567",
      issueId: "ISS-1234",
      partner: "Precision Casting Co.",
      action: "Review casting process parameters",
      status: "pending",
      assignedTo: "Alex Johnson",
      dueDate: "2023-11-25",
      progress: 0,
    },
    {
      id: "CA-566",
      issueId: "ISS-1233",
      partner: "Master Engravers Guild",
      action: "Calibrate engraving equipment",
      status: "in-progress",
      assignedTo: "Sarah Williams",
      dueDate: "2023-11-24",
      progress: 50,
    },
    {
      id: "CA-565",
      issueId: "ISS-1232",
      partner: "Diamond District Gems",
      action: "Implement additional color verification step",
      status: "in-progress",
      assignedTo: "Michael Brown",
      dueDate: "2023-11-23",
      progress: 75,
    },
    {
      id: "CA-564",
      issueId: "ISS-1231",
      partner: "GoldCraft Suppliers",
      action: "Adjust clasp manufacturing process",
      status: "completed",
      assignedTo: "Alex Johnson",
      dueDate: "2023-11-22",
      progress: 100,
    },
    {
      id: "CA-563",
      issueId: "ISS-1230",
      partner: "Elite Craftspeople",
      action: "Add hallmark verification to QC checklist",
      status: "completed",
      assignedTo: "Sarah Williams",
      dueDate: "2023-11-21",
      progress: 100,
    },
  ]

  // Filter issues based on status and search query
  const filteredIssues = issues.filter((issue) => {
    const matchesFilter = filter === "all" || issue.status === filter
    const matchesSearch =
      searchQuery === "" ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.issue.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Open
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "resolved":
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> {status === "resolved" ? "Resolved" : "Completed"}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      default:
        return null
    }
  }

  // Helper function to render severity badge
  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>
      case "major":
        return <Badge className="bg-amber-500">Major</Badge>
      case "minor":
        return <Badge className="bg-yellow-500">Minor</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs defaultValue="issues" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues">Quality Issues</TabsTrigger>
            <TabsTrigger value="actions">Corrective Actions</TabsTrigger>
            <TabsTrigger value="process">Process Improvements</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="issues" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Quality Issues</CardTitle>
                <CardDescription>Track and manage quality problems</CardDescription>
              </div>
              <Button className="gap-1 self-start min-h-[44px]">
                <Plus className="h-4 w-4" />
                New Issue
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Issues</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.id}</TableCell>
                      <TableCell>{issue.partner}</TableCell>
                      <TableCell>{issue.issue}</TableCell>
                      <TableCell>{renderSeverityBadge(issue.severity)}</TableCell>
                      <TableCell>{renderStatusBadge(issue.status)}</TableCell>
                      <TableCell>{issue.assignedTo}</TableCell>
                      <TableCell>{issue.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={issue.progress} className="h-2 w-16" />
                          <span className="text-xs">{issue.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <MessageSquare className="h-4 w-4" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="actions" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Corrective Actions</CardTitle>
                <CardDescription>Track actions to address quality issues</CardDescription>
              </div>
              <Button className="gap-1 self-start min-h-[44px]">
                <Plus className="h-4 w-4" />
                New Action
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              Corrective Actions Content Coming Soon
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  )
}
