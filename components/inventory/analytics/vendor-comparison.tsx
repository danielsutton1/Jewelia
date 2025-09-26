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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data
const vendorPerformance = [
  { name: "Vendor A", turnover: 4.2, margin: 35, quality: 4.8, delivery: 4.5, returns: 1.2 },
  { name: "Vendor B", turnover: 3.8, margin: 32, quality: 4.5, delivery: 4.2, returns: 1.8 },
  { name: "Vendor C", turnover: 3.5, margin: 38, quality: 4.9, delivery: 4.0, returns: 0.9 },
  { name: "Vendor D", turnover: 2.9, margin: 30, quality: 4.2, delivery: 3.8, returns: 2.5 },
  { name: "Vendor E", turnover: 4.5, margin: 28, quality: 4.0, delivery: 4.7, returns: 1.5 },
]

const vendorComparison = [
  { name: "Turnover", "Vendor A": 4.2, "Vendor B": 3.8, "Vendor C": 3.5, "Vendor D": 2.9, "Vendor E": 4.5 },
  { name: "Margin", "Vendor A": 35, "Vendor B": 32, "Vendor C": 38, "Vendor D": 30, "Vendor E": 28 },
  { name: "Quality", "Vendor A": 4.8, "Vendor B": 4.5, "Vendor C": 4.9, "Vendor D": 4.2, "Vendor E": 4.0 },
  { name: "Delivery", "Vendor A": 4.5, "Vendor B": 4.2, "Vendor C": 4.0, "Vendor D": 3.8, "Vendor E": 4.7 },
  { name: "Returns", "Vendor A": 1.2, "Vendor B": 1.8, "Vendor C": 0.9, "Vendor D": 2.5, "Vendor E": 1.5 },
]

const vendorInventoryValue = [
  { name: "Vendor A", value: 125000, items: 85 },
  { name: "Vendor B", value: 98000, items: 65 },
  { name: "Vendor C", value: 145000, items: 95 },
  { name: "Vendor D", value: 76000, items: 55 },
  { name: "Vendor E", value: 62000, items: 45 },
]

export function VendorComparison() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators by vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={vendorPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar name="Turnover Rate" dataKey="turnover" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
                <Radar name="Profit Margin (%)" dataKey="margin" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
                <Radar name="Quality Rating" dataKey="quality" stroke="#ffc658" fill="#ffc658" fillOpacity={0.2} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Inventory Value</CardTitle>
          <CardDescription>Total inventory value by vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorInventoryValue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="value" fill="hsl(var(--primary))" name="Inventory Value ($)" />
                <Bar yAxisId="right" dataKey="items" fill="#82ca9d" name="Item Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Comparison</CardTitle>
          <CardDescription>Detailed comparison of vendor performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Turnover</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Returns</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorPerformance.map((vendor) => (
                <TableRow key={vendor.name}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.turnover}x</TableCell>
                  <TableCell>{vendor.margin}%</TableCell>
                  <TableCell>{vendor.quality}/5</TableCell>
                  <TableCell>{vendor.delivery}/5</TableCell>
                  <TableCell>{vendor.returns}%</TableCell>
                  <TableCell>
                    {vendor.turnover >= 4.0 && vendor.quality >= 4.5 && vendor.returns <= 1.5 ? (
                      <Badge className="bg-emerald-500">Excellent</Badge>
                    ) : vendor.turnover <= 3.0 || vendor.quality <= 4.0 || vendor.returns >= 2.0 ? (
                      <Badge className="bg-destructive">Needs Improvement</Badge>
                    ) : (
                      <Badge className="bg-amber-500">Good</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
