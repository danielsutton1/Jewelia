"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowUpDown, Camera, Filter, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface DiscrepancyReviewProps {
  auditData: any
  updateAuditData: (data: any) => void
}

export function DiscrepancyReview({ auditData, updateAuditData }: DiscrepancyReviewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<any | null>(null)
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "shortage" | "excess" | "location">("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [sortField, setSortField] = useState<"difference" | "value">("difference")

  // Mock discrepancies data
  const mockDiscrepancies = [
    {
      id: "disc1",
      itemId: "item1",
      sku: "JR-001",
      name: "Diamond Ring",
      category: "Rings",
      location: "Display Case A",
      expectedQuantity: 3,
      actualQuantity: 2,
      difference: -1,
      discrepancyType: "shortage",
      value: 1299.99,
      totalValue: 1299.99,
      status: "pending",
      notes: "",
      resolution: "",
      image: "/gold-necklace.png",
    },
    {
      id: "disc2",
      itemId: "item3",
      sku: "JE-003",
      name: "Pearl Earrings",
      category: "Earrings",
      location: "Display Case B",
      expectedQuantity: 5,
      actualQuantity: 6,
      difference: 1,
      discrepancyType: "excess",
      value: 499.99,
      totalValue: 499.99,
      status: "pending",
      notes: "",
      resolution: "",
      image: "/pearl-earrings.png",
    },
    {
      id: "disc3",
      itemId: "item5",
      sku: "JP-005",
      name: "Diamond Pendant",
      category: "Pendants",
      location: "Safe 1",
      expectedQuantity: 2,
      actualQuantity: 0,
      difference: -2,
      discrepancyType: "shortage",
      value: 2499.99,
      totalValue: 4999.98,
      status: "pending",
      notes: "",
      resolution: "",
      image: "/sapphire-pendant.png",
    },
    {
      id: "disc4",
      itemId: "item4",
      sku: "JB-004",
      name: "Sapphire Bracelet",
      category: "Bracelets",
      location: "Display Case B",
      expectedQuantity: 1,
      actualQuantity: 2,
      difference: 1,
      discrepancyType: "excess",
      value: 1899.99,
      totalValue: 1899.99,
      status: "pending",
      notes: "",
      resolution: "",
      image: "/emerald-bracelet.png",
    },
  ]

  // Use mock data or data from auditData
  const discrepancies = auditData.discrepancies?.length ? auditData.discrepancies : mockDiscrepancies

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleResolve = (discrepancy: any) => {
    setSelectedDiscrepancy(discrepancy)
    setResolutionDialogOpen(true)
  }

  const handleResolutionSubmit = (resolution: string, notes: string) => {
    if (!selectedDiscrepancy) return

    const updatedDiscrepancy = {
      ...selectedDiscrepancy,
      status: "resolved",
      resolution,
      notes,
      resolvedAt: new Date(),
      resolvedBy: "John Doe", // In a real app, this would be the current user
    }

    // Update discrepancies
    const updatedDiscrepancies = discrepancies.map((d: any) => (d.id === updatedDiscrepancy.id ? updatedDiscrepancy : d))

    updateAuditData({ discrepancies: updatedDiscrepancies })
    setResolutionDialogOpen(false)
    setSelectedDiscrepancy(null)
  }

  const handleSort = (field: "difference" | "value") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  // Filter and sort discrepancies
  const filteredDiscrepancies = discrepancies
    .filter((d: any) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          d.sku.toLowerCase().includes(query) ||
          d.name.toLowerCase().includes(query) ||
          d.location.toLowerCase().includes(query)
        )
      }
      return true
    })
    .filter((d: any) => {
      // Apply type filter
      if (filterType === "shortage") return d.discrepancyType === "shortage"
      if (filterType === "excess") return d.discrepancyType === "excess"
      return true
    })
    .sort((a: any, b: any) => {
      // Apply sorting
      const fieldA = sortField === "difference" ? Math.abs(a.difference) : a.totalValue
      const fieldB = sortField === "difference" ? Math.abs(b.difference) : b.totalValue

      if (sortOrder === "asc") {
        return fieldA - fieldB
      } else {
        return fieldB - fieldA
      }
    })

  // Calculate summary statistics
  const totalShortages = discrepancies.filter((d: any) => d.discrepancyType === "shortage").length
  const totalExcess = discrepancies.filter((d: any) => d.discrepancyType === "excess").length
  const totalResolved = discrepancies.filter((d: any) => d.status === "resolved").length
  const totalValueImpact = discrepancies.reduce((sum: any, d: any) => {
    if (d.discrepancyType === "shortage") {
      return sum - d.totalValue
    } else {
      return sum + d.totalValue
    }
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Discrepancy Review</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Review and resolve inventory discrepancies found during the audit.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Discrepancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discrepancies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Items with count differences</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shortages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{totalShortages}</div>
            <p className="text-xs text-muted-foreground mt-1">Items with fewer than expected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Excess</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{totalExcess}</div>
            <p className="text-xs text-muted-foreground mt-1">Items with more than expected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Value Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn("text-2xl font-bold", totalValueImpact >= 0 ? "text-green-500" : "text-red-500")}
            >
              $
              {Math.abs(totalValueImpact).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalValueImpact >= 0 ? "Positive" : "Negative"} inventory adjustment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search discrepancies..." className="pl-8" value={searchQuery} onChange={handleSearch} />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Discrepancies</SelectItem>
              <SelectItem value="shortage">Shortages Only</SelectItem>
              <SelectItem value="excess">Excess Only</SelectItem>
              <SelectItem value="location">By Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Discrepancies Table */}
      <div className="border rounded-md">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("difference")}>
                    Difference
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("value")}>
                    Value Impact
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscrepancies.map((discrepancy: any) => (
                <TableRow key={discrepancy.id}>
                  <TableCell className="font-medium">{discrepancy.sku}</TableCell>
                  <TableCell>{discrepancy.name}</TableCell>
                  <TableCell>{discrepancy.location}</TableCell>
                  <TableCell className="text-right">{discrepancy.expectedQuantity}</TableCell>
                  <TableCell className="text-right">{discrepancy.actualQuantity}</TableCell>
                  <TableCell className="text-right">
                    <span className={discrepancy.difference < 0 ? "text-red-500" : "text-green-500"}>
                      {discrepancy.difference > 0 ? "+" : ""}
                      {discrepancy.difference}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={discrepancy.discrepancyType === "shortage" ? "text-red-500" : "text-green-500"}>
                      {discrepancy.discrepancyType === "shortage" ? "-" : "+"}$
                      {discrepancy.totalValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {discrepancy.status === "pending" ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        Pending
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500">Resolved</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolve(discrepancy)}
                      disabled={discrepancy.status === "resolved"}
                    >
                      {discrepancy.status === "pending" ? "Resolve" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Resolution Dialog */}
      <Dialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Discrepancy</DialogTitle>
            <DialogDescription>
              {selectedDiscrepancy?.name} ({selectedDiscrepancy?.sku})
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              {selectedDiscrepancy?.image && (
                <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
                  <img
                    src={selectedDiscrepancy.image || "/placeholder.svg"}
                    alt={selectedDiscrepancy.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h4 className="font-medium">{selectedDiscrepancy?.name}</h4>
                <p className="text-sm text-muted-foreground">SKU: {selectedDiscrepancy?.sku}</p>
                <p className="text-sm text-muted-foreground">Location: {selectedDiscrepancy?.location}</p>
                <div className="flex gap-4 mt-1">
                  <p className="text-sm">Expected: {selectedDiscrepancy?.expectedQuantity}</p>
                  <p className="text-sm">Actual: {selectedDiscrepancy?.actualQuantity}</p>
                  <p className="text-sm">
                    Difference:
                    <span className={selectedDiscrepancy?.difference < 0 ? "text-red-500" : "text-green-500"}>
                      {selectedDiscrepancy?.difference > 0 ? " +" : " "}
                      {selectedDiscrepancy?.difference}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Select defaultValue="adjust">
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjust">Adjust Inventory</SelectItem>
                  <SelectItem value="recount">Recount Item</SelectItem>
                  <SelectItem value="investigate">Investigate Further</SelectItem>
                  <SelectItem value="ignore">Ignore Discrepancy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add notes about the resolution" />
            </div>

            <div className="space-y-2">
              <Label>Photo Documentation</Label>
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolutionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleResolutionSubmit("adjust", "Inventory adjusted to match physical count")}>
              Resolve Discrepancy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
