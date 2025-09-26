"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, Filter, MoreHorizontal, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConsignedItemForm } from "./consigned-item-form"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

// Sample data - would come from your API in a real application
const consignedItems = [
  {
    id: "ITEM-1001",
    name: "Diamond Tennis Bracelet",
    consignor: "Eleanor Rigby",
    consignorId: "CON-001",
    dateReceived: "2023-09-15",
    endDate: "2024-03-15",
    daysRemaining: 45,
    status: "active",
    price: 3500,
    commissionRate: 30,
    settled: false,
  },
  {
    id: "ITEM-1002",
    name: "Sapphire Pendant Necklace",
    consignor: "Lucy Diamond",
    consignorId: "CON-003",
    dateReceived: "2023-10-02",
    endDate: "2024-01-02",
    daysRemaining: -28,
    status: "overdue",
    price: 2800,
    commissionRate: 25,
    settled: false,
  },
  {
    id: "ITEM-1003",
    name: "Vintage Gold Watch",
    consignor: "Jude Fawley",
    consignorId: "CON-002",
    dateReceived: "2023-11-10",
    endDate: "2024-02-10",
    daysRemaining: 12,
    status: "active",
    price: 4200,
    commissionRate: 35,
    settled: false,
  },
  {
    id: "ITEM-1004",
    name: "Pearl Earrings",
    consignor: "Rita Meter",
    consignorId: "CON-005",
    dateReceived: "2023-12-05",
    endDate: "2024-03-05",
    daysRemaining: 35,
    status: "active",
    price: 1200,
    commissionRate: 40,
    settled: false,
  },
  {
    id: "ITEM-1005",
    name: "Emerald Ring",
    consignor: "Lucy Diamond",
    consignorId: "CON-003",
    dateReceived: "2023-08-20",
    endDate: "2024-02-20",
    daysRemaining: 22,
    status: "sold",
    price: 3800,
    commissionRate: 25,
    settled: true,
    dateSold: "2023-12-15",
  },
]

export function ConsignedItems() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddItem, setShowAddItem] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const router = useRouter()

  const filteredItems = consignedItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.consignor.toLowerCase().includes(searchTerm.toLowerCase())

    if (statusFilter === "all") return matchesSearch
    return matchesSearch && item.status === statusFilter
  })

  const getStatusBadge = (status: string, daysRemaining: number) => {
    switch (status) {
      case "sold":
        return <Badge className="bg-green-500">Sold</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue Return</Badge>
      case "active":
        return daysRemaining <= 14 ? (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Ending Soon
          </Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Consigned Items</CardTitle>
              <CardDescription>Track and manage items on consignment</CardDescription>
            </div>
            <Button onClick={() => router.push("/dashboard/consignment/add-consigned-item")}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="w-[250px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Consignor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Consignment Period</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <div>{item.consignor}</div>
                      <div className="text-xs text-muted-foreground">ID: {item.consignorId}</div>
                    </TableCell>
                    <TableCell>${item.price.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(item.status, item.daysRemaining)}</TableCell>
                    <TableCell>
                      {item.status === "sold" ? (
                        <div>
                          <div className="text-xs text-muted-foreground">Received: {item.dateReceived}</div>
                          <div className="text-xs text-green-600">Sold: {item.dateSold}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={((item.daysRemaining <= 0 ? 0 : item.daysRemaining) / 180) * 100}
                              className="h-2"
                            />
                            <span className="text-xs">
                              {item.daysRemaining > 0 ? `${item.daysRemaining} days` : "Expired"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.dateReceived} to {item.endDate}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.status === "sold" ? (
                        item.settled ? (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            Settled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            Pending
                          </Badge>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedItem(item)}>Edit Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status === "active" && <DropdownMenuItem>Mark as Sold</DropdownMenuItem>}
                          {item.status === "sold" && !item.settled && (
                            <DropdownMenuItem>Process Settlement</DropdownMenuItem>
                          )}
                          {item.status === "active" && <DropdownMenuItem>Return to Consignor</DropdownMenuItem>}
                          {item.status === "overdue" && (
                            <DropdownMenuItem>
                              <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                              Schedule Return
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>View History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Consigned Item</DialogTitle>
            <DialogDescription>Enter the details for the new consigned item</DialogDescription>
          </DialogHeader>
          <ConsignedItemForm onSubmit={() => setShowAddItem(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Consigned Item</DialogTitle>
            <DialogDescription>Update the details for {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          {selectedItem && <ConsignedItemForm item={selectedItem} onSubmit={() => setSelectedItem(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
