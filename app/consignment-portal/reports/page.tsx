import type { Metadata } from "next"
import { ReportsInterface } from "@/components/consignment-portal/reports/reports-interface"
import { ConsignmentPortalLayout } from "@/components/consignment-portal/layout"

export const metadata: Metadata = {
  title: "Reports | Partner Portal",
  description: "View and download reports for your consignment business",
}

export default function ReportsPage() {
  return (
    <ConsignmentPortalLayout>
      <ReportsInterface />
    </ConsignmentPortalLayout>
  )
}
