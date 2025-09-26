import type { Metadata } from "next"
import { ApiDocumentation } from "@/components/developer/api-documentation"

export const metadata: Metadata = {
  title: "API Documentation | Jewelia CRM",
  description: "Integrate with Jewelia CRM's inventory system",
}

export default function ApiDocumentationPage() {
  return <ApiDocumentation />
}
