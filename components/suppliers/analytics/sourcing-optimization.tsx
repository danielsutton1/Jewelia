"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SourcingOptimizationProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function SourcingOptimization({ timeRange, selectedSuppliers, selectedCategories }: SourcingOptimizationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sourcing Optimization</CardTitle>
        <CardDescription>Strategic sourcing recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Sourcing optimization content */}
      </CardContent>
    </Card>
  )
}

export default SourcingOptimization; 