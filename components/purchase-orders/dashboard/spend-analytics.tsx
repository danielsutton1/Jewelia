"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PurchaseOrder } from "@/types/purchase-order"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface SpendAnalyticsProps {
  purchaseOrders: PurchaseOrder[]
}

export function SpendAnalytics({ purchaseOrders }: SpendAnalyticsProps) {
  // Calculate spend by supplier
  const spendBySupplier = purchaseOrders.reduce(
    (acc, po) => {
      if (po.status === "cancelled") return acc

      const supplierName = po.supplierName ?? "Unknown Supplier"
      if (!acc[supplierName]) {
        acc[supplierName] = 0
      }
      acc[supplierName] += po.totalAmount
      return acc
    },
    {} as Record<string, number>,
  )

  const supplierData = Object.entries(spendBySupplier)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 suppliers

  // Calculate spend by month
  const spendByMonth = purchaseOrders.reduce(
    (acc, po) => {
      if (po.status === "cancelled") return acc

      const date = new Date(po.createdAt)
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

      if (!acc[monthYear]) {
        acc[monthYear] = 0
      }
      acc[monthYear] += po.totalAmount
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to array and sort by date
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthData = Object.entries(spendByMonth)
    .map(([name, value]) => {
      const [month, year] = name.split(" ")
      return {
        name,
        value,
        sortKey: `${year}${monthNames.indexOf(month).toString().padStart(2, "0")}`,
      }
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-6) // Last 6 months
    .map(({ name, value }) => ({ name, value }))

  // Calculate spend by category
  const spendByCategory = purchaseOrders.reduce(
    (acc, po) => {
      if (po.status === "cancelled") return acc

      po.lineItems.forEach((item) => {
        const category = (item as any).category || "Uncategorized"
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += item.quantity * item.unitPrice
      })

      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(spendByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Spend Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="supplier">By Supplier</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="pt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="supplier" className="pt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="category" className="pt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
