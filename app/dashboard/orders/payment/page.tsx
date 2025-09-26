import { PaymentInterface } from "@/components/orders/payment-interface"

export default function PaymentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Payment</h1>
          <p className="text-muted-foreground">Process payment for order #ORD-1234</p>
        </div>
      </div>

      <PaymentInterface />
    </div>
  )
}
