"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { FinishedPieces } from "./finished-pieces"
import { RawMaterials } from "./raw-materials"
import { LooseStones } from "./loose-stones"
import { ItemTemplates } from "./item-templates"
import { PhysicalInventory } from "./physical-inventory"
import { InventoryAdjustments } from "./inventory-adjustments"
import { PricingManagement } from "./pricing-management"
import { TaskEnvelopes } from "./job-envelopes"
import { StoneMemos } from "./stone-memos"

export function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("finished-pieces")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search inventory by name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 bg-white border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[44px]"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <Tabs defaultValue="finished-pieces" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto min-h-[44px]">
              <TabsTrigger value="finished-pieces" className="text-xs sm:text-sm">Finished Pieces</TabsTrigger>
              <TabsTrigger value="raw-materials" className="text-xs sm:text-sm">Raw Materials</TabsTrigger>
              <TabsTrigger value="loose-stones" className="text-xs sm:text-sm">Loose Stones</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm">Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="finished-pieces" className="p-3 sm:p-4 lg:p-6">
              <FinishedPieces />
            </TabsContent>
            <TabsContent value="raw-materials" className="p-3 sm:p-4 lg:p-6">
              <RawMaterials />
            </TabsContent>
            <TabsContent value="loose-stones" className="p-3 sm:p-4 lg:p-6">
              <LooseStones />
            </TabsContent>
            <TabsContent value="templates" className="p-3 sm:p-4 lg:p-6">
              <ItemTemplates />
            </TabsContent>
          </Tabs>
        </Card>

        <Card>
          <Tabs defaultValue="physical-inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto min-h-[44px]">
              <TabsTrigger value="physical-inventory" className="text-xs sm:text-sm">Physical Inventory</TabsTrigger>
              <TabsTrigger value="adjustments" className="text-xs sm:text-sm">Adjustments</TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs sm:text-sm">Pricing</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm">Task Envelopes</TabsTrigger>
            </TabsList>
            <TabsContent value="physical-inventory" className="p-3 sm:p-4 lg:p-6">
              <PhysicalInventory />
            </TabsContent>
            <TabsContent value="adjustments" className="p-3 sm:p-4 lg:p-6">
              <InventoryAdjustments />
            </TabsContent>
            <TabsContent value="pricing" className="p-3 sm:p-4 lg:p-6">
              <PricingManagement />
            </TabsContent>
            <TabsContent value="tasks" className="p-3 sm:p-4 lg:p-6">
              <TaskEnvelopes />
            </TabsContent>
          </Tabs>
        </Card>

        <Card>
          <div className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Stone Memos</h3>
            <StoneMemos />
          </div>
        </Card>
      </div>
    </div>
  )
}
