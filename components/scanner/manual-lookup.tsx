"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

export function ManualLookup() {
  const [itemId, setItemId] = useState("")
  const router = useRouter()

  const handleLookup = () => {
    if (itemId.trim()) {
      router.push(`/dashboard/products/${itemId}`)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-xl font-bold">Manual Item Lookup</h2>
        <p className="text-muted-foreground">Enter the item ID to view details</p>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter Item ID (e.g., PRD-001)"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          />
          <Button onClick={handleLookup}>
            <Search className="mr-2 h-4 w-4" />
            Lookup
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
