import { PricingBreakdown } from "@/components/inventory/pricing-breakdown"

export default function PricingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Jewelry Pricing Calculator</h1>
      </div>
      <p className="text-muted-foreground">
        Calculate costs, set pricing strategies, and analyze profit margins for your jewelry items.
      </p>

      <PricingBreakdown />
    </div>
  )
}
