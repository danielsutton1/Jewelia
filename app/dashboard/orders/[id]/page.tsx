import { OrderDetailInterface } from "@/components/orders/order-detail-interface"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <OrderDetailInterface orderId={resolvedParams.id} />
}
