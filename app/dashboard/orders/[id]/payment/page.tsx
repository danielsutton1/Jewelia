"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export default function OrderPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [bankDetails, setBankDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Payment Processed", description: `Payment for order ${orderId} has been processed.` });
    router.push(`/dashboard/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-4">Process Payment</h1>
      <p className="mb-2">Order ID: <span className="font-mono">{orderId}</span></p>
      <div className="p-6 border rounded-md bg-muted space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Amount</label>
            <Input type="number" min={0} step={0.01} placeholder="Enter payment amount" required value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium mb-1">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {paymentMethod === "Credit Card" && (
            <>
              <div>
                <label className="block font-medium mb-1">Cardholder Name</label>
                <Input placeholder="Name on card" required value={cardholder} onChange={e => setCardholder(e.target.value)} />
              </div>
              <div>
                <label className="block font-medium mb-1">Card Number</label>
                <Input type="text" inputMode="numeric" maxLength={19} placeholder="1234 5678 9012 3456" required value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Expiry</label>
                  <Input type="text" inputMode="numeric" maxLength={5} placeholder="MM/YY" required value={expiry} onChange={e => setExpiry(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-1">CVV</label>
                  <Input type="text" inputMode="numeric" maxLength={4} placeholder="123" required value={cvv} onChange={e => setCvv(e.target.value)} />
                </div>
              </div>
            </>
          )}
          {paymentMethod === "Bank Transfer" && (
            <div>
              <label className="block font-medium mb-1">Bank Details / Reference</label>
              <Input placeholder="Bank name, reference, etc." required value={bankDetails} onChange={e => setBankDetails(e.target.value)} />
            </div>
          )}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" type="button" onClick={() => router.push(`/dashboard/orders/${orderId}`)}>Cancel</Button>
            <Button type="submit">Process Payment</Button>
          </div>
        </form>
        <div className="text-muted-foreground text-sm pt-4">
          This is a placeholder for the payment processing form. Implement real payment logic here.
        </div>
      </div>
    </div>
  );
} 
 
 