"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Edit, Eye, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"

interface InventoryGridProps {
  searchTerm: string
}

export function InventoryGrid({ searchTerm }: InventoryGridProps) {
  // This would be fetched from your API in a real application
  const inventoryItems = [
    {
      id: "ITEM-1001",
      name: "Diamond Tennis Bracelet",
      dateReceived: "2023-09-15",
      endDate: "2024-09-15",
      daysRemaining: 120,
      status: "active",
      price: 3500,
      commissionRate: 30,
      category: "Bracelets",
      imageUrl: "/sparkling-diamond-bracelet.png",
    },
    {
      id: "ITEM-1002",
      name: "Sapphire Pendant Necklace",
      dateReceived: "2023-10-02",
      endDate: "2024-10-02",
      daysRemaining: 137,
      status: "active",
      price: 2800,
      commissionRate: 25,
      category: "Necklaces",
      imageUrl: "/placeholder-n3yzm.png",
    },
    {
      id: "ITEM-1003",
      name: "Vintage Gold Watch",
      dateReceived: "2023-11-10",
      endDate: "2024-05-10",
      daysRemaining: -7,
      status: "expired",
      price: 4200,
      commissionRate: 35,
      category: "Watches",
      imageUrl: "/gold-watch.png",
    },
    {
      id: "ITEM-1004",
      name: "Pearl Earrings",
      dateReceived: "2023-12-05",
      endDate: "2024-12-05",
      daysRemaining: 201,
      status: "active",
      price: 1200,
      commissionRate: 40,
      category: "Earrings",
      imageUrl: "/pearl-earrings.png",
    },
    {
      id: "ITEM-1005",
      name: "Emerald Ring",
      dateReceived: "2023-08-20",
      endDate: "2024-08-20",
      daysRemaining: 94,
      status: "sold",
      price: 3800,
      commissionRate: 25,
      category: "Rings",
      dateSold: "2023-12-15",
      imageUrl: "/placeholder-bw6tn.png",
    },
    {
      id: "ITEM-1006",
      name: "Ruby Stud Earrings",
      dateReceived: "2024-01-15",
      endDate: "2025-01-15",
      daysRemaining: 242,
      status: "active",
      price: 1800,
      commissionRate: 30,
      category: "Earrings",
      imageUrl: "/placeholder.svg?height=200&width=200&query=ruby earrings",
    },
  ]

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: any, daysRemaining: any) => {
    switch (status) {
      case "sold":
        return <Badge className="bg-green-500">Sold</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      case "active":
        return daysRemaining <= 30 ? (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Ending Soon
          </Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              <div className="absolute right-2 top-2">{getStatusBadge(item.status, item.daysRemaining)}</div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{item.name}</h3>
              <span className="text-lg font-bold">${item.price}</span>
            </div>
            <div className="mb-2 text-sm text-muted-foreground">
              <span>ID: {item.id}</span>
              <span className="mx-2">•</span>
              <span>{item.category}</span>
            </div>
            {item.status !== "sold" && (
              <div className="mt-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>Consignment Period</span>
                  <span>{item.daysRemaining > 0 ? `${item.daysRemaining} days left` : "Expired"}</span>
                </div>
                <Progress value={((item.daysRemaining <= 0 ? 0 : item.daysRemaining) / 365) * 100} className="h-2" />
              </div>
            )}
            {item.status === "sold" && (
              <div className="mt-2 text-sm">
                <span className="text-green-600">Sold on {item.dateSold}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between p-4 pt-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/consignment-portal/inventory/${item.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Details
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/consignment-portal/inventory/${item.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Item
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {item.status === "active" && (
                  <>
                    <DropdownMenuItem>Update Price</DropdownMenuItem>
                    <DropdownMenuItem>Request Return</DropdownMenuItem>
                  </>
                )}
                {item.status === "expired" && <DropdownMenuItem>Request Return</DropdownMenuItem>}
                <DropdownMenuItem>View History</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
