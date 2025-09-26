import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Work Orders | Jewelia CRM",
  description: "Manage jewelry production work orders",
}

// Mock data for demonstration
const workOrders = [
  {
    id: "WO-12345",
    salesOrderId: "SO-7890",
    customerName: "Emma Thompson",
    itemDescription: "Custom Diamond Engagement Ring",
    currentStage: "Stone Setting",
    dueDate: "2023-06-15",
    priority: "High",
    status: "In Production",
  },
  {
    id: "WO-12346",
    salesOrderId: "SO-7891",
    customerName: "James Wilson",
    itemDescription: "18K Gold Chain Necklace",
    currentStage: "Polishing",
    dueDate: "2023-06-20",
    priority: "Medium",
    status: "In Production",
  },
  {
    id: "WO-12347",
    salesOrderId: "SO-7892",
    customerName: "Sophia Martinez",
    itemDescription: "Sapphire and Diamond Earrings",
    currentStage: "Quality Control",
    dueDate: "2023-06-10",
    priority: "High",
  },
]

const WorkOrdersPage = () => {
  return (
    <div>
      <h1>Work Orders</h1>
      <p>This is the work orders page.</p>
    </div>
  )
}

export default WorkOrdersPage
