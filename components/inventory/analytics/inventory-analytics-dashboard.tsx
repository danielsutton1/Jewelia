"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryOverview } from "./inventory-overview"
import { CategoryPerformance } from "./category-performance"
import { PricePointAnalysis } from "./price-point-analysis"
import { VendorComparison } from "./vendor-comparison"
import { LocationEfficiency } from "./location-efficiency"
import { AnalyticsFilters } from "./analytics-filters"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function InventoryAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const handleExport = () => {
    // In a real implementation, this would generate and download a report
    alert("Exporting analytics data...")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <AnalyticsFilters />
            <Button onClick={handleExport} className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="price">Price Points</TabsTrigger>
          <TabsTrigger value="vendor">Vendors</TabsTrigger>
          <TabsTrigger value="location">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-6">
          <InventoryOverview />
        </TabsContent>

        <TabsContent value="category" className="space-y-6 pt-6">
          <CategoryPerformance />
        </TabsContent>

        <TabsContent value="price" className="space-y-6 pt-6">
          <PricePointAnalysis />
        </TabsContent>

        <TabsContent value="vendor" className="space-y-6 pt-6">
          <VendorComparison />
        </TabsContent>

        <TabsContent value="location" className="space-y-6 pt-6">
          <LocationEfficiency />
        </TabsContent>
      </Tabs>
    </div>
  )
}
