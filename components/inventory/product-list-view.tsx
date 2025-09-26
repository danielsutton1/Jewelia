"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Eye, MoreHorizontal, Tag, Copy, Archive, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApi } from "@/lib/api-service"
import { toast } from "@/components/ui/use-toast"

interface ProductListViewProps {
  inventory: any[]
}

export function ProductListView({ inventory }: ProductListViewProps) {
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
    <div className="space-y-4">
      {inventory.map((item) => (
        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
          <div className="col-span-1">
            <Checkbox />
          </div>
          <div className="col-span-2">
            <div className="relative aspect-square">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
          </div>
          <div className="col-span-7 space-y-2">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.sku}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{item.category}</Badge>
              <Badge variant="outline">{item.metal}</Badge>
              {item.primaryStone && <Badge variant="outline">{item.primaryStone}</Badge>}
            </div>
            <div className="text-sm">
              <p>Weight: {item.weight}g</p>
              <p>Cost: ${item.cost}</p>
              <p>Price: ${item.price}</p>
            </div>
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
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
        </div>
      ))}
    </div>
  )
}
