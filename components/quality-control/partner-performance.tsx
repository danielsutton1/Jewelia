"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, Filter, ArrowUp, ArrowDown, Minus, AlertTriangle } from "lucide-react"

export function PartnerPerformance() {
  const [timeRange, setTimeRange] = useState("30days")
  const [activeTab, setActiveTab] = useState("rankings")

  // Mock data for partner performance
  const partnerRankings = [
    {
      id: "partner-1",
      name: "GoldCraft Suppliers",
      passRate: 96.2,
      trend: "up",
      inspections: 125,
      criticalDefects: 1,
      majorDefects: 3,
      minorDefects: 8,
      avgResponseTime: 1.2,
    },
    {
      id: "partner-2",
      name: "Diamond District Gems",
      passRate: 94.5,
      trend: "up",
      inspections: 110,
      criticalDefects: 2,
      majorDefects: 4,
      minorDefects: 10,
      avgResponseTime: 1.5,
    },
    {
      id: "partner-3",
      name: "Precision Casting Co.",
      passRate: 91.8,
      trend: "down",
      inspections: 98,
      criticalDefects: 3,
      majorDefects: 5,
      minorDefects: 12,
      avgResponseTime: 2.1,
    },
    {
      id: "partner-4",
      name: "Master Engravers Guild",
      passRate: 89.3,
      trend: "down",
      inspections: 85,
      criticalDefects: 4,
      majorDefects: 6,
      minorDefects: 15,
      avgResponseTime: 2.4,
    },
    {
      id: "partner-5",
      name: "Elite Craftspeople",
      passRate: 93.7,
      trend: "neutral",
      inspections: 95,
      criticalDefects: 2,
      majorDefects: 4,
      minorDefects: 9,
      avgResponseTime: 1.8,
    },
    {
      id: "partner-6",
      name: "Pearl Perfection",
      passRate: 92.1,
      trend: "up",
      inspections: 88,
      criticalDefects: 2,
      majorDefects: 5,
      minorDefects: 11,
      avgResponseTime: 1.9,
    },
  ]

  const partnerTrendData = [
    { month: "Jan", "GoldCraft Suppliers": 95.1, "Diamond District Gems": 93.2, "Precision Casting Co.": 90.5 },
    { month: "Feb", "GoldCraft Suppliers": 94.8, "Diamond District Gems": 93.5, "Precision Casting Co.": 91.2 },
    { month: "Mar", "GoldCraft Suppliers": 95.3, "Diamond District Gems": 93.8, "Precision Casting Co.": 90.8 },
    { month: "Apr", "GoldCraft Suppliers": 95.5, "Diamond District Gems": 94.0, "Precision Casting Co.": 91.5 },
    { month: "May", "GoldCraft Suppliers": 95.8, "Diamond District Gems": 94.2, "Precision Casting Co.": 91.0 },
    { month: "Jun", "GoldCraft Suppliers": 96.0, "Diamond District Gems": 94.5, "Precision Casting Co.": 91.8 },
  ]

  const defectCategoryByPartner = [
    {
      name: "Scratches",
      "GoldCraft Suppliers": 3,
      "Diamond District Gems": 4,
      "Precision Casting Co.": 6,
      "Master Engravers Guild": 5,
    },
    {
      name: "Finish Issues",
      "GoldCraft Suppliers": 2,
      "Diamond District Gems": 3,
      "Precision Casting Co.": 5,
      "Master Engravers Guild": 7,
    },
    {
      name: "Alignment",
      "GoldCraft Suppliers": 1,
      "Diamond District Gems": 2,
      "Precision Casting Co.": 3,
      "Master Engravers Guild": 4,
    },
    {
      name: "Structural",
      "GoldCraft Suppliers": 1,
      "Diamond District Gems": 1,
      "Precision Casting Co.": 2,
      "Master Engravers Guild": 3,
    },
    {
      name: "Missing Parts",
      "GoldCraft Suppliers": 0,
      "Diamond District Gems": 1,
      "Precision Casting Co.": 1,
      "Master Engravers Guild": 2,
    },
  ]

  // Helper function to render trend indicator
  const renderTrend = (trend: string) => {
    switch (trend) {
      case "up":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            Up
          </Badge>
        )
      case "down":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <ArrowDown className="h-3 w-3" />
            Down
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
            <Minus className="h-3 w-3" />
            Stable
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs defaultValue="rankings" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rankings">Partner Rankings</TabsTrigger>
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="defects">Defect Analysis</TabsTrigger>
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

      <TabsContent value="rankings" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Partner Quality Rankings</CardTitle>
            <CardDescription>Performance metrics for all partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Inspections</TableHead>
                    <TableHead>Critical Defects</TableHead>
                    <TableHead>Major Defects</TableHead>
                    <TableHead>Minor Defects</TableHead>
                    <TableHead>Avg. Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnerRankings.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={partner.passRate} className="h-2 w-16" />
                          <span>{partner.passRate.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderTrend(partner.trend)}</TableCell>
                      <TableCell>{partner.inspections}</TableCell>
                      <TableCell>
                        <Badge variant={partner.criticalDefects > 0 ? "destructive" : "outline"}>
                          {partner.criticalDefects}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {partner.majorDefects}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {partner.minorDefects}
                        </Badge>
                      </TableCell>
                      <TableCell>{partner.avgResponseTime} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Partners with highest quality scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerRankings
                  .sort((a, b) => b.passRate - a.passRate)
                  .slice(0, 3)
                  .map((partner, index) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-muted-foreground">{partner.inspections} inspections</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{partner.passRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Pass Rate</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Needs Improvement</CardTitle>
              <CardDescription>Partners with quality concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerRankings
                  .sort((a, b) => a.passRate - b.passRate)
                  .slice(0, 3)
                  .map((partner, index) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {partner.criticalDefects + partner.majorDefects} significant defects
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{partner.passRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Pass Rate</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="trends" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Partner Performance Trends</CardTitle>
            <CardDescription>Quality metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={partnerTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[85, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="GoldCraft Suppliers" stroke="#10b981" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Diamond District Gems" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="Precision Casting Co." stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="defects" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Defect Categories by Partner</CardTitle>
            <CardDescription>Breakdown of quality issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectCategoryByPartner}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="GoldCraft Suppliers" fill="#10b981" />
                  <Bar dataKey="Diamond District Gems" fill="#3b82f6" />
                  <Bar dataKey="Precision Casting Co." fill="#f59e0b" />
                  <Bar dataKey="Master Engravers Guild" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  )
}
