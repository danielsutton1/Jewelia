export const dynamic = 'force-dynamic'

import type { Metadata } from "next"
import { QualityMetricsDashboard } from "@/components/quality-control/metrics/quality-metrics-dashboard"

export const metadata: Metadata = {
  title: "Quality Control Metrics",
  description: "Quality control metrics and analytics dashboard",
}

export default function QualityMetricsPage() {
  return <QualityMetricsDashboard />
}
