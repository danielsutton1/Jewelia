"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export function LogPurchaseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [purchaseDetails, setPurchaseDetails] = useState({
    customer: "",
    purchaseNumber: `PUR-${Date.now().toString().slice(-6)}`,
    purchaseDate: new Date().toISOString().split('T')[0],
    staff: "",
    items: [{ description: "", quantity: 1, price: "", sku: "", warranty: false }],
    subtotal: 0,
    tax: 0,
    total: 0,
    paymentMethod: "",
    paymentReference: "",
    receiptFiles: [] as File[],
    notes: ""
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPurchaseDetails(prev => ({
      ...prev,
      receiptFiles: [...prev.receiptFiles, ...files]
    }))
  }

  const removeFile = (index: number) => {
    setPurchaseDetails(prev => ({
      ...prev,
      receiptFiles: prev.receiptFiles.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
    const newItems = [...purchaseDetails.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity.toString()) || 0
      return sum + (price * quantity)
    }, 0)
    
    const tax = purchaseDetails.tax
    const total = subtotal + tax
    
    setPurchaseDetails({ 
      ...purchaseDetails, 
      items: newItems,
      subtotal,
      total
    })
  }

  const addItem = () => {
    setPurchaseDetails({
      ...purchaseDetails,
      items: [...purchaseDetails.items, { description: "", quantity: 1, price: "", sku: "", warranty: false }]
    })
  }
  
  const removeItem = (index: number) => {
    const newItems = purchaseDetails.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity.toString()) || 0
      return sum + (price * quantity)
    }, 0)
    const total = subtotal + purchaseDetails.tax
    setPurchaseDetails({ ...purchaseDetails, items: newItems, subtotal, total });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Purchase logged successfully!")
    setPurchaseDetails({
      customer: "",
      purchaseNumber: `PUR-${Date.now().toString().slice(-6)}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      staff: "",
      items: [{ description: "", quantity: 1, price: "", sku: "", warranty: false }],
      subtotal: 0,
      tax: 0,
      total: 0,
      paymentMethod: "",
      paymentReference: "",
      receiptFiles: [],
      notes: ""
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Purchase</DialogTitle>
          <DialogDescription>
            Record a completed jewelry sale with full details and documentation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Customer Name or ID" 
                value={purchaseDetails.customer} 
                onChange={(e) => setPurchaseDetails({...purchaseDetails, customer: e.target.value})}
                required
              />
              <Input 
                placeholder="Purchase Number" 
                value={purchaseDetails.purchaseNumber} 
                onChange={(e) => setPurchaseDetails({...purchaseDetails, purchaseNumber: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="date"
                placeholder="Purchase Date" 
                value={purchaseDetails.purchaseDate} 
                onChange={(e) => setPurchaseDetails({...purchaseDetails, purchaseDate: e.target.value})}
                required
              />
              <Input 
                placeholder="Staff Member" 
                value={purchaseDetails.staff} 
                onChange={(e) => setPurchaseDetails({...purchaseDetails, staff: e.target.value})}
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Receipt/Invoice Files</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Receipts
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {purchaseDetails.receiptFiles.length > 0 && (
                <div className="space-y-2">
                  {purchaseDetails.receiptFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Items */}
            <div>
              <h4 className="text-sm font-medium mb-3">Items Purchased</h4>
              <div className="space-y-3">
                {purchaseDetails.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-3">
                          <Input
                            placeholder="Item Description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            placeholder="SKU"
                            value={item.sku}
                            onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                            required
                            min="1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-1">
                          <span className="text-sm font-medium">
                            ${((parseFloat(item.price) || 0) * (parseInt(item.quantity.toString()) || 0)).toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={item.warranty}
                              onChange={(e) => handleItemChange(index, 'warranty', e.target.checked)}
                            />
                            Warranty
                          </label>
                        </div>
                        <div className="col-span-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(index)} 
                            disabled={purchaseDetails.items.length <= 1}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-3">
                + Add Item
              </Button>
            </div>

            {/* Totals */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${purchaseDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={purchaseDetails.tax}
                      onChange={(e) => {
                        const tax = parseFloat(e.target.value) || 0
                        setPurchaseDetails({
                          ...purchaseDetails,
                          tax,
                          total: purchaseDetails.subtotal + tax
                        })
                      }}
                      className="w-24 text-right"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${purchaseDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <div className="grid grid-cols-3 gap-4">
              <Select onValueChange={(value) => setPurchaseDetails({...purchaseDetails, paymentMethod: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="debit-card">Debit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="financing">Financing</SelectItem>
                  <SelectItem value="layaway">Layaway</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Payment Reference/Transaction ID" 
                value={purchaseDetails.paymentReference} 
                onChange={(e) => setPurchaseDetails({...purchaseDetails, paymentReference: e.target.value})}
              />
              <Input 
                type="number"
                placeholder="Amount Paid" 
                value={purchaseDetails.total.toFixed(2)}
                readOnly
                className="bg-muted"
              />
            </div>

            {/* Notes */}
            <Textarea 
              placeholder="Additional notes about the purchase..."
              value={purchaseDetails.notes} 
              onChange={(e) => setPurchaseDetails({...purchaseDetails, notes: e.target.value})}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Log Purchase</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
 