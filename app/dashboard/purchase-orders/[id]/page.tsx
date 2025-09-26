import type { Metadata } from "next"
import { PODetail } from "@/components/purchase-orders/po-detail"
import { mockPurchaseOrders } from "@/data/mock-purchase-orders"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Purchase Order Details | Jewelia CRM",
  description: "View and manage purchase order details",
}

interface PurchaseOrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PurchaseOrderDetailPage({ params }: PurchaseOrderDetailPageProps) {
  const resolvedParams = await params;
  const purchaseOrder = mockPurchaseOrders.find((po) => po.id === resolvedParams.id)

  if (!purchaseOrder) {
    notFound()
  }

  return <PODetail purchaseOrder={purchaseOrder} />
}
