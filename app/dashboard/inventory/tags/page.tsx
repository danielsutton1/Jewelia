"use client"

import { InventoryTags } from "@/components/inventory/inventory-tags"

export default function InventoryTagsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Tags</h1>
        <p className="text-muted-foreground mt-2">
          Customize and manage your inventory tags and barcodes for efficient tracking
        </p>
      </div>

      <InventoryTags />
    </div>
  )
} 
 