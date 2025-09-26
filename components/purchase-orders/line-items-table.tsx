"use client"

import { useState } from "react"
import { Trash2, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PurchaseOrderLineItem } from "@/types/purchase-order"
import { formatCurrency } from "@/lib/utils"

interface LineItemsTableProps {
  items: PurchaseOrderLineItem[]
  onUpdateItem: (id: string, item: Partial<PurchaseOrderLineItem>) => void
  onRemoveItem: (id: string) => void
  currency?: string
  editable?: boolean
}

export function LineItemsTable({
  items,
  onUpdateItem,
  onRemoveItem,
  currency = "USD",
  editable = true,
}: LineItemsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<PurchaseOrderLineItem>>({})

  const startEditing = (item: PurchaseOrderLineItem) => {
    setEditingId(item.id)
    setEditValues({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      tax: item.tax,
      notes: item.notes,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValues({})
  }

  const saveEditing = (id: string) => {
    // Calculate the new total price
    const quantity = editValues.quantity ?? 0
    const unitPrice = editValues.unitPrice ?? 0
    const totalPrice = quantity * unitPrice

    onUpdateItem(id, { ...editValues, totalPrice })
    setEditingId(null)
    setEditValues({})
  }

  const handleInputChange = (field: keyof PurchaseOrderLineItem, value: any) => {
    setEditValues((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.totalPrice + (item.tax || 0)), 0)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-right">Quantity</th>
            <th className="px-4 py-2 text-left">Unit</th>
            <th className="px-4 py-2 text-right">Unit Price</th>
            <th className="px-4 py-2 text-right">Total</th>
            <th className="px-4 py-2 text-right">Tax</th>
            <th className="px-4 py-2 text-left">Notes</th>
            {editable && <th className="px-4 py-2 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="px-4 py-2">
                {editingId === item.id ? (
                  <Textarea
                    value={editValues.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full"
                    rows={2}
                  />
                ) : (
                  item.description
                )}
              </td>
              <td className="px-4 py-2 text-right">
                {editingId === item.id ? (
                  <Input
                    type="number"
                    min="1"
                    value={editValues.quantity}
                    onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
                    className="w-20 text-right"
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td className="px-4 py-2">
                {editingId === item.id ? (
                  <Input
                    value={editValues.unit}
                    onChange={(e) => handleInputChange("unit", e.target.value)}
                    className="w-24"
                  />
                ) : (
                  item.unit
                )}
              </td>
              <td className="px-4 py-2 text-right">
                {editingId === item.id ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editValues.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", Number(e.target.value))}
                    className="w-24 text-right"
                  />
                ) : (
                  formatCurrency(item.unitPrice)
                )}
              </td>
              <td className="px-4 py-2 text-right">
                {editingId === item.id
                  ? formatCurrency((editValues.quantity || 0) * (editValues.unitPrice || 0))
                  : formatCurrency(item.totalPrice)}
              </td>
              <td className="px-4 py-2 text-right">
                {editingId === item.id ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editValues.tax}
                    onChange={(e) => handleInputChange("tax", Number(e.target.value))}
                    className="w-24 text-right"
                  />
                ) : (
                  formatCurrency(item.tax || 0)
                )}
              </td>
              <td className="px-4 py-2">
                {editingId === item.id ? (
                  <Textarea
                    value={editValues.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="w-full"
                    rows={2}
                  />
                ) : (
                  item.notes || "-"
                )}
              </td>
              {editable && (
                <td className="px-4 py-2 text-center">
                  {editingId === item.id ? (
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => saveEditing(item.id)} title="Save">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={cancelEditing} title="Cancel">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => startEditing(item)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} title="Remove">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={editable ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">
                No items added yet. Add items from the catalog or create custom items.
              </td>
            </tr>
          )}
        </tbody>
        {items.length > 0 && (
          <tfoot>
            <tr className="bg-muted/50">
              <td colSpan={4} className="px-4 py-2 text-right font-medium">
                Total:
              </td>
              <td className="px-4 py-2 text-right font-medium">
                {formatCurrency(
                  items.reduce((sum, item) => sum + item.totalPrice, 0),
                )}
              </td>
              <td className="px-4 py-2 text-right font-medium">
                {formatCurrency(
                  items.reduce((sum, item) => sum + (item.tax || 0), 0),
                )}
              </td>
              <td colSpan={editable ? 2 : 1}></td>
            </tr>
            <tr className="bg-primary/10">
              <td colSpan={4} className="px-4 py-2 text-right font-bold">
                Grand Total:
              </td>
              <td colSpan={2} className="px-4 py-2 text-right font-bold">
                {formatCurrency(calculateTotal())}
              </td>
              <td colSpan={editable ? 2 : 1}></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
