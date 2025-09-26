"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function CheckoutPage() {
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "" })
  const [delivery, setDelivery] = useState("pickup")
  const [payment, setPayment] = useState("credit-card")
  const [placed, setPlaced] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("checkoutOrder")
    if (saved) setOrderItems(JSON.parse(saved))
  }, [])

  const subtotal = orderItems.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0)
  const tax = subtotal * 0.0825
  const total = subtotal + tax

  const handlePlaceOrder = () => {
    // Scaffold: send to backend here
    setPlaced(true)
    localStorage.removeItem("cart")
    localStorage.removeItem("checkoutOrder")
    toast.success("Order placed!")
  }

  if (placed) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
        <p className="mb-8 text-gray-500">Your order has been placed and is being processed.</p>
        <Button onClick={() => window.location.href = "/dashboard/products"}>Back to Products</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Forms */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Customer Information</h2>
            <Input placeholder="Full Name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="mb-2" />
            <Input placeholder="Email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="mb-2" />
            <Input placeholder="Phone" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="mb-2" />
            <Input placeholder="Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Delivery Method</h2>
            <div className="flex gap-4">
              <Button variant={delivery === "pickup" ? "default" : "outline"} onClick={() => setDelivery("pickup")}>Pickup</Button>
              <Button variant={delivery === "shipping" ? "default" : "outline"} onClick={() => setDelivery("shipping")}>Shipping</Button>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
            <div className="flex gap-4">
              <Button variant={payment === "credit-card" ? "default" : "outline"} onClick={() => setPayment("credit-card")}>Credit Card</Button>
              <Button variant={payment === "store-credit" ? "default" : "outline"} onClick={() => setPayment("store-credit")}>Store Credit</Button>
            </div>
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4" size="lg" onClick={handlePlaceOrder}>Place Order</Button>
        </div>
        {/* Right: Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <ul className="divide-y divide-gray-200 mb-4">
            {orderItems.map(item => (
              <li key={item.id} className="flex items-center justify-between py-2">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.unitPrice * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 text-right">
            <div>Subtotal: <span className="font-semibold">${subtotal.toLocaleString()}</span></div>
            <div>Tax: <span className="font-semibold">${tax.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
            <div className="text-lg font-bold">Total: <span className="text-emerald-700">${total.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
} 