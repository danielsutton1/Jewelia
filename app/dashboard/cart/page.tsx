"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const TAX_RATE = 0.0825

export default function CartPage() {
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) setCart(JSON.parse(saved))
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  // Load products (mock, replace with API in future)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const mod = await import("@/components/products/products-table")
        setProducts(mod.products || [])
      } catch (error) {
        console.error("Failed to load products:", error)
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Cart products with details
  const cartProducts = products.filter(p => cart.some(item => item.id === p.id))
    .map(p => ({
      ...p,
      quantity: cart.find(item => item.id === p.id)?.quantity || 1
    }))

  const subtotal = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const handleRemove = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }
  const handleUpdateQty = (id: string, qty: number, stock: number) => {
    if (qty < 1) return
    if (qty > stock) {
      toast.error("Cannot exceed available stock!")
      return
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item))
  }
  const handleProceed = () => {
    // Save as order and redirect to checkout
    localStorage.setItem("checkoutOrder", JSON.stringify(cartProducts.map(p => ({
      id: `item-${p.id}`,
      image: p.image,
      sku: p.sku,
      name: p.name,
      description: `${p.category} - ${p.name}`,
      quantity: p.quantity,
      unitPrice: p.price,
      discount: { type: "percentage", value: 0, reason: "" },
      taxExempt: false,
      notes: "",
    }))))
    toast.success("Proceeding to checkout...")
    window.location.href = "/dashboard/checkout"
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p>Loading cart...</p>
      </div>
    )
  }

  if (cartProducts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="mb-8 text-gray-500">Browse our products and add items to your cart.</p>
        <Link href="/dashboard/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <ul className="divide-y divide-gray-200 mb-8">
        {cartProducts.map(p => (
          <li key={p.id} className="flex items-center gap-4 py-4">
            <Image src={p.image} alt={p.name} width={64} height={64} className="rounded border w-16 h-16 object-cover" />
            <div className="flex-1">
              <div className="font-semibold text-lg">{p.name}</div>
              <div className="text-sm text-gray-500">{p.category} | SKU: {p.sku}</div>
              <div className="text-sm text-gray-500">${p.price.toLocaleString()} each</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => handleUpdateQty(p.id, p.quantity - 1, p.stock)} disabled={p.quantity <= 1}>-</Button>
              <span className="w-8 text-center">{p.quantity}</span>
              <Button size="icon" variant="outline" onClick={() => handleUpdateQty(p.id, p.quantity + 1, p.stock)} disabled={p.quantity >= p.stock}>+</Button>
            </div>
            <Button size="icon" variant="ghost" onClick={() => handleRemove(p.id)} aria-label="Remove">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-4 items-end mb-8">
        <div className="text-lg">Subtotal: <span className="font-semibold">${subtotal.toLocaleString()}</span></div>
        <div className="text-lg">Tax: <span className="font-semibold">${tax.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
        <div className="text-xl font-bold">Total: <span className="text-emerald-700">${total.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
      </div>
      <div className="flex gap-4 justify-end">
        <Link href="/dashboard/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        <Button onClick={handleProceed} className="bg-emerald-600 hover:bg-emerald-700 text-white">Proceed to Checkout</Button>
      </div>
    </div>
  )
} 