"use client"

import { useState } from "react"
import { Plus, Search, Link2, Unlink, ExternalLink, Calendar, User, Tag } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { CadFile } from "./cad-file-manager"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { mockWorkOrders } from "./mock-data"

interface WorkOrderLinkingProps {
  file: CadFile
}

export function WorkOrderLinking({ file }: WorkOrderLinkingProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([])

  // Get linked work orders
  const linkedWorkOrders = mockWorkOrders.filter((order) => file.linkedWorkOrders?.includes(order.id))

  // Filter work orders for search
  const filteredWorkOrders = mockWorkOrders.filter(
    (order) =>
      !file.linkedWorkOrders?.includes(order.id) &&
      (order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleToggleWorkOrder = (id: string) => {
    setSelectedWorkOrders((prev) => (prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]))
  }

  const handleLinkWorkOrders = () => {
    // In a real app, this would update the file's linked work orders
    alert(`Linking work orders: ${selectedWorkOrders.join(", ")}`)
    setLinkDialogOpen(false)
    setSelectedWorkOrders([])
  }

  const handleUnlinkWorkOrder = (id: string) => {
    // In a real app, this would remove the link between the file and work order
    alert(`Unlinking work order: ${id}`)
  }

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Linked Work Orders</CardTitle>
        <Button onClick={() => setLinkDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Link Work Order
        </Button>
      </CardHeader>

      <CardContent>
        {linkedWorkOrders.length > 0 ? (
          <div className="space-y-4">
            {linkedWorkOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{order.id}</h4>
                    <Badge
                      variant={
                        order.status === "In Progress"
                          ? "default"
                          : order.status === "Completed"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{order.description}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <User className="mr-1 h-3 w-3" />
                      {order.customer}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      Due: {order.dueDate}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Tag className="mr-1 h-3 w-3" />
                      {order.type}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/dashboard/production/work-orders/${order.id}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleUnlinkWorkOrder(order.id)}>
                    <Unlink className="mr-2 h-4 w-4" />
                    Unlink
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
            <div className="text-center">
              <Link2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No linked work orders</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setLinkDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Link Work Order
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Link Work Orders</DialogTitle>
            <DialogDescription>Select work orders to link with this CAD file.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <Input
                placeholder="Search work orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="max-h-[400px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.length > 0 ? (
                    filteredWorkOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedWorkOrders.includes(order.id)}
                            onCheckedChange={() => handleToggleWorkOrder(order.id)}
                          />
                        </TableCell>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.description}</TableCell>
                        <TableCell>{order.dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "In Progress"
                                ? "default"
                                : order.status === "Completed"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No work orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkWorkOrders} disabled={selectedWorkOrders.length === 0}>
              <Link2 className="mr-2 h-4 w-4" />
              Link Selected ({selectedWorkOrders.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
