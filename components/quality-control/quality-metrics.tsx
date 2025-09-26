"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, Filter } from "lucide-react"

export function QualityMetrics() {
  const [timeRange, setTimeRange] = useState("30days")
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for quality metrics
  const passFailData = [
    { name: "Week 1", pass: 92, fail: 8 },
    { name: "Week 2", pass: 94, fail: 6 },
    { name: "Week 3", pass: 91, fail: 9 },
    { name: "Week 4", pass: 95, fail: 5 },
  ]

  const defectCategoryData = [
    { name: "Scratches", value: 35 },
    { name: "Finish Issues", value: 25 },
    { name: "Alignment", value: 15 },
    { name: "Structural", value: 10 },
    { name: "Missing Parts", value: 8 },
    { name: "Other", value: 7 },
  ]

  const defectTrendData = [
    { name: "Jan", critical: 2, major: 5, minor: 12 },
    { name: "Feb", critical: 1, major: 6, minor: 10 },
    { name: "Mar", critical: 3, major: 4, minor: 14 },
    { name: "Apr", critical: 2, major: 7, minor: 11 },
    { name: "May", critical: 1, major: 5, minor: 9 },
    { name: "Jun", critical: 0, major: 4, minor: 8 },
    { name: "Jul", critical: 1, major: 3, minor: 10 },
    { name: "Aug", critical: 2, major: 5, minor: 12 },
    { name: "Sep", critical: 3, major: 8, minor: 15 },
    { name: "Oct", critical: 2, major: 6, minor: 13 },
    { name: "Nov", critical: 1, major: 4, minor: 11 },
    { name: "Dec", critical: 2, major: 5, minor: 10 },
  ]

  const partnerPerformanceData = [
    { name: "GoldCraft Suppliers", passRate: 96 },
    { name: "Diamond District Gems", passRate: 94 },
    { name: "Precision Casting Co.", passRate: 91 },
    { name: "Master Engravers Guild", passRate: 89 },
    { name: "Elite Craftspeople", passRate: 93 },
    { name: "Pearl Perfection", passRate: 92 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="defects">Defect Analysis</TabsTrigger>
            <TabsTrigger value="partners">Partner Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
            <Filter className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TabsContent value="overview" className="mt-0 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Overall Pass Rate</CardTitle>
              <CardDescription>Average across all inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">93.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% from previous period</p>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={passFailData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pass" stroke="#10b981" name="Pass Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Defect Categories</CardTitle>
              <CardDescription>Distribution by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={defectCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {defectCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Defect Severity</CardTitle>
              <CardDescription>Breakdown by impact level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defectTrendData.slice(-4)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="critical" fill="#ef4444" name="Critical" />
                    <Bar dataKey="major" fill="#f59e0b" name="Major" />
                    <Bar dataKey="minor" fill="#eab308" name="Minor" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Partner Performance</CardTitle>
            <CardDescription>Quality metrics by partner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partnerPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[80, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="defects" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Defect Analysis</CardTitle>
            <CardDescription>Detailed breakdown of quality issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                  <Bar dataKey="major" stackId="a" fill="#f59e0b" name="Major" />
                  <Bar dataKey="minor" stackId="a" fill="#eab308" name="Minor" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="partners" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Partner Performance</CardTitle>
            <CardDescription>Quality metrics by partner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partnerPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trends" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Trends</CardTitle>
            <CardDescription>Long-term quality performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={defectTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical Defects" />
                  <Line type="monotone" dataKey="major" stroke="#f59e0b" name="Major Defects" />
                  <Line type="monotone" dataKey="minor" stroke="#eab308" name="Minor Defects" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  )
}
