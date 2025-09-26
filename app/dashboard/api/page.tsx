import type { Metadata } from "next"
import ApiDashboard from "@/components/api/api-dashboard"

export const metadata: Metadata = {
  title: "API Management | Jewelia CRM",
  description: "Manage your API integrations, monitor usage, and configure settings",
}

export default function ApiPage() {
  return <ApiDashboard />
}
