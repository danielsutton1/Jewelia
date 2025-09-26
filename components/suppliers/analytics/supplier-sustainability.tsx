"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SupplierSustainabilityProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function SupplierSustainability({ timeRange, selectedSuppliers, selectedCategories }: SupplierSustainabilityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Sustainability</CardTitle>
        <CardDescription>Environmental and social impact metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Supplier sustainability content */}
      </CardContent>
    </Card>
  )
}

export default SupplierSustainability; 