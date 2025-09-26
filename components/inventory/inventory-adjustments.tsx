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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

// Sample data - replace with actual data fetching
const sampleAdjustments = [
  {
    id: "1",
    date: "2024-03-20",
    itemSku: "FP-001",
    itemName: "Diamond Engagement Ring",
    type: "Addition",
    quantity: 2,
    reason: "Received from supplier",
    notes: "Regular stock replenishment",
    adjustedBy: "John Doe",
  },
  // Add more sample items...
]

export function InventoryAdjustments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [adjustments, setAdjustments] = useState(sampleAdjustments)
  const [showForm, setShowForm] = useState(false)
  const [newAdjustment, setNewAdjustment] = useState({
    itemSku: "",
    type: "Addition",
    quantity: "",
    reason: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add validation and API call here
    setShowForm(false)
    setNewAdjustment({
      itemSku: "",
      type: "Addition",
      quantity: "",
      reason: "",
      notes: "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search adjustments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">New Inventory Adjustment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item SKU</label>
                <Input
                  value={newAdjustment.itemSku}
                  onChange={(e) =>
                    setNewAdjustment({ ...newAdjustment, itemSku: e.target.value })
                  }
                  placeholder="Enter item SKU"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adjustment Type</label>
                <Select
                  value={newAdjustment.type}
                  onValueChange={(value) =>
                    setNewAdjustment({ ...newAdjustment, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Addition">Addition</SelectItem>
                    <SelectItem value="Subtraction">Subtraction</SelectItem>
                    <SelectItem value="Correction">Correction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={newAdjustment.quantity}
                  onChange={(e) =>
                    setNewAdjustment({ ...newAdjustment, quantity: e.target.value })
                  }
                  placeholder="Enter quantity"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Input
                  value={newAdjustment.reason}
                  onChange={(e) =>
                    setNewAdjustment({ ...newAdjustment, reason: e.target.value })
                  }
                  placeholder="Enter reason"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newAdjustment.notes}
                onChange={(e) =>
                  setNewAdjustment({ ...newAdjustment, notes: e.target.value })
                }
                placeholder="Enter additional notes"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Adjustment</Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item SKU</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Adjusted By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell>{adjustment.date}</TableCell>
                <TableCell>{adjustment.itemSku}</TableCell>
                <TableCell>{adjustment.itemName}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      adjustment.type === "Addition"
                        ? "bg-green-100 text-green-800"
                        : adjustment.type === "Subtraction"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {adjustment.type}
                  </span>
                </TableCell>
                <TableCell>{adjustment.quantity}</TableCell>
                <TableCell>{adjustment.reason}</TableCell>
                <TableCell>{adjustment.notes}</TableCell>
                <TableCell>{adjustment.adjustedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
 
 