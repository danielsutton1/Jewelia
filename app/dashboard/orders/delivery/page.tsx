import { DeliveryMethodSelection } from "@/components/orders/delivery-method-selection"

export default function DeliveryMethodPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Delivery</h1>
          <p className="text-muted-foreground">Choose how you want to receive your order</p>
        </div>
      </div>

      <DeliveryMethodSelection />
    </div>
  )
}
