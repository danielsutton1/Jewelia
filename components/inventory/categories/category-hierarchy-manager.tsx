"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryTree } from "./category-tree"
import { CategorySettings } from "./category-settings"
import { BulkOperations } from "./bulk-operations"
import { InheritanceRules } from "./inheritance-rules"

export function CategoryHierarchyManager() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="structure" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="inheritance">Inheritance</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4 pt-4">
          <CategoryTree selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <CategorySettings selectedCategory={selectedCategory} />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4 pt-4">
          <BulkOperations />
        </TabsContent>

        <TabsContent value="inheritance" className="space-y-4 pt-4">
          <InheritanceRules />
        </TabsContent>
      </Tabs>
    </div>
  )
}
