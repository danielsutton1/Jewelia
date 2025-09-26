"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Edit, Trash2, Copy, MessageSquare, Plus, GripVertical, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Sample data for demonstration
const initialItems = [
  {
    id: "item-1",
    image: "/sparkling-diamond-ring.png",
    sku: "DR-0123",
    name: "Diamond Solitaire Ring",
    description: "1.0ct round brilliant diamond in 18k white gold setting",
    quantity: 1,
    unitPrice: 3499.99,
    discount: { type: "percentage", value: 0, reason: "" },
    taxExempt: false,
    notes: "",
    diamondSpecs: {
      clarity: "VS2",
      color: "G",
      cut: "Ideal",
      caratWeight: 1.0,
      fluorescence: "None",
      polish: "Excellent",
      symmetry: "Excellent",
      gradingLab: "GIA",
      reportNumber: "123456789",
      depthPercentage: 61.5,
      tablePercentage: 57,
      measurements: { length: 5.5, width: 5.5, depth: 3.25 },
    },
  },
  {
    id: "item-2",
    image: "/pearl-necklace.png",
    sku: "NL-0456",
    name: "Pearl Necklace",
    description: "18-inch strand of AAA white freshwater pearls with silver clasp",
    quantity: 2,
    unitPrice: 899.99,
    discount: { type: "amount", value: 50, reason: "Seasonal promotion" },
    taxExempt: false,
    notes: "Customer requested gift wrapping",
  },
  {
    id: "item-3",
    image: "/emerald-bracelet.png",
    sku: "BR-0789",
    name: "Emerald Tennis Bracelet",
    description: "7-inch bracelet with 12 emerald stones set in 14k yellow gold",
    quantity: 1,
    unitPrice: 2199.99,
    discount: { type: "percentage", value: 10, reason: "Loyalty discount" },
    taxExempt: true,
    notes: "",
  },
]

// Types
export interface OrderItem {
  id: string
  image: string
  sku: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  discount: {
    type: "percentage" | "amount"
    value: number
    reason: string
  }
  taxExempt: boolean
  notes: string
  diamondSpecs?: {
    clarity: string
    color: string
    cut: string
    caratWeight: number
    fluorescence?: string
    polish?: string
    symmetry?: string
    gradingLab?: string
    reportNumber?: string
    depthPercentage?: number
    tablePercentage?: number
    measurements?: { length: number; width: number; depth: number }
  }
}

interface OrderItemsTableProps {
  taxRate?: number
  items: OrderItem[]
  onItemsChange: (items: OrderItem[]) => void
  onAddItem?: () => void
}

