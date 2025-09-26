"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PurchaseOrderLineItem } from "@/types/purchase-order"

interface CustomItemFormProps {
  onAddItem: (item: Omit<PurchaseOrderLineItem, "id" | "status" | "receivedQuantity">) => void
}

export function CustomItemForm({ onAddItem }: CustomItemFormProps) {
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState<number>(1)
  const [unit, setUnit] = useState("piece")
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [tax, setTax] = useState<number>(0)
  const [notes, setNotes] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const totalPrice = quantity * unitPrice

    onAddItem({
      description,
      quantity,
      unit,
      unitPrice,
      totalPrice,
      tax,
      notes,
      deliveryDate: deliveryDate || undefined,
    })

    // Reset form
    setDescription("")
    setQuantity(1)
    setUnit("piece")
    setUnitPrice(0)
    setTax(0)
    setNotes("")
    setDeliveryDate("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-md p-4">
      <h3 className="text-lg font-medium">Add Custom Item</h3>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Item description"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="piece, meter, gram, etc."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax">Tax</Label>
          <Input
            id="tax"
            type="number"
            min="0"
            step="0.01"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryDate">Delivery Date</Label>
        <Input id="deliveryDate" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" />
      </div>

      <Button type="submit" className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </form>
  )
}
