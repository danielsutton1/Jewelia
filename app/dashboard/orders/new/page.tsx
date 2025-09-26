"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomerForm } from "@/components/customers/customer-form"

export default function CreateOrderPage() {
  const [customer, setCustomer] = useState("")
  const [orderDate, setOrderDate] = useState("")
  const [items, setItems] = useState([{ name: "", quantity: 1, price: "" }])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [guestCheckout, setGuestCheckout] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerEmail, setNewCustomerEmail] = useState("")
  const { toast } = useToast()
  const [customers, setCustomers] = useState<any[]>([])
  const [customerId, setCustomerId] = useState("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (!response.ok) throw new Error("Failed to fetch customers")
      const data = await response.json()
      setCustomers(data.data)
    } catch (error) {
      // handle error
    }
  }

  const handleItemChange = (idx: number, field: string, value: string) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1, price: "" }])
  }

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer || !orderDate || items.length === 0 || items.some(i => !i.name || !i.price)) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          order_date: orderDate,
          items,
          notes,
        }),
      })
      if (!response.ok) throw new Error("Failed to create order")
      toast({ title: "Success", description: "Order created successfully" })
      setCustomer("")
      setOrderDate("")
      setItems([{ name: "", quantity: 1, price: "" }])
      setNotes("")
    } catch (error) {
      toast({ title: "Error", description: "Failed to create order. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomerName || !newCustomerEmail) {
      toast({ title: "Error", description: "Name and email required", variant: "destructive" })
      return
    }
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustomerName, email: newCustomerEmail }),
      })
      if (!response.ok) throw new Error("Failed to add customer")
      const { data: customer } = await response.json()
      setCustomers((prev) => [customer, ...prev])
      setCustomerId(customer.id)
      setCustomer(customer.name + " (" + customer.email + ")")
      setAddCustomerOpen(false)
      setNewCustomerName("")
      setNewCustomerEmail("")
      setGuestCheckout(false)
      toast({ title: "Customer added", description: "New customer added for this order" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add customer. Please try again.", variant: "destructive" })
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
        <p className="text-muted-foreground">Enter order details and submit to create a new order</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer</Label>
              <div className="flex gap-2 items-center">
                <select
                  id="customer"
                  value={guestCheckout ? "guest" : customerId}
                  onChange={e => {
                    if (e.target.value === "guest") {
                      setGuestCheckout(true)
                      setCustomer("Guest Checkout")
                      setCustomerId("")
                    } else {
                      setGuestCheckout(false)
                      setCustomerId(e.target.value)
                      const selected = customers.find(c => c.id === e.target.value)
                      setCustomer(selected ? selected.name + " (" + selected.email + ")" : "")
                    }
                  }}
                  disabled={guestCheckout}
                  className="flex-1 rounded border px-3 py-2"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order-date">Order Date</Label>
              <Input id="order-date" type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Order Items</Label>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={e => handleItemChange(idx, "name", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, "quantity", e.target.value)}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Price"
                      value={item.price}
                      onChange={e => handleItemChange(idx, "price", e.target.value)}
                      className="w-28"
                    />
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(idx)} disabled={items.length === 1}>Remove</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>Add Item</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes (optional)" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Order"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Add New Customer Dialog */}
      <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSuccess={async (customer) => {
              setAddCustomerOpen(false)
              await fetchCustomers()
              setCustomerId(customer.id)
              setCustomer(customer.full_name || (customer.name + (customer.email ? ` (${customer.email})` : "")))
              setGuestCheckout(false)
              // Optionally show a toast here
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 