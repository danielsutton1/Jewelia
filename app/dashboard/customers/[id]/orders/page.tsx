"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, AlertCircle, CheckCircle, XCircle, Truck, Search } from "lucide-react"

// Mock orders data
type Order = {
  id: string;
  date: string;
  customerId: string;
  channel: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  items: number;
  deliveryStatus: string;
  deliveryMethod: string;
  tags: string[];
};

const mockOrders: Order[] = [
  {
    id: "1258",
    date: "2024-12-04T13:56:00Z",
    customerId: "VIP-002",
    channel: "Online",
    total: 1.0,
    paymentStatus: "Payment pending",
    fulfillmentStatus: "Fulfilled",
    items: 1,
    deliveryStatus: "Delivered",
    deliveryMethod: "Shipping",
    tags: [],
  },
  {
    id: "1257",
    date: "2024-12-04T11:41:00Z",
    customerId: "VIP-002",
    channel: "Online",
    total: 49532.0,
    paymentStatus: "Paid",
    fulfillmentStatus: "Fulfilled",
    items: 5000,
    deliveryStatus: "Delivered",
    deliveryMethod: "Shipping",
    tags: [],
  },
]

interface Filter {
  label: string;
  value: string;
  icon: React.ReactNode | null;
}

const FILTERS: Filter[] = [
  { label: "All", value: "all", icon: null },
  { label: "Unfulfilled", value: "unfulfilled", icon: <Truck className="h-4 w-4 mr-1" /> },
  { label: "Unpaid", value: "unpaid", icon: <AlertCircle className="h-4 w-4 mr-1 text-yellow-600" /> },
  { label: "Delivered", value: "delivered", icon: <CheckCircle className="h-4 w-4 mr-1 text-green-600" /> },
  { label: "Archived", value: "archived", icon: <XCircle className="h-4 w-4 mr-1 text-muted-foreground" /> },
]

const DATE_RANGES = [
  { label: "All Time", value: "all" },
  { label: "Last 30 Days", value: "30d" },
  { label: "This Year", value: "year" },
]

function filterByDate(orders: Order[], range: string): Order[] {
  if (range === "all") return orders
  const now = new Date()
  if (range === "30d") {
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - 30)
    return orders.filter((o: Order) => new Date(o.date) >= cutoff)
  }
  if (range === "year") {
    return orders.filter((o: Order) => new Date(o.date).getFullYear() === now.getFullYear())
  }
  return orders
}

export default function CustomerOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  const [filter, setFilter] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [search, setSearch] = useState("")

  // Filter orders for this customer
  const orders = useMemo(() =>
    mockOrders.filter(order => order.customerId === customerId),
    [customerId]
  )

  // Date range filter
  const dateFilteredOrders = useMemo(() => filterByDate(orders, dateRange), [orders, dateRange])

  // Search filter
  const searchedOrders = useMemo(() => {
    if (!search.trim()) return dateFilteredOrders
    return dateFilteredOrders.filter(order =>
      order.id.includes(search) ||
      (order.channel && order.channel.toLowerCase().includes(search.toLowerCase()))
      // Add more fields as needed
    )
  }, [dateFilteredOrders, search])

  // Status filter
  const filteredOrders = useMemo(() => {
    if (filter === "all") return searchedOrders
    if (filter === "unfulfilled") return searchedOrders.filter(o => o.fulfillmentStatus !== "Fulfilled")
    if (filter === "unpaid") return searchedOrders.filter(o => o.paymentStatus !== "Paid")
    if (filter === "delivered") return searchedOrders.filter(o => o.deliveryStatus === "Delivered")
    if (filter === "archived") return [] // No archived in mock
    return searchedOrders
  }, [searchedOrders, filter])

  // Status counts
  const statusCounts: { [key: string]: number } = useMemo(() => {
    return {
      unpaid: orders.filter((o: Order) => o.paymentStatus !== "Paid").length,
      unfulfilled: orders.filter((o: Order) => o.fulfillmentStatus !== "Fulfilled").length,
      delivered: orders.filter((o: Order) => o.deliveryStatus === "Delivered").length,
      all: orders.length,
    }
  }, [orders])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button asChild>
          <Link href="/dashboard/orders/create">Create order</Link>
        </Button>
      </div>
      {/* Status summary bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <span className="font-medium">Unpaid</span>
          {statusCounts.unpaid > 0 && (
            <Badge variant="destructive">{statusCounts.unpaid}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Unfulfilled</span>
          {statusCounts.unfulfilled > 0 && (
            <Badge variant="secondary">{statusCounts.unfulfilled}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium">Delivered</span>
          {statusCounts.delivered > 0 && (
            <Badge variant="secondary">{statusCounts.delivered}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Total</span>
          <Badge variant="outline">{statusCounts.all}</Badge>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="mb-0">
          <TabsList>
            {FILTERS.map(f => (
              <TabsTrigger key={f.value} value={f.value} className="flex items-center gap-1">
                {f.icon}
                {f.label}
                {f.value !== "all" && statusCounts[f.value] > 0 && (
                  <Badge variant={f.value === "unpaid" ? "destructive" : "secondary"}>{statusCounts[f.value]}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 ml-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-48"
          />
          <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            {DATE_RANGES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment status</TableHead>
              <TableHead>Fulfillment status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Delivery status</TableHead>
              <TableHead>Delivery method</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">No orders found.</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map(order => (
                <TableRow key={order.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                  <TableCell>{order.channel}</TableCell>
                  <TableCell>${order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === "Paid" ? "secondary" : "destructive"}>{order.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.fulfillmentStatus === "Fulfilled" ? "secondary" : "outline"}>{order.fulfillmentStatus}</Badge>
                  </TableCell>
                  <TableCell>{order.items.toLocaleString()} {order.items === 1 ? "item" : "items"}</TableCell>
                  <TableCell>
                    <Badge variant={order.deliveryStatus === "Delivered" ? "secondary" : "outline"}>{order.deliveryStatus}</Badge>
                  </TableCell>
                  <TableCell>{order.deliveryMethod}</TableCell>
                  <TableCell>{order.tags.join(", ")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
 
 