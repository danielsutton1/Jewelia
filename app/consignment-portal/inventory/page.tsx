import type { Metadata } from "next"
import { InventoryManagement } from "@/components/consignment-portal/inventory/inventory-management"
import { ConsignmentPortalLayout } from "@/components/consignment-portal/layout"

export const metadata: Metadata = {
  title: "Inventory Management | Partner Portal",
  description: "Manage your consigned inventory items",
}

export default function InventoryPage() {
  return (
    <ConsignmentPortalLayout>
      <InventoryManagement />
    </ConsignmentPortalLayout>
  )
}
