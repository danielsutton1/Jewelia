"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductMapping } from "@/components/dropship-portal/settings/product-mapping"

export default function ProductMappingPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Product Mapping</h1>
        <p className="text-muted-foreground">Map your product attributes to Jewelia's product schema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Attribute Mapping</CardTitle>
          <CardDescription>Configure how your product data maps to Jewelia's product schema</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductMapping />
        </CardContent>
      </Card>
    </div>
  )
}
