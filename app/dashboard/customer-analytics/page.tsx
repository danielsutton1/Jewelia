import { CustomerAnalyticsDashboard } from "@/components/customer-analytics/dashboard"

export default function CustomerAnalyticsPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight customer-analytics-heading">Customer Behavior Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground customer-analytics-subtext">
          Analyze customer patterns, segments, and behaviors to drive targeted marketing and sales strategies
        </p>
      </div>
      <CustomerAnalyticsDashboard />
    </div>
  )
}
