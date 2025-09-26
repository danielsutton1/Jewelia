"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Barcode, Download, Upload } from "lucide-react"

// Sample data - replace with actual data fetching
const sampleInventory = [
  {
    id: "1",
    sku: "FP-001",
    name: "Diamond Engagement Ring",
    category: "Finished Pieces",
    systemQuantity: 5,
    countedQuantity: 5,
    variance: 0,
    status: "Matched",
  },
  // Add more sample items...
]

export function PhysicalInventory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [inventory, setInventory] = useState(sampleInventory)
  const [isScanning, setIsScanning] = useState(false)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matched Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter((item) => item.status === "Matched").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter((item) => item.status !== "Matched").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (inventory.filter((item) => item.countedQuantity !== null).length /
                  inventory.length) *
                  100
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
          <Button
            variant={isScanning ? "destructive" : "default"}
            onClick={() => setIsScanning(!isScanning)}
          >
            <Barcode className="mr-2 h-4 w-4" />
            {isScanning ? "Stop Scanning" : "Start Scanning"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>System Quantity</TableHead>
              <TableHead>Counted Quantity</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.systemQuantity}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.countedQuantity}
                    onChange={(e) => {
                      const newCount = parseInt(e.target.value)
                      setInventory(
                        inventory.map((i) =>
                          i.id === item.id
                            ? {
                                ...i,
                                countedQuantity: newCount,
                                variance: newCount - i.systemQuantity,
                                status:
                                  newCount === i.systemQuantity
                                    ? "Matched"
                                    : "Variance",
                              }
                            : i
                        )
                      )
                    }}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>{item.variance}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "Matched"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
 
 