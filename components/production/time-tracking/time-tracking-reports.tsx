"use client"

import * as React from "react"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { CalendarIcon, Download, Filter, Printer } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for reports
const workOrderTimeData = [
  { workOrder: "WO-1234", description: "Diamond Engagement Ring", hours: 12.5 },
  { workOrder: "WO-1235", description: "Gold Wedding Band", hours: 8.2 },
  { workOrder: "WO-1236", description: "Pearl Necklace", hours: 6.7 },
  { workOrder: "WO-1237", description: "Sapphire Earrings", hours: 5.3 },
  { workOrder: "WO-1238", description: "Emerald Bracelet", hours: 9.1 },
]

const stageTimeData = [
  { stage: "Design/CAD", hours: 10.5 },
  { stage: "Wax/3D Print", hours: 8.2 },
  { stage: "Casting", hours: 6.7 },
  { stage: "Stone Setting", hours: 15.3 },
  { stage: "Polishing", hours: 9.1 },
  { stage: "QC", hours: 4.2 },
]

const craftspersonData = [
  { name: "Michael Chen", hours: 38.5, efficiency: 92 },
  { name: "Sophia Rodriguez", hours: 35.2, efficiency: 88 },
  { name: "David Kim", hours: 40.0, efficiency: 95 },
  { name: "Emma Johnson", hours: 32.5, efficiency: 85 },
  { name: "James Wilson", hours: 36.8, efficiency: 90 },
]

