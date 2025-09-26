"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Printer, Share2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for supplier scorecard
const supplierList = [
  { id: "sup1", name: "GoldCraft Suppliers" },
  { id: "sup2", name: "Diamond District Gems" },
  { id: "sup3", name: "Precision Casting Co." },
  { id: "sup4", name: "Master Engravers Guild" },
  { id: "sup5", name: "Shine Plating Services" },
  { id: "sup6", name: "Elite Craftspeople" },
  { id: "sup7", name: "Swift Shipping Partners" },
  { id: "sup8", name: "Pearl Perfection" },
]

const performanceData = [
  { month: "Jan", score: 4.1 },
  { month: "Feb", score: 4.2 },
  { month: "Mar", score: 4.2 },
  { month: "Apr", score: 4.3 },
  { month: "May", score: 4.4 },
  { month: "Jun", score: 4.5 },
  { month: "Jul", score: 4.5 },
  { month: "Aug", score: 4.6 },
  { month: "Sep", score: 4.7 },
  { month: "Oct", score: 4.7 },
  { month: "Nov", score: 4.8 },
  { month: "Dec", score: 4.8 },
]

const radarData = [
  { metric: "Delivery", value: 4.8, fullMark: 5 },
  { metric: "Quality", value: 4.6, fullMark: 5 },
  { metric: "Price", value: 4.5, fullMark: 5 },
  { metric: "Response", value: 4.9, fullMark: 5 },
  { metric: "Resolution", value: 4.7, fullMark: 5 },
]

const kpiData = [
  { name: "On-Time Delivery", value: 97, target: 95, unit: "%" },
  { name: "Quality Acceptance", value: 99.2, target: 98, unit: "%" },
  { name: "Price Variance", value: -3.1, target: -2, unit: "%" },
  { name: "Response Time", value: 1.2, target: 4, unit: "hours", lowerIsBetter: true },
  { name: "Issue Resolution", value: 36, target: 48, unit: "hours", lowerIsBetter: true },
  { name: "Documentation Accuracy", value: 98.5, target: 99, unit: "%" },
]

interface SupplierScorecardProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function SupplierScorecard({ timeRange, selectedSuppliers, selectedCategories }: SupplierScorecardProps) {
  const [selectedSupplier, setSelectedSupplier] = useState("sup1")
  const [dateRange, setDateRange] = useState("year")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Scorecard</CardTitle>
        <CardDescription>Comprehensive performance evaluation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="w-full md:w-1/3">
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierList.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Print</span>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">GoldCraft Suppliers</div>
                <div className="text-sm text-muted-foreground">Metal Suppliers</div>
                <div className="mt-4 flex items-center">
                  <div className="text-4xl font-bold">4.7</div>
                  <div className="ml-2 text-sm text-muted-foreground">/ 5.0</div>
                  <Badge className="ml-auto bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>
                </div>
                <div className="mt-2 text-sm text-green-600">+0.3 from last year</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Performance Trend</div>
                <div className="h-[150px] mt-2">
                  <ChartContainer
                    config={{
                      score: {
                        label: "Performance Score",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis domain={[3.5, 5]} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Performance Radar</div>
                <div className="h-[150px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                      <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-medium mb-4">Key Performance Indicators</div>
              <div className="space-y-4">
                {kpiData.map((kpi, index) => {
                  const isGood = kpi.lowerIsBetter ? kpi.value <= kpi.target : kpi.value >= kpi.target

                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <div className="text-sm font-medium">{kpi.name}</div>
                        <div className="text-sm font-medium">
                          {kpi.value} {kpi.unit}
                          <span className="text-xs text-muted-foreground ml-1">
                            (Target: {kpi.target} {kpi.unit})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Progress value={(kpi.value / (kpi.target * 1.5)) * 100} className="h-2 flex-1" />
                        <Badge
                          variant="outline"
                          className={`ml-2 ${
                            isGood
                              ? "text-green-600 bg-green-50 border-green-200"
                              : "text-amber-600 bg-amber-50 border-amber-200"
                          }`}
                        >
                          {isGood ? "Good" : "Needs Improvement"}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="delivery">
            <TabsList className="mb-4">
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="delivery">
              <Card>
                <CardContent className="p-6">
                  <div className="text-lg font-medium mb-4">Delivery Performance Details</div>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="bg-muted p-4 rounded-md">
                        <div className="text-sm text-muted-foreground">On-Time Delivery</div>
                        <div className="text-2xl font-bold">97%</div>
                        <div className="text-xs text-green-600">+2% from last period</div>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="text-sm text-muted-foreground">Early Deliveries</div>
                        <div className="text-2xl font-bold">2%</div>
                        <div className="text-xs text-muted-foreground">No change</div>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="text-sm text-muted-foreground">Late Deliveries</div>
                        <div className="text-2xl font-bold">1%</div>
                        <div className="text-xs text-green-600">-2% from last period</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Recent Delivery Issues</div>
                      <div className="rounded-md border">
                        <div className="p-3 border-b">
                          <div className="font-medium">Order #12345 - 1 day late</div>
                          <div className="text-sm text-muted-foreground">
                            Shipping carrier delay due to weather conditions
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="font-medium">Order #12289 - 2 days late</div>
                          <div className="text-sm text-muted-foreground">Production delay due to material shortage</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality">
              <Card>
                <CardContent className="p-6">
                  <div className="text-lg font-medium mb-4">Quality Performance Details</div>
                  {/* Quality content would go here */}
                  <div className="text-muted-foreground">Quality metrics and details would be displayed here.</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="price">
              <Card>
                <CardContent className="p-6">
                  <div className="text-lg font-medium mb-4">Price Performance Details</div>
                  {/* Price content would go here */}
                  <div className="text-muted-foreground">Price metrics and details would be displayed here.</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication">
              <Card>
                <CardContent className="p-6">
                  <div className="text-lg font-medium mb-4">Communication Performance Details</div>
                  {/* Communication content would go here */}
                  <div className="text-muted-foreground">Communication metrics and details would be displayed here.</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance">
              <Card>
                <CardContent className="p-6">
                  <div className="text-lg font-medium mb-4">Compliance Performance Details</div>
                  {/* Compliance content would go here */}
                  <div className="text-muted-foreground">Compliance metrics and details would be displayed here.</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

export default SupplierScorecard;
