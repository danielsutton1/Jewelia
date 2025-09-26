import type { Metadata } from "next"
import { PartnerDashboard } from "@/components/consignment-portal/partner-dashboard"
import { ConsignmentPortalLayout } from "@/components/consignment-portal/layout"

export const metadata: Metadata = {
  title: "Partner Portal | Jewelia CRM",
  description: "Manage your consigned inventory, track sales, and view settlements",
}

export default function ConsignmentPortalPage() {
  return (
    <ConsignmentPortalLayout>
      <PartnerDashboard />
    </ConsignmentPortalLayout>
  )
}
// FORCE DEPLOYMENT - Thu Aug 21 20:04:02 EDT 2025 - All Supabase .or() method errors fixed
