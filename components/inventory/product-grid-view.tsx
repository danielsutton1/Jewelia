"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, MoreHorizontal, Tag, Copy, Archive, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApi } from "@/lib/api-service"
import { toast } from "@/components/ui/use-toast"

interface ProductGridViewProps {
  inventory: any[]
}

export function ProductGridView({ inventory }: ProductGridViewProps) {
  const router = useRouter()
  const api = useApi()

  const handleView = (item: any) => {
    router.push(`/inventory/${item.id}`)
  }

  const handleEdit = (item: any) => {
    router.push(`/inventory/${item.id}/edit`)
  }

  const handleDuplicate = async (item: any) => {
    try {
      const newItem = { ...item, id: undefined, sku: generateSku() }
      await api.inventory.create(newItem)
      toast({
        title: "Item duplicated",
        description: "The item has been duplicated successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error duplicating item:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate the item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleArchive = async (item: any) => {
    try {
      await api.inventory.update(item.id, { status: "archived" })
      toast({
        title: "Item archived",
        description: "The item has been archived successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error archiving item:", error)
      toast({
        title: "Error",
        description: "Failed to archive the item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (item: any) => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      try {
        await api.inventory.delete(item.id)
        toast({
          title: "Item deleted",
          description: "The item has been deleted successfully.",
        })
        router.refresh()
      } catch (error) {
        console.error("Error deleting item:", error)
        toast({
          title: "Error",
          description: "Failed to delete the item. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handlePrintLabel = (item: any) => {
    // Implement label printing functionality
    console.log("Printing label for item:", item)
    toast({
      title: "Printing label",
      description: "The label is being prepared for printing.",
    })
  }

  // Generate a random SKU
  function generateSku() {
    const prefix = "JWL"
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    return `${prefix}-${randomNum}`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {inventory.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover"
            />
            {item.status === "low-stock" && <Badge className="absolute right-2 top-2 bg-amber-500">Low Stock</Badge>}
            {item.status === "out-of-stock" && (
              <Badge className="absolute right-2 top-2 bg-red-500">Out of Stock</Badge>
            )}
          </div>
          <CardContent className="p-4 space-y-2">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.sku}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{item.category}</Badge>
              <Badge variant="outline">{item.metal}</Badge>
              {item.primaryStone && <Badge variant="outline">{item.primaryStone}</Badge>}
            </div>
            <div className="text-sm space-y-1">
              <p>Weight: {item.weight}g</p>
              <p>Cost: ${item.cost}</p>
              <p>Price: ${item.price}</p>
            </div>
          </CardContent>
          <div className="flex justify-between border-t p-2">
            <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
              <Eye className="mr-1 h-4 w-4" />
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePrintLabel(item)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Print Label
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleArchive(item)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  )
}
