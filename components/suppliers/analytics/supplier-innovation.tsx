"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SupplierInnovationProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function SupplierInnovation({ timeRange, selectedSuppliers, selectedCategories }: SupplierInnovationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Innovation</CardTitle>
        <CardDescription>Innovation and R&D collaboration tracking</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Supplier innovation content */}
      </CardContent>
    </Card>
  )
}

export default SupplierInnovation; 