"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useState } from "react"

// Mock data for usage graphs
const dailyUsageData = [
  { date: "05/09", calls: 12500 },
  { date: "05/10", calls: 14200 },
  { date: "05/11", calls: 15800 },
  { date: "05/12", calls: 16500 },
  { date: "05/13", calls: 17200 },
  { date: "05/14", calls: 15900 },
  { date: "05/15", calls: 16800 },
]

const endpointUsageData = [
  { name: "Products", value: 35 },
  { name: "Orders", value: 25 },
  { name: "Customers", value: 20 },
  { name: "Inventory", value: 15 },
  { name: "Auth", value: 5 },
]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

const hourlyUsageData = [
  { hour: "00:00", calls: 320 },
  { hour: "02:00", calls: 280 },
  { hour: "04:00", calls: 250 },
  { hour: "06:00", calls: 310 },
  { hour: "08:00", calls: 620 },
  { hour: "10:00", calls: 950 },
  { hour: "12:00", calls: 1250 },
  { hour: "14:00", calls: 1150 },
  { hour: "16:00", calls: 980 },
  { hour: "18:00", calls: 750 },
  { hour: "20:00", calls: 540 },
  { hour: "22:00", calls: 420 },
]

const userUsageData = [
  { name: "Mobile App", value: 45 },
  { name: "Website", value: 30 },
  { name: "Partner APIs", value: 15 },
  { name: "Internal Tools", value: 10 },
]

export function UsageGraphs() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">API Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">Detailed usage statistics and trends</p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">By Endpoint</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Usage</TabsTrigger>
          <TabsTrigger value="clients">By Client</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Calls Over Time</CardTitle>
              <CardDescription>Total API calls per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} calls`, "API Usage"]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="API Calls"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Calls</div>
                    <div className="text-2xl font-bold">108,900</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Daily Average</div>
                    <div className="text-2xl font-bold">15,557</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Growth</div>
                    <div className="text-2xl font-bold text-green-600">+12.4%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Peak Day</div>
                    <div className="text-2xl font-bold">05/13</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage by Endpoint</CardTitle>
              <CardDescription>Distribution of API calls across endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={endpointUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {endpointUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Endpoint Usage Breakdown</h4>
                  <div className="space-y-2">
                    {endpointUsageData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="mr-2 h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{entry.name} API</span>
                        </div>
                        <div className="font-medium">{entry.value}%</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 text-sm font-medium">Insights</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Products API is the most used endpoint (35%)</li>
                      <li>Auth API has the lowest usage (5%)</li>
                      <li>Orders and Customers APIs make up 45% of total usage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Usage Pattern</CardTitle>
              <CardDescription>API calls distribution throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} calls`, "API Usage"]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                      name="API Calls"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Peak Hour</div>
                    <div className="text-2xl font-bold">12:00</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Peak Usage</div>
                    <div className="text-2xl font-bold">1,250</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Lowest Hour</div>
                    <div className="text-2xl font-bold">04:00</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Avg. Per Hour</div>
                    <div className="text-2xl font-bold">652</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage by Client</CardTitle>
              <CardDescription>Distribution of API calls by client application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Client Usage Breakdown</h4>
                  <div className="space-y-2">
                    {userUsageData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="mr-2 h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{entry.name}</span>
                        </div>
                        <div className="font-medium">{entry.value}%</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 text-sm font-medium">Insights</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Mobile app is the primary consumer (45%)</li>
                      <li>Website accounts for 30% of API usage</li>
                      <li>Partner integrations are growing steadily</li>
                      <li>Internal tools usage is consistent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
