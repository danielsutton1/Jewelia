"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddConsignedItemPage() {
  const router = useRouter()
  const [item, setItem] = useState({ name: "", description: "", value: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the submission, e.g., sending data to an API
    console.log("Consigned item added:", item)
    router.push("/dashboard/consignment")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">Add Consigned Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            value={item.value}
            onChange={(e) => setItem({ ...item, value: e.target.value })}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button type="submit">Add Item</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/consignment")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 
 