export function OrderItemsTable({ 
  taxRate = 0.0825,
  items = [],
  onItemsChange,
  onAddItem
}: OrderItemsTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [notesDialogItem, setNotesDialogItem] = useState<OrderItem | null>(null)
  const [discountDialogItem, setDiscountDialogItem] = useState<OrderItem | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Calculate subtotal for an item
  const calculateSubtotal = (item: OrderItem) => {
    const basePrice = item.quantity * item.unitPrice
    let discountAmount = 0

    if (item.discount.type === "percentage") {
      discountAmount = basePrice * (item.discount.value / 100)
    } else {
      discountAmount = item.discount.value
    }

    return basePrice - discountAmount
  }

  // Calculate tax for an item
  const calculateTax = (item: OrderItem) => {
    if (item.taxExempt) return 0
    return calculateSubtotal(item) * taxRate
  }

  // Calculate order totals
  const calculateTotals = () => {
    let subtotal = 0
    let discountTotal = 0
    let taxTotal = 0

    const safeItems: OrderItem[] = Array.isArray(items) ? items : [];
    safeItems.forEach((item: OrderItem) => {
      const itemSubtotal = item.quantity * item.unitPrice
      subtotal += itemSubtotal

      if (item.discount.type === "percentage") {
        discountTotal += itemSubtotal * (item.discount.value / 100)
      } else {
        discountTotal += item.discount.value
      }

      taxTotal += calculateTax(item)
    })

    const total = subtotal - discountTotal + taxTotal

    return {
      subtotal,
      discountTotal,
      taxTotal,
      total,
    }
  }

  // Handle drag end for reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const reorderedItems = Array.from(items)
    const [removed] = reorderedItems.splice(result.source.index, 1)
    reorderedItems.splice(result.destination.index, 0, removed)

    onItemsChange(reorderedItems)
  }

  // Start editing a cell
  const startEditing = (id: string, field: string, value: string | number) => {
    setEditingCell({ id, field })
    setEditValue(value.toString())
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  // Save edited value
  const saveEdit = () => {
    if (!editingCell) return

    const { id, field } = editingCell
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        if (field === "quantity") {
          const quantity = Number.parseInt(editValue, 10)
          return { ...item, quantity: isNaN(quantity) || quantity < 1 ? 1 : quantity }
        } else if (field === "unitPrice") {
          const price = Number.parseFloat(editValue)
          return { ...item, unitPrice: isNaN(price) || price < 0 ? 0 : price }
        }
      }
      return item
    })

    onItemsChange(updatedItems)
    setEditingCell(null)
  }

  // Handle key press in editable cell
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit()
    } else if (e.key === "Escape") {
      setEditingCell(null)
    }
  }

  // Remove an item
  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  // Duplicate an item
  const duplicateItem = (item: OrderItem) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      notes: "",
    }
    onItemsChange([...items, newItem])
  }

  // Update discount
  const updateDiscount = (item: OrderItem, updates: Partial<OrderItem["discount"]>) => {
    const updatedItems = items.map((i) => {
      if (i.id === item.id) {
        return {
          ...i,
          discount: {
            ...i.discount,
            ...updates,
          },
        }
      }
      return i
    })
    onItemsChange(updatedItems)
  }

  // Toggle tax exempt status
  const toggleTaxExempt = (id: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, taxExempt: !item.taxExempt }
      }
      return item
    })
    onItemsChange(updatedItems)
  }

  // Update notes
  const updateNotes = (id: string, notes: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, notes }
      }
      return item
    })
    onItemsChange(updatedItems)
    setNotesDialogItem(null)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-16">Image</TableHead>
                <TableHead className="w-48">SKU/Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-24 text-right">Quantity</TableHead>
                <TableHead className="w-32 text-right">Unit Price</TableHead>
                <TableHead className="w-32 text-right">Discount</TableHead>
                <TableHead className="w-24 text-right">Tax</TableHead>
                <TableHead className="w-32 text-right">Subtotal</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <Droppable droppableId="order-items">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {items.map((item, index) => {
                    const subtotal = calculateSubtotal(item)
                    const tax = calculateTax(item)
                    const hasDiscount = item.discount.value > 0
                    const hasNotes = item.notes.length > 0

                    return (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "group relative",
                              item.taxExempt && "bg-muted/30",
                              hasDiscount && "border-l-4 border-l-yellow-400",
                            )}
                          >
                            <TableCell className="p-2" {...provided.dragHandleProps}>
                              <div className="flex h-full items-center justify-center text-muted-foreground">
                                <GripVertical className="h-5 w-5" />
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                                {hasNotes && (
                                  <Badge variant="outline" className="text-xs">
                                    Has notes
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden max-w-xs truncate md:table-cell">{item.description}</TableCell>
                            <TableCell className="text-right">
                              {editingCell?.id === item.id && editingCell?.field === "quantity" ? (
                                <Input
                                  ref={inputRef}
                                  type="number"
                                  min="1"
                                  className="h-8 w-16"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={saveEdit}
                                  onKeyDown={handleKeyPress}
                                />
                              ) : (
                                <div
                                  className="cursor-pointer rounded px-2 py-1 hover:bg-muted"
                                  onClick={() => startEditing(item.id, "quantity", item.quantity)}
                                >
                                  {item.quantity}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingCell?.id === item.id && editingCell?.field === "unitPrice" ? (
                                <Input
                                  ref={inputRef}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="h-8 w-24"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={saveEdit}
                                  onKeyDown={handleKeyPress}
                                />
                              ) : (
                                <div
                                  className="cursor-pointer rounded px-2 py-1 hover:bg-muted"
                                  onClick={() => startEditing(item.id, "unitPrice", item.unitPrice)}
                                >
                                  {formatCurrency(item.unitPrice)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <div>
                                  {item.discount.value > 0
                                    ? item.discount.type === "percentage"
                                      ? `${item.discount.value}%`
                                      : formatCurrency(item.discount.value)
                                    : "-"}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setDiscountDialogItem(item)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <div>{item.taxExempt ? "Exempt" : formatCurrency(tax)}</div>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Info className="h-3.5 w-3.5" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent side="left" className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Tax Settings</h4>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id={`tax-exempt-${item.id}`}
                                          checked={item.taxExempt}
                                          onCheckedChange={() => toggleTaxExempt(item.id)}
                                        />
                                        <Label htmlFor={`tax-exempt-${item.id}`}>Tax Exempt</Label>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.taxExempt
                                          ? "This item is exempt from tax."
                                          : `Tax rate: ${(taxRate * 100).toFixed(2)}%`}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(subtotal + tax)}</TableCell>
                            <TableCell className="p-2">
                              <div className="flex flex-col space-y-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="w-0 p-0 relative">
                              <div className="absolute right-16 top-1/2 hidden -translate-y-1/2 space-x-1 rounded-md border bg-background p-1 shadow-sm group-hover:flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setNotesDialogItem(item)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => duplicateItem(item)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </div>
      </DragDropContext>

      {/* Add Item Button */}
      <div className="flex justify-center">
        <Button variant="outline" className="w-full max-w-xs" onClick={onAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Order Totals */}
      <div className="ml-auto w-full space-y-2 rounded-md border p-4 md:w-80">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discount:</span>
          <span>-{formatCurrency(totals.discountTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax:</span>
          <span>{formatCurrency(totals.taxTotal)}</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes Dialog */}
      <Dialog open={!!notesDialogItem} onOpenChange={(open) => !open && setNotesDialogItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Item Notes</DialogTitle>
          </DialogHeader>
          {notesDialogItem && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                  <Image
                    src={notesDialogItem.image || "/placeholder.svg"}
                    alt={notesDialogItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{notesDialogItem.name}</div>
                  <div className="text-xs text-muted-foreground">SKU: {notesDialogItem.sku}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-notes">Notes</Label>
                <Textarea
                  id="item-notes"
                  placeholder="Add notes about this item (special instructions, customizations, etc.)"
                  value={notesDialogItem.notes}
                  onChange={(e) => {
                    const updatedItem = { ...notesDialogItem, notes: e.target.value }
                    setNotesDialogItem(updatedItem)
                  }}
                  rows={5}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setNotesDialogItem(null)}>
                  Cancel
                </Button>
                <Button onClick={() => updateNotes(notesDialogItem.id, notesDialogItem.notes)}>Save Notes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={!!discountDialogItem} onOpenChange={(open) => !open && setDiscountDialogItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
          </DialogHeader>
          {discountDialogItem && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                  <Image
                    src={discountDialogItem.image || "/placeholder.svg"}
                    alt={discountDialogItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{discountDialogItem.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(discountDialogItem.unitPrice)} × {discountDialogItem.quantity}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Discount Type</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={discountDialogItem.discount.type === "percentage" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => updateDiscount(discountDialogItem, { type: "percentage" })}
                  >
                    Percentage (%)
                  </Button>
                  <Button
                    variant={discountDialogItem.discount.type === "amount" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => updateDiscount(discountDialogItem, { type: "amount" })}
                  >
                    Amount ($)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-value">
                  {discountDialogItem.discount.type === "percentage" ? "Percentage" : "Amount"}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  min="0"
                  step={discountDialogItem.discount.type === "percentage" ? "1" : "0.01"}
                  value={discountDialogItem.discount.value}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    updateDiscount(discountDialogItem, {
                      value: isNaN(value) ? 0 : value,
                    })
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-reason">Reason</Label>
                <Select
                  value={discountDialogItem.discount.reason}
                  onValueChange={(value) => updateDiscount(discountDialogItem, { reason: value })}
                >
                  <SelectTrigger id="discount-reason">
                    <SelectValue placeholder="Select a reason">No reason</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No reason">No reason</SelectItem>
                    <SelectItem value="Seasonal promotion">Seasonal promotion</SelectItem>
                    <SelectItem value="Loyalty discount">Loyalty discount</SelectItem>
                    <SelectItem value="Bulk purchase">Bulk purchase</SelectItem>
                    <SelectItem value="Damaged item">Damaged item</SelectItem>
                    <SelectItem value="Manager approval">Manager approval</SelectItem>
                    <SelectItem value="Customer satisfaction">Customer satisfaction</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDiscountDialogItem(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setDiscountDialogItem(null)}>Apply Discount</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
