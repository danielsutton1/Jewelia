import type { Metadata } from "next"
import { AgreementDisplay } from "@/components/consignment-portal/agreement/agreement-display"
import { ConsignmentPortalLayout } from "@/components/consignment-portal/layout"

export const metadata: Metadata = {
  title: "Agreement | Partner Portal",
  description: "View your consignment agreement terms and conditions",
}

export default function AgreementPage() {
  return (
    <ConsignmentPortalLayout>
      <AgreementDisplay />
    </ConsignmentPortalLayout>
  )
}
