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
  LineChart,
  Line,
} from "recharts"

// Sample data
const channelRevenue = [
  { name: "Website", revenue: 28500, orders: 210 },
  { name: "Mobile App", revenue: 16800, orders: 120 },
  { name: "Marketplace", revenue: 12400, orders: 95 },
  { name: "Social Media", revenue: 8900, orders: 65 },
  { name: "In-Store", revenue: 22500, orders: 150 },
]

const channelGrowth = [
  { month: "Jan", website: 5, app: 3, marketplace: 2, social: 8, store: 1 },
  { month: "Feb", website: 7, app: 4, marketplace: 3, social: 10, store: 2 },
  { month: "Mar", website: 10, app: 6, marketplace: 5, social: 12, store: 3 },
  { month: "Apr", website: 8, app: 8, marketplace: 6, social: 9, store: 4 },
  { month: "May", website: 12, app: 10, marketplace: 8, social: 11, store: 5 },
  { month: "Jun", website: 15, app: 12, marketplace: 10, social: 14, store: 6 },
  { month: "Jul", website: 18, app: 15, marketplace: 12, social: 16, store: 7 },
  { month: "Aug", website: 20, app: 18, marketplace: 15, social: 18, store: 8 },
  { month: "Sep", website: 17, app: 16, marketplace: 14, social: 15, store: 7 },
  { month: "Oct", website: 19, app: 19, marketplace: 16, social: 17, store: 9 },
  { month: "Nov", website: 22, app: 21, marketplace: 18, social: 20, store: 10 },
  { month: "Dec", website: 25, app: 24, marketplace: 20, social: 22, store: 12 },
]

const conversionRates = [
  { channel: "Website", rate: 3.2 },
  { channel: "Mobile App", rate: 4.5 },
  { channel: "Marketplace", rate: 2.8 },
  { channel: "Social Media", rate: 1.9 },
  { channel: "Email", rate: 3.7 },
]

export function ChannelAnalytics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Channel</CardTitle>
          <CardDescription>Revenue and orders across different sales channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channel Growth</CardTitle>
            <CardDescription>Monthly growth trends by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={channelGrowth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, "Growth Rate"]} />
                  <Legend />
                  <Line type="monotone" dataKey="website" stroke="#8884d8" name="Website" />
                  <Line type="monotone" dataKey="app" stroke="#82ca9d" name="Mobile App" />
                  <Line type="monotone" dataKey="marketplace" stroke="#ffc658" name="Marketplace" />
                  <Line type="monotone" dataKey="social" stroke="#ff8042" name="Social Media" />
                  <Line type="monotone" dataKey="store" stroke="#0088fe" name="In-Store" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates</CardTitle>
            <CardDescription>Conversion rates by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionRates} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Conversion Rate"]} />
                  <Bar dataKey="rate" fill="#8884d8" name="Conversion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
