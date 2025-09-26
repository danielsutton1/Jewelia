"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PricingRules } from "@/components/dropship-portal/settings/pricing-rules"

export default function PricingRulesPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Pricing Rules</h1>
        <p className="text-muted-foreground">Configure pricing rules and markup strategies for your products</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Configuration</CardTitle>
          <CardDescription>Define how your product prices are calculated in Jewelia</CardDescription>
        </CardHeader>
        <CardContent>
          <PricingRules />
        </CardContent>
      </Card>
    </div>
  )
}
