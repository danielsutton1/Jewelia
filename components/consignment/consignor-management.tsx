"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, Edit, MoreHorizontal, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConsignorForm } from "./consignor-form"
import { useRouter } from "next/navigation"

// Sample data - would come from your API in a real application
const consignors = [
  {
    id: "CON-001",
    name: "Eleanor Rigby",
    email: "eleanor@example.com",
    phone: "(555) 123-4567",
    activeItems: 12,
    totalValue: 24500,
    commissionRate: 30,
    status: "active",
  },
  {
    id: "CON-002",
    name: "Jude Fawley",
    email: "jude@example.com",
    phone: "(555) 234-5678",
    activeItems: 8,
    totalValue: 16750,
    commissionRate: 35,
    status: "active",
  },
  {
    id: "CON-003",
    name: "Lucy Diamond",
    email: "lucy@example.com",
    phone: "(555) 345-6789",
    activeItems: 15,
    totalValue: 31200,
    commissionRate: 25,
    status: "active",
  },
  {
    id: "CON-004",
    name: "Maxwell Edison",
    email: "maxwell@example.com",
    phone: "(555) 456-7890",
    activeItems: 0,
    totalValue: 0,
    commissionRate: 30,
    status: "inactive",
  },
  {
    id: "CON-005",
    name: "Rita Meter",
    email: "rita@example.com",
    phone: "(555) 567-8901",
    activeItems: 5,
    totalValue: 9800,
    commissionRate: 40,
    status: "active",
  },
]

export function ConsignorManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddConsignor, setShowAddConsignor] = useState(false)
  const [selectedConsignor, setSelectedConsignor] = useState<any>(null)

  const router = useRouter()

  const filteredConsignors = consignors.filter(
    (consignor) =>
      consignor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Consignor Management</CardTitle>
              <CardDescription>Manage your consignment partners and their agreements</CardDescription>
            </div>
            <Button onClick={() => router.push("/dashboard/consignment/consignors/add")}>
              <Plus className="mr-2 h-4 w-4" /> Add Consignor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search consignors..."
              className="max-w-sm rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Active Items</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsignors.map((consignor) => (
                  <TableRow key={consignor.id}>
                    <TableCell className="font-medium">{consignor.id}</TableCell>
                    <TableCell>{consignor.name}</TableCell>
                    <TableCell>
                      <div>{consignor.email}</div>
                      <div className="text-xs text-muted-foreground">{consignor.phone}</div>
                    </TableCell>
                    <TableCell>{consignor.activeItems}</TableCell>
                    <TableCell>${consignor.totalValue.toLocaleString()}</TableCell>
                    <TableCell>{consignor.commissionRate}%</TableCell>
                    <TableCell>
                      <Badge variant={consignor.status === "active" ? "default" : "secondary"}>
                        {consignor.status === "active" ? "Active" : "Inactive"}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => setSelectedConsignor(consignor)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" /> View Agreement
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Items</DropdownMenuItem>
                          <DropdownMenuItem>Settlement History</DropdownMenuItem>
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

      <Dialog open={showAddConsignor} onOpenChange={setShowAddConsignor}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Consignor</DialogTitle>
            <DialogDescription>Enter the details for the new consignment partner</DialogDescription>
          </DialogHeader>
          <ConsignorForm onSubmit={() => setShowAddConsignor(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedConsignor} onOpenChange={() => setSelectedConsignor(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Consignor</DialogTitle>
            <DialogDescription>Update the details for {selectedConsignor?.name}</DialogDescription>
          </DialogHeader>
          {selectedConsignor && (
            <ConsignorForm consignor={selectedConsignor} onSubmit={() => setSelectedConsignor(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
