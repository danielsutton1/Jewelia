"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface InventoryTableProps {
  searchTerm: string
}

export function InventoryTable({ searchTerm }: InventoryTableProps) {
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
      imageUrl: "/assorted-jewelry-display.png",
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
      imageUrl: "/placeholder-55o3d.png",
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
      imageUrl: "/wrist-watch-close-up.png",
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
      imageUrl: "/placeholder-m4dvw.png",
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
      imageUrl: "/placeholder-gb72u.png",
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Item ID</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Consignment Period</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>${item.price.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(item.status, item.daysRemaining)}</TableCell>
              <TableCell>
                {item.status === "sold" ? (
                  <div>
                    <div className="text-xs text-muted-foreground">Received: {item.dateReceived}</div>
                    <div className="text-xs text-green-600">Sold: {item.dateSold}</div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={((item.daysRemaining <= 0 ? 0 : item.daysRemaining) / 365) * 100}
                        className="h-2"
                      />
                      <span className="text-xs">
                        {item.daysRemaining > 0 ? `${item.daysRemaining} days` : "Expired"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.dateReceived} to {item.endDate}
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/consignment-portal/inventory/${item.id}`}>View Details</Link>
                    </DropdownMenuItem>
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
                    {item.status === "expired" && (
                      <DropdownMenuItem>
                        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                        Request Return
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>View History</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
