"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Download, Plus, Search, Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for parts inventory
const partsInventoryData = [
  {
    id: "P001",
    name: "Laser Lens",
    equipmentType: "Laser Welder",
    sku: "LL-2023-001",
    quantity: 5,
    minQuantity: 2,
    location: "Cabinet A, Shelf 2",
    lastOrdered: "2023-03-15",
    supplier: "Optics Pro",
    price: "$245.00",
    status: "In Stock",
  },
  {
    id: "P002",
    name: "Vacuum Pump Filter",
    equipmentType: "Casting Machine",
    sku: "VPF-2023-042",
    quantity: 8,
    minQuantity: 3,
    location: "Cabinet B, Shelf 1",
    lastOrdered: "2023-04-22",
    supplier: "Casting Supplies Inc.",
    price: "$78.50",
    status: "In Stock",
  },
  {
    id: "P003",
    name: "Polishing Wheel",
    equipmentType: "Polishing Machine",
    sku: "PW-2023-103",
    quantity: 12,
    minQuantity: 5,
    location: "Cabinet C, Drawer 3",
    lastOrdered: "2023-05-10",
    supplier: "Finishing Tools Co.",
    price: "$32.75",
    status: "In Stock",
  },
  {
    id: "P004",
    name: "Motor Belt",
    equipmentType: "Rolling Mill",
    sku: "MB-2023-027",
    quantity: 2,
    minQuantity: 2,
    location: "Cabinet A, Drawer 1",
    lastOrdered: "2023-06-05",
    supplier: "Machine Parts Ltd.",
    price: "$45.99",
    status: "Low Stock",
  },
  {
    id: "P005",
    name: "Heating Element",
    equipmentType: "Ultrasonic Cleaner",
    sku: "HE-2023-056",
    quantity: 1,
    minQuantity: 2,
    location: "Cabinet B, Shelf 3",
    lastOrdered: "2023-07-18",
    supplier: "Cleaning Tech Solutions",
    price: "$120.25",
    status: "Low Stock",
  },
  {
    id: "P006",
    name: "Control Board",
    equipmentType: "Laser Welder",
    sku: "CB-2023-089",
    quantity: 0,
    minQuantity: 1,
    location: "Cabinet D, Shelf 1",
    lastOrdered: "2023-02-28",
    supplier: "Electronics Supply Co.",
    price: "$385.00",
    status: "Out of Stock",
  },
]

export function PartsInventory() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter the parts inventory based on search term
  const filteredParts = partsInventoryData.filter(
    (part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.equipmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Function to get the appropriate badge color based on status
  const getStatusBadge = (status: string, quantity: number, minQuantity: number) => {
    if (status === "Out of Stock") {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (status === "Low Stock" || quantity <= minQuantity) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Low Stock
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          In Stock
        </Badge>
      )
    }
  }

  // Function to calculate stock level percentage
  const getStockLevelPercentage = (quantity: number, minQuantity: number) => {
    // For visualization purposes, we'll consider minQuantity * 3 as "full stock"
    const maxExpected = minQuantity * 3
    const percentage = (quantity / maxExpected) * 100
    return Math.min(percentage, 100) // Cap at 100%
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parts Inventory</CardTitle>
        <CardDescription>Manage replacement parts for equipment maintenance</CardDescription>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search parts inventory..."
              className="w-full sm:w-[300px] pl-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Part
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Import/Export">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => alert('Import clicked')}>
                  <Upload className="h-4 w-4 mr-2" /> Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Export clicked')}>
                  <Download className="h-4 w-4 mr-2" /> Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>Equipment Type</TableHead>
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length > 0 ? (
                filteredParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.equipmentType}</TableCell>
                    <TableCell className="hidden md:table-cell">{part.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px]">
                          <Progress
                            value={getStockLevelPercentage(part.quantity, part.minQuantity)}
                            className={`h-2 ${
                              part.quantity === 0
                                ? "bg-red-100"
                                : part.quantity <= part.minQuantity
                                  ? "bg-amber-100"
                                  : "bg-green-100"
                            }`}
                          />
                        </div>
                        <span className="text-xs whitespace-nowrap">
                          {part.quantity}/{part.minQuantity} min
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{part.location}</TableCell>
                    <TableCell className="hidden lg:table-cell">{part.supplier}</TableCell>
                    <TableCell>{getStatusBadge(part.status, part.quantity, part.minQuantity)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="Actions">
                            <span className="sr-only">Open actions</span>
                            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/><circle cx="16" cy="10" r="1.5" fill="currentColor"/></svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('Order clicked')}>
                            🛒 Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Edit clicked')}>
                            ✏️ Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No parts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Parts below minimum quantity are automatically flagged for reordering.</span>
        </div>
      </CardContent>
    </Card>
  )
}
