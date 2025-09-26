import type { Metadata } from "next"
import CommunicationCenter from "@/components/partners/communications/communication-center"

export const metadata: Metadata = {
  title: "Partner Communication Center | Jewelia CRM",
  description: "Unified communication center for managing all partner interactions",
}

export default function PartnerCommunicationsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Partner Communication Center</h1>
      <CommunicationCenter />
    </div>
  )
}