const dailyTimeData = eachDayOfInterval({
  start: subDays(new Date(), 6),
  end: new Date(),
}).map((date) => ({
  date: format(date, "MMM dd"),
  productive: 5 + Math.random() * 3,
  break: 0.5 + Math.random() * 0.5,
}))

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function TimeTrackingReports() {
  const [activeTab, setActiveTab] = React.useState("workOrders")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  })
  const [selectedCraftsperson, setSelectedCraftsperson] = React.useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle>Time Tracking Reports</CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>Analyze time tracking data and productivity metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="workOrders" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workOrders">Work Orders</TabsTrigger>
            <TabsTrigger value="stages">Production Stages</TabsTrigger>
            <TabsTrigger value="craftspeople">Craftspeople</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Work Orders Tab */}
          <TabsContent value="workOrders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Time by Work Order</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="h-[400px] w-full p-4">
                <ChartContainer
                  config={{
                    hours: {
                      label: "Hours",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workOrderTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <defs>
                        <linearGradient id="workOrderHoursGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="workOrder" angle={-45} textAnchor="end" height={70} />
                      <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="hours" name="Hours" fill="url(#workOrderHoursGradient)" radius={[8, 8, 0, 0]} barSize={32}>
                        <LabelList dataKey="hours" position="top" fill="#6366f1" fontSize={14} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Work Order</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Hours</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrderTimeData.map((item, index) => {
                      const totalHours = workOrderTimeData.reduce((sum, item) => sum + item.hours, 0)
                      const percentage = ((item.hours / totalHours) * 100).toFixed(1)

                      return (
                        <tr key={item.workOrder} className="border-b">
                          <td className="px-4 py-3 text-sm font-medium">{item.workOrder}</td>
                          <td className="px-4 py-3 text-sm">{item.description}</td>
                          <td className="px-4 py-3 text-right text-sm">{item.hours.toFixed(1)}</td>
                          <td className="px-4 py-3 text-right text-sm">{percentage}%</td>
                        </tr>
                      )
                    })}
                    <tr className="bg-muted/50 font-medium">
                      <td className="px-4 py-3 text-sm" colSpan={2}>
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {workOrderTimeData.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Production Stages Tab */}
          <TabsContent value="stages" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Time by Production Stage</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-md border p-4">
                <h4 className="mb-4 text-center text-sm font-medium">Distribution of Time by Stage</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageTimeData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="hours"
                        nameKey="stage"
                      >
                        {stageTimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} hours`, "Time Spent"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="mb-4 text-center text-sm font-medium">Hours by Production Stage</h4>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      hours: {
                        label: "Hours",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stageTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="stageHoursGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#f59e42" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="hours" name="Hours" fill="url(#stageHoursGradient)" radius={[8, 8, 0, 0]} barSize={32}>
                          <LabelList dataKey="hours" position="top" fill="#06b6d4" fontSize={14} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Production Stage</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Hours</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">% of Total</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Avg. Time per Item</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stageTimeData.map((item) => {
                      const totalHours = stageTimeData.reduce((sum, item) => sum + item.hours, 0)
                      const percentage = ((item.hours / totalHours) * 100).toFixed(1)
                      // Mock data for average time per item
                      const avgTimePerItem = (item.hours / (Math.random() * 3 + 2)).toFixed(1)

                      return (
                        <tr key={item.stage} className="border-b">
                          <td className="px-4 py-3 text-sm font-medium">{item.stage}</td>
                          <td className="px-4 py-3 text-right text-sm">{item.hours.toFixed(1)}</td>
                          <td className="px-4 py-3 text-right text-sm">{percentage}%</td>
                          <td className="px-4 py-3 text-right text-sm">{avgTimePerItem}h</td>
                        </tr>
                      )
                    })}
                    <tr className="bg-muted/50 font-medium">
                      <td className="px-4 py-3 text-sm">Total</td>
                      <td className="px-4 py-3 text-right text-sm">
                        {stageTimeData.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">100%</td>
                      <td className="px-4 py-3 text-right text-sm">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Craftspeople Tab */}
          <TabsContent value="craftspeople" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Craftsperson Productivity</h3>
              <div className="flex gap-2">
                <Select
                  value={selectedCraftsperson || "all"}
                  onValueChange={(value) => setSelectedCraftsperson(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select craftsperson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Craftspeople</SelectItem>
                    {craftspersonData.map((person) => (
                      <SelectItem key={person.name} value={person.name}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-md border p-4">
                <h4 className="mb-4 text-center text-sm font-medium">Hours Worked by Craftsperson</h4>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      hours: {
                        label: "Hours",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={craftspersonData.filter(
                          (person) => !selectedCraftsperson || person.name === selectedCraftsperson,
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="craftsHoursGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="hours" name="Hours" fill="url(#craftsHoursGradient)" radius={[8, 8, 0, 0]} barSize={32}>
                          <LabelList dataKey="hours" position="top" fill="#10b981" fontSize={14} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="mb-4 text-center text-sm font-medium">Efficiency Rating by Craftsperson</h4>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      efficiency: {
                        label: "Efficiency",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={craftspersonData.filter(
                          (person) => !selectedCraftsperson || person.name === selectedCraftsperson,
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="craftsEffGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e42" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="efficiency" name="Efficiency %" fill="url(#craftsEffGradient)" radius={[8, 8, 0, 0]} barSize={32}>
                          <LabelList dataKey="efficiency" position="top" fill="#f59e42" fontSize={14} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Craftsperson</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Hours Worked</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Efficiency Rating</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Tasks Completed</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Avg. Time per Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {craftspersonData
                      .filter((person) => !selectedCraftsperson || person.name === selectedCraftsperson)
                      .map((person) => {
                        // Mock data for tasks completed and average time
                        const tasksCompleted = Math.floor(Math.random() * 10) + 5
                        const avgTimePerTask = (person.hours / tasksCompleted).toFixed(1)

                        return (
                          <tr key={person.name} className="border-b">
                            <td className="px-4 py-3 text-sm font-medium">{person.name}</td>
                            <td className="px-4 py-3 text-right text-sm">{person.hours.toFixed(1)}</td>
                            <td className="px-4 py-3 text-right text-sm">
                              <Badge
                                variant="outline"
                                className={
                                  person.efficiency >= 90
                                    ? "bg-emerald-50 text-emerald-700"
                                    : person.efficiency >= 80
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                }
                              >
                                {person.efficiency}%
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">{tasksCompleted}</td>
                            <td className="px-4 py-3 text-right text-sm">{avgTimePerTask}h</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Time Tracking Trends</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <h4 className="mb-4 text-center text-sm font-medium">Daily Time Distribution</h4>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    productive: {
                      label: "Productive Hours",
                      color: "hsl(var(--chart-1))",
                    },
                    break: {
                      label: "Break Hours",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="productiveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                        </linearGradient>
                        <linearGradient id="breakGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e42" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#f59e42" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="productive" name="Productive Hours" stackId="a" fill="url(#productiveGradient)" radius={[8, 8, 0, 0]} barSize={32}>
                        <LabelList dataKey="productive" position="top" fill="#10b981" fontSize={14} formatter={(value: number) => value.toFixed(1)} />
                      </Bar>
                      <Bar dataKey="break" name="Break Hours" stackId="a" fill="url(#breakGradient)" radius={[8, 8, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-md border p-4">
                <h4 className="mb-2 text-sm font-medium">Productivity Insights</h4>
                <div className="space-y-4">
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Most Productive Day</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        Wednesday
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Average of 7.2 productive hours on Wednesdays</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Most Efficient Stage</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        Polishing
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">15% faster than industry average</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bottleneck Stage</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        Stone Setting
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Takes 20% longer than expected</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="mb-2 text-sm font-medium">Efficiency Recommendations</h4>
                <div className="space-y-4">
                  <div className="rounded-md bg-blue-50 p-3 text-blue-800">
                    <p className="text-sm font-medium">Optimize Stone Setting Process</p>
                    <p className="mt-1 text-xs">
                      Consider additional training or tools for the stone setting stage to reduce time spent.
                    </p>
                  </div>
                  <div className="rounded-md bg-blue-50 p-3 text-blue-800">
                    <p className="text-sm font-medium">Reduce Break Time on Mondays</p>
                    <p className="mt-1 text-xs">
                      Monday break times are 25% higher than other days. Consider adjusting work schedules.
                    </p>
                  </div>
                  <div className="rounded-md bg-blue-50 p-3 text-blue-800">
                    <p className="text-sm font-medium">Leverage Top Performers</p>
                    <p className="mt-1 text-xs">
                      David Kim and Michael Chen have the highest efficiency ratings. Consider having them mentor other
                      team members.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
