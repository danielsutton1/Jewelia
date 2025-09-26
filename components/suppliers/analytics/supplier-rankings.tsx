"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface SupplierRankingsProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export default function SupplierRankings({ timeRange, selectedSuppliers, selectedCategories }: SupplierRankingsProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  const data = [
    {
      id: 1,
      name: "Diamond Direct",
      score: 94,
      delivery: 98,
      quality: 96,
      price: 88,
      response: 95,
      resolution: 93,
      change: "up",
    },
    {
      id: 2,
      name: "Precision Casting",
      score: 92,
      delivery: 95,
      quality: 94,
      price: 87,
      response: 92,
      resolution: 92,
      change: "same",
    },
    {
      id: 3,
      name: "Gem Source",
      score: 89,
      delivery: 92,
      quality: 91,
      price: 85,
      response: 90,
      resolution: 87,
      change: "up",
    },
    {
      id: 4,
      name: "Master Plating",
      score: 87,
      delivery: 90,
      quality: 89,
      price: 84,
      response: 88,
      resolution: 84,
      change: "down",
    },
    {
      id: 5,
      name: "Goldsmith Supplies",
      score: 85,
      delivery: 88,
      quality: 87,
      price: 82,
      response: 86,
      resolution: 82,
      change: "up",
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-amber-600"
    return "text-red-600"
  }

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Supplier Rankings</CardTitle>
        <CardDescription>Overall performance scores and rankings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Overall</TableHead>
                <TableHead className="text-right">Delivery</TableHead>
                <TableHead className="text-right">Quality</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Response</TableHead>
                <TableHead className="text-right">Resolution</TableHead>
                <TableHead className="w-12">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.id}</TableCell>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell className={`text-right font-semibold ${getScoreColor(supplier.score)}`}>
                    {supplier.score}
                  </TableCell>
                  <TableCell className="text-right">{supplier.delivery}</TableCell>
                  <TableCell className="text-right">{supplier.quality}</TableCell>
                  <TableCell className="text-right">{supplier.price}</TableCell>
                  <TableCell className="text-right">{supplier.response}</TableCell>
                  <TableCell className="text-right">{supplier.resolution}</TableCell>
                  <TableCell className="text-center">{getChangeIcon(supplier.change)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <div>Showing top 5 of 10 suppliers</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="h-2 w-2 p-0 bg-green-600" />
              <span>90+ Excellent</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="h-2 w-2 p-0 bg-blue-600" />
              <span>80-89 Good</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="h-2 w-2 p-0 bg-amber-600" />
              <span>70-79 Average</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="h-2 w-2 p-0 bg-red-600" />
              <span>{"<"}70 Poor</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
