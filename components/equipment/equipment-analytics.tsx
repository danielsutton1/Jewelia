"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  LineChart,
  Line,
} from "recharts"

// Mock data for equipment analytics
const maintenanceCostData = [
  { month: "Jan", preventive: 1200, repair: 800, emergency: 200 },
  { month: "Feb", preventive: 1400, repair: 600, emergency: 300 },
  { month: "Mar", preventive: 1300, repair: 900, emergency: 100 },
  { month: "Apr", preventive: 1500, repair: 500, emergency: 400 },
  { month: "May", preventive: 1200, repair: 700, emergency: 600 },
  { month: "Jun", preventive: 1600, repair: 400, emergency: 200 },
]

const equipmentTypeData = [
  { name: "Laser Welders", value: 35 },
  { name: "Casting Machines", value: 20 },
  { name: "Polishing Equipment", value: 15 },
  { name: "Rolling Mills", value: 10 },
  { name: "Ultrasonic Cleaners", value: 12 },
  { name: "Other", value: 8 },
]

const downtimeData = [
  { month: "Jan", hours: 24 },
  { month: "Feb", hours: 18 },
  { month: "Mar", hours: 32 },
  { month: "Apr", hours: 15 },
  { month: "May", hours: 28 },
  { month: "Jun", hours: 12 },
]

const maintenanceTypeData = [
  { name: "Preventive", value: 65 },
  { name: "Repair", value: 25 },
  { name: "Emergency", value: 10 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
const MAINTENANCE_COLORS = ["#4ade80", "#fb923c", "#f87171"]

export function EquipmentAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">+2 since last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">-8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downtime Hours</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">129</div>
            <p className="text-xs text-muted-foreground">+19 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Efficiency</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="costs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="costs">Maintenance Costs</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Types</TabsTrigger>
          <TabsTrigger value="downtime">Downtime Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Costs by Type</CardTitle>
              <CardDescription>Monthly breakdown of maintenance costs by category</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={maintenanceCostData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="preventive" stackId="a" fill={MAINTENANCE_COLORS[0]} name="Preventive" />
                    <Bar dataKey="repair" stackId="a" fill={MAINTENANCE_COLORS[1]} name="Repair" />
                    <Bar dataKey="emergency" stackId="a" fill={MAINTENANCE_COLORS[2]} name="Emergency" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium">Preventive</div>
                  <div className="text-muted-foreground">65% of total</div>
                </div>
                <div>
                  <div className="font-medium">Repair</div>
                  <div className="text-muted-foreground">25% of total</div>
                </div>
                <div>
                  <div className="font-medium">Emergency</div>
                  <div className="text-muted-foreground">10% of total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Distribution</CardTitle>
              <CardDescription>Breakdown of equipment types in inventory</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipmentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {equipmentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium">Total Types</div>
                  <div className="text-2xl font-bold">6</div>
                </div>
                <div>
                  <div className="font-medium">Most Common</div>
                  <div className="text-2xl font-bold">Laser Welders</div>
                </div>
                <div>
                  <div className="font-medium">Newest Addition</div>
                  <div className="text-2xl font-bold">CAD/CAM</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="downtime">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Downtime</CardTitle>
              <CardDescription>Monthly equipment downtime in hours</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={downtimeData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hours" stroke="#8884d8" activeDot={{ r: 8 }} name="Downtime Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium">Total Downtime</div>
                  <div className="text-2xl font-bold">129 hrs</div>
                </div>
                <div>
                  <div className="font-medium">Avg. Resolution</div>
                  <div className="text-2xl font-bold">4.2 hrs</div>
                </div>
                <div>
                  <div className="font-medium">Trend</div>
                  <div className="text-2xl font-bold text-green-600">↓ 15%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance by Type</CardTitle>
            <CardDescription>Distribution of maintenance activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={maintenanceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {maintenanceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MAINTENANCE_COLORS[index % MAINTENANCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Equipment Reliability</CardTitle>
            <CardDescription>Mean time between failures (days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: "Laser Welders", value: 120 },
                    { name: "Casting Machines", value: 85 },
                    { name: "Polishing Equipment", value: 150 },
                    { name: "Rolling Mills", value: 95 },
                    { name: "Ultrasonic Cleaners", value: 180 },
                  ]}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
