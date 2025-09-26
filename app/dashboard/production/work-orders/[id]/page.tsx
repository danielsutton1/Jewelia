import { WorkOrderDetail } from "@/components/production/work-order-detail"

interface WorkOrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WorkOrderDetailPage({ params }: WorkOrderDetailPageProps) {
  const resolvedParams = await params;
  return <WorkOrderDetail workOrderId={resolvedParams.id} />
}
