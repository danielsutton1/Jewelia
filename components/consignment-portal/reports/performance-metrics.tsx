"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PerformanceMetricsProps {
  dateRange: {
    from: Date
    to: Date
  }
}

export function PerformanceMetrics({ dateRange }: PerformanceMetricsProps) {
  // This would be fetched from your API in a real application
  const categoryData = [
    { name: "Rings", value: 8, percentage: 28.6 },
    { name: "Necklaces", value: 7, percentage: 25.0 },
    { name: "Bracelets", value: 5, percentage: 17.9 },
    { name: "Earrings", value: 6, percentage: 21.4 },
    { name: "Watches", value: 2, percentage: 7.1 },
  ]

  const priceRangeData = [
    { name: "Under $1000", value: 4, percentage: 14.3 },
    { name: "$1000-$2000", value: 8, percentage: 28.6 },
    { name: "$2000-$3000", value: 7, percentage: 25.0 },
    { name: "$3000-$4000", value: 6, percentage: 21.4 },
    { name: "Over $4000", value: 3, percentage: 10.7 },
  ]

  const salesTrendData = [
    { month: "Jan", sales: 2, avgDays: 42 },
    { month: "Feb", sales: 1, avgDays: 38 },
    { month: "Mar", sales: 3, avgDays: 45 },
    { month: "Apr", sales: 2, avgDays: 36 },
    { month: "May", sales: 4, avgDays: 32 },
    { month: "Jun", sales: 3, avgDays: 28 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sell-Through Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.8%</div>
            <p className="text-xs text-muted-foreground">12 of 28 items sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Days to Sell</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">37 days</div>
            <p className="text-xs text-muted-foreground">Down from 45 days last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Sale Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,850</div>
            <p className="text-xs text-muted-foreground">Up 12% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.1%</div>
            <p className="text-xs text-muted-foreground">2 items returned unsold</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Distribution</CardTitle>
          <CardDescription>Breakdown of your inventory by category and price range</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="category" className="space-y-4">
            <TabsList>
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="price">By Price Range</TabsTrigger>
            </TabsList>
            <TabsContent value="category" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} items`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="price" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priceRangeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {priceRangeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} items`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Performance Trends</CardTitle>
          <CardDescription>Monthly sales and average days to sell</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                sales: {
                  label: "Items Sold",
                  color: "hsl(var(--chart-1))",
                },
                avgDays: {
                  label: "Avg. Days to Sell",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="var(--color-sales)" name="Items Sold" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgDays"
                    stroke="var(--color-avgDays)"
                    name="Avg. Days to Sell"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium">Top Performing Categories</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Bracelets and necklaces have the highest sell-through rates at 60% and 57% respectively. Consider
                consigning more items in these categories.
              </p>
            </div>
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium">Price Point Optimization</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Items priced between $1,000-$2,000 sell 35% faster than higher-priced items. Consider adjusting prices
                for items that have been in inventory for over 90 days.
              </p>
            </div>
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium">Seasonal Trends</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sales velocity increases by 40% during May-June compared to January-February. Consider timing your
                consignments to align with these seasonal trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
