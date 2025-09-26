"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data
const locationPerformance = [
  { name: "Main Store", turnover: 4.5, sales: 285000, inventory: 125000, sqft: 1200 },
  { name: "Downtown", turnover: 3.8, sales: 195000, inventory: 98000, sqft: 800 },
  { name: "Mall Location", turnover: 5.2, sales: 320000, inventory: 76000, sqft: 600 },
  { name: "Warehouse", turnover: 2.1, sales: 105000, inventory: 145000, sqft: 2500 },
]

const locationEfficiency = [
  { name: "Main Store", salesPerSqft: 237.5, inventoryPerSqft: 104.2 },
  { name: "Downtown", salesPerSqft: 243.8, inventoryPerSqft: 122.5 },
  { name: "Mall Location", salesPerSqft: 533.3, inventoryPerSqft: 126.7 },
  { name: "Warehouse", salesPerSqft: 42.0, inventoryPerSqft: 58.0 },
]

const locationTrends = [
  { month: "Jan", "Main Store": 85, Downtown: 65, "Mall Location": 90, Warehouse: 40 },
  { month: "Feb", "Main Store": 88, Downtown: 68, "Mall Location": 92, Warehouse: 42 },
  { month: "Mar", "Main Store": 90, Downtown: 72, "Mall Location": 95, Warehouse: 45 },
  { month: "Apr", "Main Store": 92, Downtown: 75, "Mall Location": 98, Warehouse: 48 },
  { month: "May", "Main Store": 95, Downtown: 78, "Mall Location": 100, Warehouse: 50 },
  { month: "Jun", "Main Store": 100, Downtown: 82, "Mall Location": 105, Warehouse: 52 },
  { month: "Jul", "Main Store": 98, Downtown: 80, "Mall Location": 102, Warehouse: 51 },
  { month: "Aug", "Main Store": 96, Downtown: 78, "Mall Location": 100, Warehouse: 50 },
  { month: "Sep", "Main Store": 94, Downtown: 76, "Mall Location": 98, Warehouse: 49 },
  { month: "Oct", "Main Store": 92, Downtown: 74, "Mall Location": 96, Warehouse: 48 },
  { month: "Nov", "Main Store": 90, Downtown: 72, "Mall Location": 94, Warehouse: 47 },
  { month: "Dec", "Main Store": 88, Downtown: 70, "Mall Location": 92, Warehouse: 46 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const inventoryDistribution = [
  { name: "Main Store", value: 125000 },
  { name: "Downtown", value: 98000 },
  { name: "Mall Location", value: 76000 },
  { name: "Warehouse", value: 145000 },
]

export function LocationEfficiency() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Location Performance</CardTitle>
            <CardDescription>Sales and inventory by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Value"]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="hsl(var(--primary))" name="Sales ($)" />
                  <Bar yAxisId="right" dataKey="inventory" fill="#82ca9d" name="Inventory Value ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
            <CardDescription>How inventory is distributed across locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {inventoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Inventory Value"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location Efficiency Metrics</CardTitle>
          <CardDescription>Sales and inventory per square foot by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationEfficiency} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}/sq.ft.`, "Efficiency"]} />
                <Legend />
                <Bar dataKey="salesPerSqft" fill="hsl(var(--primary))" name="Sales per Sq.Ft. ($)" />
                <Bar dataKey="inventoryPerSqft" fill="#82ca9d" name="Inventory per Sq.Ft. ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Performance Trends</CardTitle>
          <CardDescription>Monthly performance index by location (100 = baseline)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={locationTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Main Store" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Downtown" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Mall Location" stroke="#ffc658" />
                <Line type="monotone" dataKey="Warehouse" stroke="#ff8042" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Efficiency Comparison</CardTitle>
          <CardDescription>Detailed efficiency metrics by location</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Turnover</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Square Feet</TableHead>
                <TableHead>Sales/Sq.Ft.</TableHead>
                <TableHead>Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationPerformance.map((location) => {
                const salesPerSqft = location.sales / location.sqft
                return (
                  <TableRow key={location.name}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.turnover}x</TableCell>
                    <TableCell>${location.sales.toLocaleString()}</TableCell>
                    <TableCell>${location.inventory.toLocaleString()}</TableCell>
                    <TableCell>{location.sqft}</TableCell>
                    <TableCell>${salesPerSqft.toFixed(2)}</TableCell>
                    <TableCell>
                      {salesPerSqft >= 300 ? (
                        <Badge className="bg-emerald-500">High Efficiency</Badge>
                      ) : salesPerSqft >= 200 ? (
                        <Badge className="bg-amber-500">Medium Efficiency</Badge>
                      ) : (
                        <Badge className="bg-destructive">Low Efficiency</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
