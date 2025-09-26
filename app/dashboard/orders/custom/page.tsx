export const dynamic = 'force-dynamic'

import { CustomOrderEntry } from "@/components/orders/custom-order-entry"

export default function CustomOrderPage() {
  return (
    <div className="container mx-auto py-6">
      <CustomOrderEntry />
    </div>
  )
}
