import { BusinessIntelligenceDashboard } from "@/components/business-intelligence/dashboard"

export default function BusinessIntelligencePage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <BusinessIntelligenceDashboard />
    </div>
  )
}
