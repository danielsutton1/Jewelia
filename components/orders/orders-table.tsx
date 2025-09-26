"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Printer, Copy, XCircle, CheckCircle, Clock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
// Removed direct database imports - using API instead
import type { Order, Customer, OrderItem, Inventory, OrderStatus, PaymentStatus } from "@/types/database"
import { toast as sonnerToast } from "sonner"
import { Input } from "@/components/ui/input"
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

const allColumns = [
  { key: "id", label: "Order ID" },
  { key: "customer", label: "Customer" },
  { key: "created_at", label: "Date" },
  { key: "status", label: "Status" },
  { key: "items", label: "Items" },
  { key: "total_amount", label: "Total" },
  { key: "payment_status", label: "Payment Status" },
]

// Sample orders data for development
export const orders = [
  {
    id: "ORD-001",
    customer: {
      id: "CUST-001",
      full_name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
    },
    created_at: "2024-03-20T10:00:00Z",
    status: "Completed",
    items: [
      {
        id: "ITEM-001",
        inventory_id: "INV-001",
        quantity: 1,
        unit_price: 100,
      },
    ],
    total_amount: 100,
    payment_status: "Paid",
  },
  {
    id: "ORD-002",
    customer: {
      id: "CUST-002",
      full_name: "Jane Smith",
      email: "jane@example.com",
      phone: "098-765-4321",
    },
    created_at: "2024-03-21T14:30:00Z",
    status: "Processing",
    items: [
      {
        id: "ITEM-002",
        inventory_id: "INV-002",
        quantity: 2,
        unit_price: 75,
      },
    ],
    total_amount: 150,
    payment_status: "Pending",
  },
  {
    id: "ORD-003",
    customer: {
      id: "CUST-003",
      full_name: "Test User",
      email: "test@example.com",
      phone: "555-555-5555",
    },
    created_at: "2024-07-10T10:00:00Z",
    status: "Completed",
    items: [],
    total_amount: 5000,
    payment_status: "Paid",
  },
];

