import type { Metadata } from "next"
import { ServiceRequestForm } from "@/components/services/service-request-form"

export const metadata: Metadata = {
  title: "Create Service Request | Jewelia CRM",
  description: "Create a new external service request",
}

export default function CreateServiceRequestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Service Request</h1>
        <p className="text-muted-foreground mt-2">Request external services from your partners</p>
      </div>

      <ServiceRequestForm />
    </div>
  )
}
