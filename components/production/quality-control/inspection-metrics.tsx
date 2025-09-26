"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  RefreshCw,
  Eye,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { toast } from "@/components/ui/use-toast"

// Sample data for demonstration
const defectsByCategory = [
  { name: "Metal Quality", value: 12 },
  { name: "Stone Setting", value: 18 },
  { name: "Finish Quality", value: 8 },
  { name: "Measurements", value: 5 },
  { name: "Functionality", value: 7 },
]

const defectsByItemType = [
  { name: "Rings", value: 15 },
  { name: "Necklaces", value: 12 },
  { name: "Bracelets", value: 8 },
  { name: "Earrings", value: 10 },
  { name: "Pendants", value: 5 },
]

const inspectionTrend = [
  { name: "Week 1", passed: 42, failed: 8 },
  { name: "Week 2", passed: 38, failed: 12 },
  { name: "Week 3", passed: 45, failed: 5 },
  { name: "Week 4", passed: 40, failed: 10 },
]

const inspectorPerformance = [
  { name: "Emma J.", inspections: 28, defectsFound: 12, approvalRate: 85 },
  { name: "Michael C.", inspections: 32, defectsFound: 18, approvalRate: 78 },
  { name: "David W.", inspections: 24, defectsFound: 8, approvalRate: 92 },
  { name: "Sarah M.", inspections: 30, defectsFound: 15, approvalRate: 80 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function InspectionMetrics() {
  const [timePeriod, setTimePeriod] = useState("30days")
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create comprehensive metrics report
      const reportContent = `
Quality Metrics Report - ${timePeriod}
Generated: ${new Date().toLocaleDateString()}

Summary:
- Total Inspections: 114
- Approval Rate: 84.2%
- Average Defects per Item: 1.8
- Rework Rate: 15.8%

Defects by Category:
${defectsByCategory.map(defect => `${defect.name}: ${defect.value} defects`).join('\n')}

Defects by Item Type:
${defectsByItemType.map(defect => `${defect.name}: ${defect.value} defects`).join('\n')}

Inspector Performance:
${inspectorPerformance.map(inspector => `${inspector.name}: ${inspector.inspections} inspections, ${inspector.approvalRate}% approval rate`).join('\n')}

Weekly Trends:
${inspectionTrend.map(week => `${week.name}: ${week.passed} passed, ${week.failed} failed`).join('\n')}
      `.trim()

      // Download file
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quality-metrics-${timePeriod}-${new Date().toISOString().split('T')[0]}.txt`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Quality metrics report has been downloaded successfully."
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export metrics report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Data Refreshed",
        description: "Quality metrics have been updated with latest data."
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh metrics data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewDefectDetails = (category: string) => {
    toast({
      title: "View Defect Details",
      description: `Opening detailed analysis for ${category} defects...`
    })
    // In a real app, this would navigate to defect details
  }

  const handleViewInspectorDetails = (inspectorName: string) => {
    toast({
      title: "View Inspector Details",
      description: `Opening detailed performance report for ${inspectorName}...`
    })
    // In a real app, this would navigate to inspector details
  }

  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period)
    toast({
      title: "Time Period Changed",
      description: `Metrics updated for ${period} time period.`
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quality Metrics</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of quality control performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
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
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">114</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">+8% from last period</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.2%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">+2.1% from last period</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Defects per Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.8</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">-0.3 from last period</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rework Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.8%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">-2.1% from last period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="defects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="defects">Defect Analysis</TabsTrigger>
          <TabsTrigger value="trends">Inspection Trends</TabsTrigger>
          <TabsTrigger value="inspectors">Inspector Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="defects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Defects by Category</CardTitle>
                <CardDescription>Distribution of quality issues by checkpoint category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={defectsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {defectsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {defectsByCategory.map((defect) => (
                    <div key={defect.name} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[defectsByCategory.findIndex(d => d.name === defect.name) % COLORS.length] }}
                        />
                        <span className="font-medium">{defect.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{defect.value} defects</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDefectDetails(defect.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defects by Item Type</CardTitle>
                <CardDescription>Distribution of quality issues by jewelry type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={defectsByItemType}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {defectsByItemType.map((defect) => (
                    <div key={defect.name} className="flex items-center justify-between p-2 rounded-lg border">
                      <span className="font-medium">{defect.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{defect.value} defects</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDefectDetails(defect.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Results Over Time</CardTitle>
              <CardDescription>Weekly trend of passed vs. failed inspections</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inspectionTrend}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passed" stackId="a" fill="#4ade80" />
                  <Bar dataKey="failed" stackId="a" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspector Performance</CardTitle>
              <CardDescription>Individual inspector metrics and performance comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspectorPerformance.map((inspector) => (
                  <div key={inspector.name} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h3 className="font-medium">{inspector.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {inspector.inspections} inspections, {inspector.defectsFound} defects found
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{inspector.approvalRate}%</p>
                        <p className="text-xs text-muted-foreground">Approval Rate</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {inspector.approvalRate >= 90 ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Target className="h-3 w-3 mr-1" />
                            Excellent
                          </Badge>
                        ) : inspector.approvalRate >= 80 ? (
                          <Badge variant="outline" className="text-blue-600">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Good
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Needs Improvement
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewInspectorDetails(inspector.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Import the Table components to avoid errors
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
