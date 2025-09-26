"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InventoryTable } from "./inventory-table"
import { InventoryGrid } from "./inventory-grid"
import { InventoryFilters } from "./inventory-filters"
import { Plus, Search, Download, Upload } from "lucide-react"
import Link from "next/link"

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("table")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your consigned items, update pricing, and track status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button asChild>
            <Link href="/consignment-portal/inventory/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <InventoryFilters />
      </div>

      <Tabs defaultValue="table" value={viewMode} onValueChange={setViewMode} className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="space-y-4">
          <InventoryTable searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="grid" className="space-y-4">
          <InventoryGrid searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
