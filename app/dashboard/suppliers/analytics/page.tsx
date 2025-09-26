import type { Metadata } from "next"
import SupplierPerformanceDashboard from "@/components/suppliers/analytics/supplier-performance-dashboard"

export const metadata: Metadata = {
  title: "Supplier Performance Analytics | Jewelia CRM",
  description: "Comprehensive analytics for supplier performance management",
}

export default function SupplierAnalyticsPage() {
  return <SupplierPerformanceDashboard />
}
