"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Barcode, Trash2, Plus, Minus, UserPlus, Search, CreditCard, DollarSign, Mail, Printer } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), { ssr: false })

const stripePromise = loadStripe('pk_test_mock_key') // Replace with your real publishable key

function CardPaymentForm({ amount, onSuccess, onError }: { amount: number, onSuccess: () => void, onError: (msg: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleCardPay = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Get client secret from backend
      const res = await fetch('/api/pos/stripe-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'usd' })
      })
      const { client_secret } = await res.json()
      // Confirm card payment (mocked for now)
      // In real app: await stripe.confirmCardPayment(client_secret, { payment_method: { card: elements.getElement(CardElement)! } })
      setTimeout(() => {
        setLoading(false)
        onSuccess()
      }, 1000)
    } catch (err) {
      setLoading(false)
      onError('Payment failed')
    }
  }

  return (
    <form onSubmit={handleCardPay} className="space-y-4">
      <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      <Button type="submit" disabled={loading} className="w-full mt-2">
        {loading ? 'Processing...' : 'Pay with Card'}
      </Button>
    </form>
  )
}

export default function POSPage() {
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([])
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; phone: string; email: string } | null>(null)
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "" })
  const [addingNew, setAddingNew] = useState(false)
  const [paymentType, setPaymentType] = useState("cash")
  const [amountReceived, setAmountReceived] = useState("")
  const [paymentError, setPaymentError] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [products, setProducts] = useState<{ id: string; name: string; price: number; stock: number }[]>([])
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string; email: string }[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data.customers || []))
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const addToCart = (product: { id: string; name: string; price: number; stock: number }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      } else {
        return [...prev, { ...product, qty: 1 }]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const adjustQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const handleCompleteSale = async () => {
    setShowPaymentDialog(false)
    setShowReceipt(true)
    await fetch('/api/pos/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customer: selectedCustomer,
        payment: { type: paymentType, amount: amountReceived }
      })
    })
    setCart([])
    setSelectedCustomer(null)
    setAmountReceived("")
    setPaymentError("")
  }

  const handleScan = (result: any) => {
    if (result && result.text) {
      setScanResult(result.text)
      setShowScanner(false)
      const found = products.find((p: { id: string }) => p.id === result.text)
      if (found) addToCart(found)
    }
  }

  return (
    <div className="max-w-md mx-auto p-2 sm:p-4 flex flex-col gap-3 sm:gap-4 min-h-screen bg-gray-50">
      <Card className="sticky top-0 z-10">
        <CardHeader className="flex flex-row items-center gap-2 p-2 sm:p-3">
          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
          <CardTitle className="text-base sm:text-lg pos-heading">Mobile POS</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 p-2 sm:p-3">
          <Input
            placeholder="Search by name or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-h-[44px] min-w-[44px]"
          />
          <Button variant="outline" className="shrink-0 min-h-[44px] min-w-[44px]" title="Scan Barcode" onClick={() => setShowScanner(true)}>
            <Barcode className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </CardContent>
      </Card>

      <div className="flex-1 flex flex-col gap-3 sm:gap-4">
        <div>
          <h2 className="font-semibold mb-2 text-sm sm:text-base">Products</h2>
          <div className="grid grid-cols-1 gap-2">
            {filteredProducts.length === 0 ? (
              <div className="text-muted-foreground text-sm">No products found.</div>
            ) : (
              filteredProducts.map((p) => (
                <Card key={p.id} className="flex flex-row items-center justify-between p-2 sm:p-3">
                  <div>
                    <div className="font-medium text-sm sm:text-base">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.id}</div>
                    <div className="text-sm font-semibold">${p.price.toLocaleString()}</div>
                  </div>
                  <Button size="sm" onClick={() => addToCart(p)} className="min-h-[44px] min-w-[44px]">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2 text-sm sm:text-base">Cart</h2>
          {cart.length === 0 ? (
            <div className="text-muted-foreground text-sm">Cart is empty.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {cart.map((item) => (
                <Card key={item.id} className="flex flex-row items-center justify-between p-2 sm:p-3">
                  <div>
                    <div className="font-medium text-sm sm:text-base">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.id}</div>
                    <div className="text-sm">${item.price.toLocaleString()} x {item.qty}</div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button size="icon" variant="outline" onClick={() => adjustQty(item.id, -1)} className="min-h-[44px] min-w-[44px]">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.qty}</span>
                    <Button size="icon" variant="outline" onClick={() => adjustQty(item.id, 1)} className="min-h-[44px] min-w-[44px]">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => removeFromCart(item.id)} className="min-h-[44px] min-w-[44px]">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center mt-3 sm:mt-4">
            <div className="font-bold text-base sm:text-lg">Total: ${total.toLocaleString()}</div>
            <Button size="lg" className="ml-2 min-h-[44px] min-w-[44px]" disabled={cart.length === 0} onClick={() => setShowCustomerDialog(true)}>
              Checkout
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-md w-full mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Select Customer</DialogTitle>
          </DialogHeader>
          {selectedCustomer ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="font-medium text-sm sm:text-base">{selectedCustomer.name}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{selectedCustomer.phone} • {selectedCustomer.email}</div>
              <div className="text-green-600 font-semibold mt-2 text-sm sm:text-base">Customer selected! Ready for payment.</div>
              <DialogFooter className="gap-2 sm:gap-3">
                <Button onClick={() => { setShowCustomerDialog(false); setShowPaymentDialog(true); }} className="min-h-[44px] min-w-[44px]">Continue to Payment</Button>
                <Button variant="outline" onClick={() => setSelectedCustomer(null)} className="min-h-[44px] min-w-[44px]">Change Customer</Button>
              </DialogFooter>
            </div>
          ) : addingNew ? (
            <div className="space-y-2 sm:space-y-3">
              <Input placeholder="Name" value={newCustomer.name} onChange={e => setNewCustomer(c => ({ ...c, name: e.target.value }))} className="min-h-[44px] min-w-[44px]" />
              <Input placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer(c => ({ ...c, phone: e.target.value }))} className="min-h-[44px] min-w-[44px]" />
              <Input placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer(c => ({ ...c, email: e.target.value }))} className="min-h-[44px] min-w-[44px]" />
              <DialogFooter className="gap-2 sm:gap-3">
                <Button onClick={() => {
                  setSelectedCustomer({ ...newCustomer, id: `CUST-${Date.now()}` });
                  setAddingNew(false);
                }} disabled={!newCustomer.name} className="min-h-[44px] min-w-[44px]">Add & Select</Button>
                <Button variant="outline" onClick={() => setAddingNew(false)} className="min-h-[44px] min-w-[44px]">Cancel</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, phone, or email"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="flex-1 min-h-[44px] min-w-[44px]"
                />
                <Button variant="outline" onClick={() => setAddingNew(true)} title="Add New Customer" className="min-h-[44px] min-w-[44px]">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto mt-2">
                {filteredCustomers.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No customers found.</div>
                ) : (
                  filteredCustomers.map((c) => (
                    <Card key={c.id} className="flex flex-row items-center justify-between p-2 sm:p-3 mb-1">
                      <div>
                        <div className="font-medium text-sm sm:text-base">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.phone} • {c.email}</div>
                      </div>
                      <Button size="sm" onClick={() => setSelectedCustomer(c)} className="min-h-[44px] min-w-[44px]">
                        Select
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md w-full mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button variant={paymentType === "cash" ? "default" : "outline"} onClick={() => setPaymentType("cash")} className="min-h-[44px] min-w-[44px]"> <DollarSign className="h-4 w-4 mr-1" /> Cash</Button>
              <Button variant={paymentType === "card" ? "default" : "outline"} onClick={() => setPaymentType("card")} className="min-h-[44px] min-w-[44px]"> <CreditCard className="h-4 w-4 mr-1" /> Card</Button>
              <Button variant={paymentType === "check" ? "default" : "outline"} onClick={() => setPaymentType("check")} className="min-h-[44px] min-w-[44px]">Check</Button>
              <Button variant={paymentType === "other" ? "default" : "outline"} onClick={() => setPaymentType("other")} className="min-h-[44px] min-w-[44px]">Other</Button>
            </div>
            <div>
              <Input
                type="number"
                min={0}
                placeholder={paymentType === "cash" ? "Amount Received" : "Amount"}
                value={amountReceived}
                onChange={e => setAmountReceived(e.target.value)}
                className="min-h-[44px] min-w-[44px]"
              />
              {paymentType === "cash" && amountReceived && (
                <div className="text-sm mt-1">Change: <span className="font-semibold">${(parseFloat(amountReceived) - total > 0 ? (parseFloat(amountReceived) - total).toLocaleString() : 0)}</span></div>
              )}
            </div>
            {paymentError && <div className="text-red-600 text-sm">{paymentError}</div>}
            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                onClick={() => {
                  if (!amountReceived || parseFloat(amountReceived) < total) {
                    setPaymentError("Insufficient amount.")
                    return
                  }
                  setPaymentError("")
                  handleCompleteSale()
                }}
                disabled={!amountReceived || parseFloat(amountReceived) < total}
                className="min-h-[44px] min-w-[44px]"
              >
                Complete Sale
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="min-h-[44px] min-w-[44px]">Cancel</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md w-full mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Sale Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 sm:space-y-3">
            <div className="font-semibold text-green-600 text-sm sm:text-base">Payment received!</div>
            <div className="text-xs sm:text-sm">Customer: {selectedCustomer?.name || "-"}</div>
            <div className="text-xs sm:text-sm">Payment Type: {paymentType}</div>
            <div className="text-xs sm:text-sm">Total: ${total.toLocaleString()}</div>
            <div className="mt-2">
              <div className="font-medium mb-1 text-sm sm:text-base">Items:</div>
              <ul className="list-disc ml-5 text-xs sm:text-sm">
                {cart.map((item) => (
                  <li key={item.id}>{item.name} x {item.qty} (${item.price.toLocaleString()} each)</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button variant="outline" className="min-h-[44px] min-w-[44px]"><Printer className="h-4 w-4 mr-1" /> Print</Button>
              <Button variant="outline" className="min-h-[44px] min-w-[44px]"><Mail className="h-4 w-4 mr-1" /> Email Receipt</Button>
              <Button onClick={() => { setShowReceipt(false); setSelectedCustomer(null); setCart([]); }} className="min-h-[44px] min-w-[44px]">New Sale</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white rounded-lg p-4 max-w-xs w-full flex flex-col items-center">
            <div className="mb-2 font-semibold text-sm sm:text-base">Scan Product Barcode</div>
            <div className="w-full h-48 mb-2">
              <BarcodeScanner
                onUpdate={(err, result) => {
                  if (result) handleScan(result)
                }}
                width={250}
                height={180}
              />
            </div>
            <Button variant="outline" onClick={() => setShowScanner(false)} className="min-h-[44px] min-w-[44px]">Cancel</Button>
          </div>
        </div>
      )}
      {scanResult && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border rounded shadow-lg px-4 py-2 z-40">
          <div className="font-medium text-sm sm:text-base">Scanned: {scanResult}</div>
          <Button size="sm" variant="outline" onClick={() => setScanResult(null)} className="min-h-[44px] min-w-[44px]">Dismiss</Button>
        </div>
      )}
    </div>
  )
} 
 // FORCE DEPLOYMENT - Thu Aug 21 19:21:24 EDT 2025 - All Supabase .or() method errors fixed
