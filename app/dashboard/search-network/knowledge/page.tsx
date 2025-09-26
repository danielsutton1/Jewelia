import type { Metadata } from "next"
import { KnowledgeBaseLayout } from "@/components/partners/knowledge/knowledge-base-layout"

export const metadata: Metadata = {
  title: "Partner Knowledge Base | Jewelia CRM",
  description: "Shared knowledge system for Jewelia partners",
}

export default function KnowledgeBasePage() {
  return <KnowledgeBaseLayout />
}