export function OrdersTable() {
  const [orders, setOrders] = useState<(Order & { customer: Customer | null; items: OrderItem[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("")
  const [filterOrderStatus, setFilterOrderStatus] = useState("")
  const [filterCustomerId, setFilterCustomerId] = useState("")
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orders_columns')
      if (saved) return JSON.parse(saved)
    }
    return allColumns.map(c => c.key)
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editOrder, setEditOrder] = useState<(Order & { customer: Customer | null; items: OrderItem[] }) | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [addForm, setAddForm] = useState({
    customer_id: "",
    status: "pending" as OrderStatus,
    payment_status: "pending" as PaymentStatus,
    notes: "",
    items: [] as { inventory_id: string; quantity: number; unit_price: number }[],
  })
  const [editForm, setEditForm] = useState({
    customer_id: "",
    status: "pending" as OrderStatus,
    payment_status: "pending" as PaymentStatus,
    notes: "",
    items: [] as { inventory_id: string; quantity: number; unit_price: number }[],
  })
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/orders').then(res => res.json()).then(data => data.data || []),
      fetch('/api/customers').then(res => res.json()).then(data => data.data || []),
      fetch('/api/inventory').then(res => res.json()).then(data => data.data || []),
    ])
      .then(([ordersData, customersData, inventoryData]) => {
        setOrders(ordersData)
        setCustomers(customersData)
        setInventory(inventoryData)
      })
      .catch(() => sonnerToast.error("Failed to load orders/customers/inventory."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orders_columns', JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  const handleSort = (column: string) => {
    // Implement sorting logic here
  }

  const handleSelectAll = () => {
    // Implement select all logic here
  }

  const handleSelectOrder = (orderId: string) => {
    // Implement select order logic here
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-emerald-500">Completed</Badge>
      case "Processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "Pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "Cancelled":
        return (
          <Badge variant="outline" className="text-destructive border-destructive">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <div className="flex items-center gap-1 text-emerald-500">
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="text-xs">Paid</span>
          </div>
        )
      case "Pending":
        return (
          <div className="flex items-center gap-1 text-amber-500">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Pending</span>
          </div>
        )
      case "Refunded":
        return (
          <div className="flex items-center gap-1 text-destructive">
            <XCircle className="h-3.5 w-3.5" />
            <span className="text-xs">Refunded</span>
          </div>
        )
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>
    }
  }

  // Action handlers
  const handleEditOrder = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}/edit`)
  }

  const handlePrintInvoice = (orderId: string) => {
    // For demo, just print the page
    window.print()
    toast({ title: "Print Invoice", description: `Invoice for order ${orderId} sent to printer.` })
  }

  const handleDuplicateOrder = (orderId: string) => {
    // Implement duplicate order logic here
  }

  const handleCancelOrder = (orderId: string) => {
    // Implement cancel order logic here
  }

  const confirmCancelOrder = () => {
    // Implement confirm cancel order logic here
  }

  const toggleColumn = (key: string) => {
    setVisibleColumns(cols => cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key])
  }

  const filteredOrders = orders.filter(order => {
    if (filterOrderStatus && filterOrderStatus !== "all" && order.status !== filterOrderStatus) return false
    if (filterPaymentStatus && filterPaymentStatus !== "all" && order.payment_status !== filterPaymentStatus) return false
    if (filterCustomerId && filterCustomerId !== "all" && 
        (order.customer?.id || order.customer_id) !== filterCustomerId) return false
    
    // Comprehensive search across multiple fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const customerName = order.customer?.full_name || customers.find(c => c.id === order.customer_id)?.full_name || ''
      const customerEmail = order.customer?.email || customers.find(c => c.id === order.customer_id)?.email || ''
      
      // Search criteria: order ID, customer name, customer email, order number, total amount, notes, item names
      const matchesSearch = 
        order.id.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query) ||
        (order as any).order_number?.toLowerCase().includes(query) ||
        order.total_amount?.toString().includes(query) ||
        order.notes?.toLowerCase().includes(query) ||
        // Search in order items
        (order.items || []).some((item: any) => 
          item.inventory?.name?.toLowerCase().includes(query) ||
          item.inventory?.sku?.toLowerCase().includes(query) ||
          item.quantity?.toString().includes(query) ||
          item.unit_price?.toString().includes(query)
        )
      
      if (!matchesSearch) return false
    }
    return true
  })

  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o.id))

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(filteredOrders.map(o => o.id))
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])
  }

  function exportToCSV(items: typeof orders, columns: string[]) {
    const header = columns.join(",")
    const rows = items.map(order =>
      columns.map(col => {
        if (col === 'customer') return order.customer ? order.customer.full_name : 
          customers.find(c => c.id === order.customer_id)?.full_name || 'Unknown Customer'
        if (col === 'items') return order.items?.length || 0
        const val = (order as any)[col]
        if (val === null || val === undefined) return ''
        if (typeof val === 'string' && val.includes(',')) return '"' + val.replace(/"/g, '""') + '"'
        return val
      }).join(",")
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`/api/orders/${id}`, { method: 'DELETE' })
      ))
      setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)))
      setSelectedIds([])
      sonnerToast.success("Selected orders deleted.")
    } catch (error: any) {
      sonnerToast.error(error.message || "Failed to delete selected orders.")
    }
  }

  const handleAddOrder = () => setShowAddDialog(true)
  const handleEditOrderDialog = (order: Order & { customer: Customer | null; items: OrderItem[] }) => {
    setEditOrder(order)
    setEditForm({
      customer_id: order.customer?.id || order.customer_id || "",
      status: order.status,
      payment_status: order.payment_status,
      notes: order.notes || "",
      items: (order.items || []).map(item => ({
        inventory_id: item.product_id, // Map product_id to inventory_id for the form
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    })
    setShowEditDialog(true)
  }
  const handleDeleteOrderDialog = (orderId: string) => {
    setOrderToDelete(orderId)
    setDeleteDialogOpen(true)
  }
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return
    try {
      await fetch(`/api/orders/${orderToDelete}`, { method: 'DELETE' })
      setOrders(prev => prev.filter(o => o.id !== orderToDelete))
      sonnerToast.success("Order deleted.")
    } catch (error: any) {
      sonnerToast.error(error.message || "Failed to delete order.")
    } finally {
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  // Edit Order Dialog Handlers
  const handleEditFormChange = (field: keyof typeof editForm, value: string | OrderStatus | PaymentStatus) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }
  const handleEditItemChange = (idx: number, field: keyof typeof editForm.items[0], value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === idx ? { ...item, [field]: value } : item
      )
    }))
  }
  const handleRemoveEditItem = (idx: number) => {
    setEditForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }
  const handleSubmitEditOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editOrder) return
    try {
      const total_amount = editForm.items.reduce((sum, item) => sum + (Number(item.unit_price) * Number(item.quantity)), 0)
      const updates = {
        customer_id: editForm.customer_id,
        status: editForm.status as OrderStatus,
        payment_status: editForm.payment_status as PaymentStatus,
        notes: editForm.notes,
        total_amount,
      }
      const items = editForm.items.map(item => ({
        product_id: item.inventory_id, // Map back to product_id for the database
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total_price: Number(item.unit_price) * Number(item.quantity),
        notes: null,
      }))
      const response = await fetch(`/api/orders/${editOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, items })
      })
      const result = await response.json()
      const updatedOrder = result.data
      setOrders(prev => prev.map(o => o.id === editOrder.id ? { ...updatedOrder, customer: customers.find(c => c.id === updates.customer_id)!, items: [] } : o))
      setShowEditDialog(false)
      setEditOrder(null)
      sonnerToast.success("Order updated.")
    } catch (error: any) {
      sonnerToast.error(error.message || "Failed to update order.")
    }
  }

  return (
    <div className="rounded-md border w-full bg-muted overflow-x-hidden max-w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Input placeholder="Search by order #, customer, item, amount..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64" />
          <Select value={filterCustomerId} onValueChange={setFilterCustomerId}>
            <SelectTrigger className="min-w-max">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterOrderStatus} onValueChange={setFilterOrderStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterPaymentStatus}
            onValueChange={setFilterPaymentStatus}
          >
            <SelectTrigger className="min-w-max border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          {/* Shipping Status */}
          <Select defaultValue="all">
            <SelectTrigger className="min-w-max">
              <SelectValue placeholder="Shipping Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shipments</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {/* Sort By */}
          <Select defaultValue="newest">
            <SelectTrigger className="min-w-max">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Value</SelectItem>
              <SelectItem value="lowest">Lowest Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end w-full mt-2 sm:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {allColumns.map(col => (
                <DropdownMenuCheckboxItem key={col.key} checked={visibleColumns.includes(col.key)} onCheckedChange={() => toggleColumn(col.key)}>
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/dashboard/orders/create">
            <Button className="min-w-[120px]">Create Order</Button>
          </Link>
        </div>
      </div>
      {selectedIds.length > 0 && (
        <div className="mb-2 flex gap-2 items-center bg-muted p-2 rounded">
          <span>{selectedIds.length} selected</span>
          <Button variant="destructive" onClick={handleBulkDelete}>Delete Selected</Button>
        </div>
      )}
      <div className="overflow-x-auto w-full">
        <Table className="w-full table-fixed min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] px-2">
                <Checkbox
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all orders"
                />
              </TableHead>
              <TableHead className="w-[110px] px-2">Order</TableHead>
              <TableHead className="w-[140px] px-2">Customer</TableHead>
              <TableHead className="w-[140px] px-2">Date</TableHead>
              <TableHead className="w-[90px] px-2">Status</TableHead>
              <TableHead className="w-[60px] px-2">Items</TableHead>
              <TableHead className="w-[100px] px-2">Total</TableHead>
              <TableHead className="w-[100px] px-2">Payment</TableHead>
              <TableHead className="text-right w-[70px] px-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(order.id)}
                    onCheckedChange={() => handleSelectOrder(order.id)}
                    aria-label={`Select order ${order.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/orders/${order.id}`} className="text-emerald-700 hover:underline">
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {order.customer ? order.customer.full_name : 
                       customers.find(c => c.id === order.customer_id)?.full_name || 'Unknown Customer'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer?.email || 
                       customers.find(c => c.id === order.customer_id)?.email || 'No email'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{order.items?.length || 0}</TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
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
                        <Link href={`/dashboard/orders/${order.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/orders/${order.id}/edit`} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit order
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleDuplicateOrder(order.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDeleteOrderDialog(order.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEditOrder} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Customer</label>
              <Select value={editForm.customer_id} onValueChange={v => handleEditFormChange('customer_id', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name} ({c.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium mb-1">Status</label>
                <Select value={editForm.status} onValueChange={v => handleEditFormChange('status', v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Payment Status</label>
                <Select value={editForm.payment_status} onValueChange={v => handleEditFormChange('payment_status', v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Payment Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Notes</label>
              <Textarea value={editForm.notes} onChange={e => handleEditFormChange('notes', e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">Order Items</label>
              {editForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <Select value={item.inventory_id} onValueChange={v => handleEditItemChange(idx, 'inventory_id', v)}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Select item" /></SelectTrigger>
                    <SelectContent>
                      {inventory.map(inv => (
                        <SelectItem key={inv.id} value={inv.id}>{inv.name} (SKU: {inv.sku})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" min={1} value={item.quantity} onChange={e => handleEditItemChange(idx, 'quantity', e.target.value)} className="w-20" placeholder="Qty" />
                  <Input type="number" min={0} step={0.01} value={item.unit_price} onChange={e => handleEditItemChange(idx, 'unit_price', e.target.value)} className="w-28" placeholder="Unit Price" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveEditItem(idx)}><XCircle className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setEditForm(f => ({ ...f, items: [...f.items, { inventory_id: "", quantity: 1, unit_price: 0 }] }))}>+ Add Item</Button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete order <span className="font-mono">{orderToDelete}</span>?</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleDeleteOrder} className="text-red-600">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
