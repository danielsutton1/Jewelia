import type { Metadata } from "next"
import { FeedbackLoopDashboard } from "@/components/quality-control/feedback/feedback-loop-dashboard"

export const metadata: Metadata = {
  title: "Quality Control Feedback",
  description: "Manage quality control feedback and corrective actions",
}

export default function FeedbackLoopPage() {
  return <FeedbackLoopDashboard />
}
