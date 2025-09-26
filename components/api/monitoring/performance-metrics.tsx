import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts"

// Mock data for performance metrics
const responseTimeData = [
  { time: "00:00", products: 120, orders: 145, customers: 110, inventory: 95 },
  { time: "04:00", products: 125, orders: 150, customers: 115, inventory: 100 },
  { time: "08:00", products: 150, orders: 180, customers: 140, inventory: 120 },
  { time: "12:00", products: 180, orders: 220, customers: 170, inventory: 150 },
  { time: "16:00", products: 190, orders: 210, customers: 160, inventory: 140 },
  { time: "20:00", products: 160, orders: 190, customers: 130, inventory: 110 },
  { time: "24:00", products: 130, orders: 160, customers: 120, inventory: 100 },
]

const throughputData = [
  { time: "00:00", requests: 1200 },
  { time: "04:00", requests: 1500 },
  { time: "08:00", requests: 3200 },
  { time: "12:00", requests: 4500 },
  { time: "16:00", requests: 4200 },
  { time: "20:00", requests: 3100 },
  { time: "24:00", requests: 1800 },
]

const errorRateData = [
  { time: "00:00", rate: 0.5 },
  { time: "04:00", rate: 0.3 },
  { time: "08:00", rate: 0.8 },
  { time: "12:00", rate: 1.2 },
  { time: "16:00", rate: 0.7 },
  { time: "20:00", rate: 0.4 },
  { time: "24:00", rate: 0.2 },
]

const cacheHitData = [
  { time: "00:00", hitRate: 85 },
  { time: "04:00", hitRate: 82 },
  { time: "08:00", hitRate: 78 },
  { time: "12:00", hitRate: 75 },
  { time: "16:00", hitRate: 80 },
  { time: "20:00", hitRate: 83 },
  { time: "24:00", hitRate: 87 },
]

export function PerformanceMetrics() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Performance Metrics</h3>
        <p className="text-sm text-muted-foreground">Monitor API performance and response times</p>
      </div>

      <Tabs defaultValue="response-time" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="throughput">Throughput</TabsTrigger>
          <TabsTrigger value="error-rate">Error Rate</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="response-time" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Response Times</CardTitle>
              <CardDescription>Average response time in milliseconds by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="products" stroke="#8884d8" name="Products API" />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders API" />
                    <Line type="monotone" dataKey="customers" stroke="#ffc658" name="Customers API" />
                    <Line type="monotone" dataKey="inventory" stroke="#ff8042" name="Inventory API" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="throughput" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Throughput</CardTitle>
              <CardDescription>Requests per hour over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={throughputData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#8884d8" name="Requests per Hour" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-rate" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
              <CardDescription>Percentage of requests resulting in errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={errorRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, "Error Rate"]} />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="#ff0000" name="Error Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Cache hit rate percentage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cacheHitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, "Cache Hit Rate"]} />
                    <Legend />
                    <Line type="monotone" dataKey="hitRate" stroke="#82ca9d" name="Cache Hit Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
