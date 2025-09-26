"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const vendorPerformance = [
  { name: "Diamond Direct", turnover: 4.2, margin: 35, quality: 4.8, delivery: 4.5, returns: 1.2 },
  { name: "Gem Source", turnover: 3.8, margin: 32, quality: 4.5, delivery: 4.2, returns: 1.8 },
  { name: "Goldsmith Supplies", turnover: 3.5, margin: 38, quality: 4.9, delivery: 4.0, returns: 0.9 },
  { name: "Silver Source", turnover: 2.9, margin: 30, quality: 4.2, delivery: 3.8, returns: 2.5 },
  { name: "Craft Alliance", turnover: 4.5, margin: 28, quality: 4.0, delivery: 4.7, returns: 1.5 },
]

export function VendorAnalysis() {
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
