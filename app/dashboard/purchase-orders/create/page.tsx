'use client'

import { POCreationForm } from "@/components/purchase-orders/po-creation-form"

export default function CreatePurchaseOrderPage() {
  const handleSubmit = async (po: any, action: "save" | "send") => {
    console.log('Purchase Order submitted:', { po, action })
    // TODO: Implement actual submission logic
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
        <p className="text-muted-foreground mt-2">Create a new purchase order for your suppliers</p>
      </div>

      <POCreationForm onSubmit={handleSubmit} />
    </div>
  )
}
