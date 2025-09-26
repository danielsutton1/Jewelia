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

export function CreateQuoteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [quoteDetails, setQuoteDetails] = useState({
    customer: "",
    quoteNumber: `QT-${Date.now().toString().slice(-6)}`,
    quoteType: "",
    expiryDate: "",
    staff: "",
    items: [{ description: "", quantity: 1, price: "", sku: "" }],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: "",
    internalNotes: "",
    designFiles: [] as File[],
    status: "draft"
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setQuoteDetails(prev => ({
      ...prev,
      designFiles: [...prev.designFiles, ...files]
    }))
  }

  const removeFile = (index: number) => {
    setQuoteDetails(prev => ({
      ...prev,
      designFiles: prev.designFiles.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...quoteDetails.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity.toString()) || 0
      return sum + (price * quantity)
    }, 0)
    
    const discount = quoteDetails.discount
    const tax = quoteDetails.tax
    const total = subtotal - discount + tax
    
    setQuoteDetails({ 
      ...quoteDetails, 
      items: newItems,
      subtotal,
      total
    })
  }

  const addItem = () => {
    setQuoteDetails({
      ...quoteDetails,
      items: [...quoteDetails.items, { description: "", quantity: 1, price: "", sku: "" }]
    })
  }
  
  const removeItem = (index: number) => {
    const newItems = quoteDetails.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity.toString()) || 0
      return sum + (price * quantity)
    }, 0)
    const total = subtotal - quoteDetails.discount + quoteDetails.tax
    setQuoteDetails({ ...quoteDetails, items: newItems, subtotal, total });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const action = quoteDetails.status === "draft" ? "saved as draft" : "sent to customer"
    toast.success(`Quote ${action} successfully!`)
    setQuoteDetails({
      customer: "",
      quoteNumber: `QT-${Date.now().toString().slice(-6)}`,
      quoteType: "",
      expiryDate: "",
      staff: "",
      items: [{ description: "", quantity: 1, price: "", sku: "" }],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      notes: "",
      internalNotes: "",
      designFiles: [],
      status: "draft"
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quote</DialogTitle>
          <DialogDescription>
            Generate a professional quote for jewelry, repairs, or custom designs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Customer Name or ID" 
                value={quoteDetails.customer} 
                onChange={(e) => setQuoteDetails({...quoteDetails, customer: e.target.value})}
                required
              />
              <Input 
                placeholder="Quote Number" 
                value={quoteDetails.quoteNumber} 
                onChange={(e) => setQuoteDetails({...quoteDetails, quoteNumber: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select onValueChange={(value) => setQuoteDetails({...quoteDetails, quoteType: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Quote Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="custom-design">Custom Design</SelectItem>
                  <SelectItem value="appraisal">Appraisal</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="date"
                placeholder="Expiry Date" 
                value={quoteDetails.expiryDate} 
                onChange={(e) => setQuoteDetails({...quoteDetails, expiryDate: e.target.value})}
              />
              <Input 
                placeholder="Staff Member" 
                value={quoteDetails.staff} 
                onChange={(e) => setQuoteDetails({...quoteDetails, staff: e.target.value})}
              />
            </div>

            {/* Design Files */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Design Files</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Files
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,.sketch"
              />
              {quoteDetails.designFiles.length > 0 && (
                <div className="space-y-2">
                  {quoteDetails.designFiles.map((file, index) => (
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
              <h4 className="text-sm font-medium mb-3">Quote Items</h4>
              <div className="space-y-3">
                {quoteDetails.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4">
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
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(index)} 
                            disabled={quoteDetails.items.length <= 1}
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
                    <span>${quoteDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={quoteDetails.discount}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0
                        setQuoteDetails({
                          ...quoteDetails,
                          discount,
                          total: quoteDetails.subtotal - discount + quoteDetails.tax
                        })
                      }}
                      className="w-24 text-right"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={quoteDetails.tax}
                      onChange={(e) => {
                        const tax = parseFloat(e.target.value) || 0
                        setQuoteDetails({
                          ...quoteDetails,
                          tax,
                          total: quoteDetails.subtotal - quoteDetails.discount + tax
                        })
                      }}
                      className="w-24 text-right"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${quoteDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Customer Notes</label>
                <Textarea 
                  placeholder="Notes for the customer..."
                  value={quoteDetails.notes} 
                  onChange={(e) => setQuoteDetails({...quoteDetails, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Internal Notes (Private)</label>
                <Textarea 
                  placeholder="Internal notes..."
                  value={quoteDetails.internalNotes} 
                  onChange={(e) => setQuoteDetails({...quoteDetails, internalNotes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setQuoteDetails({...quoteDetails, status: "draft"})
                handleSubmit({ preventDefault: () => {} } as React.FormEvent)
              }}
            >
              Save as Draft
            </Button>
            <Button 
              type="submit"
              onClick={() => setQuoteDetails({...quoteDetails, status: "sent"})}
            >
              Send to Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
 