"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SupplierRelationshipProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function SupplierRelationship({ timeRange, selectedSuppliers, selectedCategories }: SupplierRelationshipProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Relationship</CardTitle>
        <CardDescription>Relationship strength and collaboration metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Supplier relationship content */}
      </CardContent>
    </Card>
  )
}

export default SupplierRelationship; 