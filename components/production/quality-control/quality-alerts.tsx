"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Bell,
  Filter,
  Search,
  Eye,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Zap,
  RefreshCw,
  Archive,
  Settings,
  Download
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Mock data for quality alerts
const qualityAlerts = [
  {
    id: 1,
    type: "critical",
    title: "High Failure Rate in Stone Setting",
    description: "Stone setting failure rate has increased to 15% this week, exceeding the 10% threshold.",
    category: "stone-setting",
    severity: "critical",
    count: 5,
    inspector: "Sarah Johnson",
    date: "2024-01-15T10:30:00Z",
    status: "active",
    actions: ["investigate", "retrain", "escalate"]
  },
  {
    id: 2,
    type: "warning",
    title: "Inspection Backlog Growing",
    description: "Pending inspections have increased by 25% in the last 24 hours.",
    category: "backlog",
    severity: "warning",
    count: 12,
    inspector: "System",
    date: "2024-01-15T09:15:00Z",
    status: "active",
    actions: ["assign", "prioritize", "notify"]
  },
  {
    id: 3,
    type: "info",
    title: "New Quality Standards Implemented",
    description: "Updated stone setting standards have been applied to all new inspections.",
    category: "standards",
    severity: "info",
    count: 1,
    inspector: "Quality Manager",
    date: "2024-01-15T08:00:00Z",
    status: "resolved",
    actions: ["acknowledge"]
  },
  {
    id: 4,
    type: "warning",
    title: "Inspector Performance Decline",
    description: "Mike Chen's pass rate has dropped to 85% this week, below the 90% threshold.",
    category: "performance",
    severity: "warning",
    count: 1,
    inspector: "Mike Chen",
    date: "2024-01-14T16:45:00Z",
    status: "active",
    actions: ["review", "support", "retrain"]
  },
  {
    id: 5,
    type: "critical",
    title: "Customer Complaint Received",
    description: "Customer reported loose stone in delivered ring. Immediate investigation required.",
    category: "customer",
    severity: "critical",
    count: 1,
    inspector: "Customer Service",
    date: "2024-01-14T14:20:00Z",
    status: "active",
    actions: ["investigate", "recall", "compensate"]
  }
]

const alertCategories = [
  { id: "all", name: "All Alerts", count: qualityAlerts.length },
  { id: "critical", name: "Critical", count: qualityAlerts.filter(a => a.severity === "critical").length },
  { id: "warning", name: "Warnings", count: qualityAlerts.filter(a => a.severity === "warning").length },
  { id: "info", name: "Information", count: qualityAlerts.filter(a => a.severity === "info").length },
  { id: "resolved", name: "Resolved", count: qualityAlerts.filter(a => a.status === "resolved").length }
]

export function QualityAlerts() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [selectedSeverity, setSelectedSeverity] = React.useState("all")
  const [activeTab, setActiveTab] = React.useState("active")
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)

  const filteredAlerts = qualityAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || alert.category === selectedCategory
    const matchesSeverity = selectedSeverity === "all" || alert.severity === selectedSeverity
    const matchesStatus = activeTab === "all" || alert.status === activeTab

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200"
      case "warning": return "bg-amber-100 text-amber-800 border-amber-200"
      case "info": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4" />
      case "warning": return <AlertTriangle className="h-4 w-4" />
      case "info": return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const handleAction = (alertId: number, action: string) => {
    toast({
      title: "Action Taken",
      description: `${action} action applied to alert #${alertId}`
    })
    
    // In a real app, this would trigger the specific action
    switch (action) {
      case "investigate":
        // Navigate to investigation page
        break
      case "retrain":
        // Open training module
        break
      case "escalate":
        // Send escalation notification
        break
      case "assign":
        // Open assignment dialog
        break
      case "prioritize":
        // Update priority
        break
      case "notify":
        // Send notification
        break
      case "acknowledge":
        // Mark as acknowledged
        break
      case "review":
        // Open review interface
        break
      case "support":
        // Open support ticket
        break
      case "recall":
        // Initiate recall process
        break
      case "compensate":
        // Open compensation form
        break
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Alerts Refreshed",
        description: "Quality alerts have been updated with latest data."
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh alerts. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create CSV content
      const csvContent = [
        "Alert ID,Title,Category,Severity,Status,Inspector,Date,Actions",
        ...filteredAlerts.map(alert => 
          `${alert.id},"${alert.title}",${alert.category},${alert.severity},${alert.status},${alert.inspector},${new Date(alert.date).toLocaleDateString()},${alert.actions.join(';')}`
        )
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quality-alerts-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: `Exported ${filteredAlerts.length} quality alerts.`
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export alerts. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleViewAlertDetails = (alertId: number) => {
    toast({
      title: "View Alert Details",
      description: `Opening detailed view for alert #${alertId}...`
    })
    // In a real app, this would navigate to alert details
  }

  const handleArchiveAlert = (alertId: number) => {
    toast({
      title: "Alert Archived",
      description: `Alert #${alertId} has been archived.`
    })
    // In a real app, this would archive the alert
  }

  const handleConfigureAlerts = () => {
    toast({
      title: "Configure Alerts",
      description: "Opening alert configuration settings..."
    })
    // In a real app, this would open alert settings
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Alerts</h2>
          <p className="text-muted-foreground">
            Monitor and respond to quality control issues in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleConfigureAlerts}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{qualityAlerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {qualityAlerts.filter(a => a.severity === "critical").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-amber-600">
                  {qualityAlerts.filter(a => a.severity === "warning").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {qualityAlerts.filter(a => a.status === "resolved").length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {alertCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Information</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Alerts</CardTitle>
          <CardDescription>
            Showing {filteredAlerts.length} of {qualityAlerts.length} alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeverityIcon(alert.severity)}
                      <h3 className="font-semibold">{alert.title}</h3>
                      <Badge variant={alert.status === "resolved" ? "default" : "outline"}>
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Category: {alert.category}</span>
                      <span>Inspector: {alert.inspector}</span>
                      <span>Date: {new Date(alert.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewAlertDetails(alert.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {alert.status === "active" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleArchiveAlert(alert.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {alert.actions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(alert.id, action)}
                    >
                      {action === "investigate" && <Eye className="h-3 w-3 mr-1" />}
                      {action === "retrain" && <Users className="h-3 w-3 mr-1" />}
                      {action === "escalate" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {action === "assign" && <Target className="h-3 w-3 mr-1" />}
                      {action === "prioritize" && <TrendingUp className="h-3 w-3 mr-1" />}
                      {action === "notify" && <Bell className="h-3 w-3 mr-1" />}
                      {action === "acknowledge" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {action === "review" && <Eye className="h-3 w-3 mr-1" />}
                      {action === "support" && <MessageSquare className="h-3 w-3 mr-1" />}
                      {action === "recall" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {action === "compensate" && <Zap className="h-3 w-3 mr-1" />}
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 