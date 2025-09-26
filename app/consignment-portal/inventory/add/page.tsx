import type { Metadata } from "next"
import { AddItemForm } from "@/components/consignment-portal/inventory/add-item-form"
import { ConsignmentPortalLayout } from "@/components/consignment-portal/layout"

export const metadata: Metadata = {
  title: "Add New Item | Partner Portal",
  description: "Add a new item to your consignment inventory",
}

export default function AddItemPage() {
  return (
    <ConsignmentPortalLayout>
      <AddItemForm />
    </ConsignmentPortalLayout>
  )
}
