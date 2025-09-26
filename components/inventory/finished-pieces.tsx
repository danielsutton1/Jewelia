"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Select } from "@/components/ui/select"

// Inventory type definition
interface Inventory {
  id: string
  sku: string
  name: string
  description?: string
  category?: string
  quantity: number
  price: number
  cost?: number
  status: string
  created_at: string
  updated_at: string
}

// API functions for inventory management
const fetchInventory = async (params?: {
  search?: string
  category?: string
  status?: string
  lowStock?: boolean
  page?: number
  limit?: number
}) => {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.append('search', params.search)
  if (params?.category) searchParams.append('category', params.category)
  if (params?.status) searchParams.append('status', params.status)
  if (params?.lowStock) searchParams.append('lowStock', 'true')
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())

  const response = await fetch(`/api/inventory?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch inventory')
  }
  
  const result = await response.json()
  return result.data || []
}

const createInventoryItem = async (item: {
  sku: string
  name: string
  description?: string
  category?: string
  quantity: number
  price: number
  cost?: number
  status: string
}) => {
  // Call inventory API
  const inventoryResponse = await fetch('/api/inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })

  if (!inventoryResponse.ok) {
    const error = await inventoryResponse.json()
    throw new Error(error.error || 'Failed to create inventory item')
  }

  // Call products API for product data flow
  const productData = {
    name: item.name,
    sku: item.sku,
    price: item.price,
    stock: item.quantity,
    category: item.category || 'general',
    status: item.status,
    description: item.description,
    cost: item.cost,
    material: 'Gold', // Default value
    // Add jewelry-specific fields
    carat_weight: 1.0, // Default value
    clarity: 'VS1', // Default value
    color: 'G', // Default value
    cut: 'Excellent', // Default value
    shape: 'Round', // Default value
  }

  const productsResponse = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  })

  if (!productsResponse.ok) {
    const error = await productsResponse.json()
    throw new Error(error.error || 'Failed to create product')
  }

  const inventoryResult = await inventoryResponse.json()
  const productsResult = await productsResponse.json()
  
  // Return the inventory result as the primary data
  return inventoryResult.data
}

const updateInventoryItem = async (id: string, item: {
  sku: string
  name: string
  description?: string
  category?: string
  quantity: number
  price: number
  cost?: number
  status: string
}) => {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update inventory item')
  }

  const result = await response.json()
  return result.data
}

const deleteInventoryItem = async (id: string) => {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete inventory item')
  }

  return true
}

export function FinishedPieces() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pieces, setPieces] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [newPiece, setNewPiece] = useState({
    sku: "",
    name: "",
    category: "",
    price: 0,
    cost: 0,
    quantity: 1,
    status: "in_stock",
    description: "",
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editPiece, setEditPiece] = useState<Inventory | null>(null)
  const [editForm, setEditForm] = useState({
    sku: "",
    name: "",
    category: "",
    price: 0,
    cost: 0,
    quantity: 1,
    status: "in_stock",
    description: "",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePiece, setDeletePiece] = useState<Inventory | null>(null)
  const [filterCategory, setFilterCategory] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPriceMin, setFilterPriceMin] = useState("")
  const [filterPriceMax, setFilterPriceMax] = useState("")
  const [filterQtyMin, setFilterQtyMin] = useState("")
  const [filterQtyMax, setFilterQtyMax] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allColumns = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "quantity", label: "Quantity" },
    { key: "cost", label: "Cost" },
    { key: "price", label: "Price" },
    { key: "status", label: "Status" },
    { key: "description", label: "Description" },
  ]
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inventory_columns')
      if (saved) return JSON.parse(saved)
    }
    return allColumns.map(c => c.key)
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory_columns', JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  const toggleColumn = (key: string) => {
    setVisibleColumns(cols => cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key])
  }

  // Sample data for when API fails
  const samplePieces: Inventory[] = [
    {
      id: "1",
      sku: "RING-001",
      name: "Diamond Engagement Ring",
      description: "Classic solitaire diamond engagement ring",
      category: "Rings",
      quantity: 5,
      price: 2500.00,
      cost: 1500.00,
      status: "in_stock",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
      sku: "NECK-002",
      name: "Pearl Necklace",
      description: "Elegant pearl necklace with gold chain",
      category: "Necklaces",
      quantity: 3,
      price: 800.00,
      cost: 400.00,
      status: "in_stock",
      created_at: "2024-01-14T14:30:00Z",
      updated_at: "2024-01-14T14:30:00Z"
    },
    {
      id: "3",
      sku: "EARR-003",
      name: "Gold Hoop Earrings",
      description: "Classic gold hoop earrings",
      category: "Earrings",
      quantity: 1,
      price: 150.00,
      cost: 75.00,
      status: "low_stock",
      created_at: "2024-01-13T09:15:00Z",
      updated_at: "2024-01-13T09:15:00Z"
    }
  ]

  useEffect(() => {
    setLoading(true)
    fetchInventory()
      .then(data => setPieces(data))
      .catch(() => {
        // Fallback to sample data when API fails
        setPieces(samplePieces)
        toast.warning("Using sample data - API connection failed")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAddPiece = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPiece.sku || !newPiece.name) return // basic validation
    try {
      const created = await createInventoryItem({
        sku: newPiece.sku,
        name: newPiece.name,
        category: newPiece.category || undefined,
        price: Number(newPiece.price),
        cost: newPiece.cost ? Number(newPiece.cost) : undefined,
        quantity: Number(newPiece.quantity),
        status: newPiece.status,
        description: newPiece.description || undefined,
      })
      setPieces(prev => [created, ...prev])
      toast.success("Inventory item added.")
      setShowDialog(false)
      setNewPiece({
        sku: "",
        name: "",
        category: "",
        price: 0,
        cost: 0,
        quantity: 1,
        status: "in_stock",
        description: "",
      })
    } catch (error: any) {
      // Fallback: Add to local state when API fails
      const newItem: Inventory = {
        id: Date.now().toString(),
        sku: newPiece.sku,
        name: newPiece.name,
        description: newPiece.description || undefined,
        category: newPiece.category || undefined,
        quantity: Number(newPiece.quantity),
        price: Number(newPiece.price),
        cost: newPiece.cost ? Number(newPiece.cost) : undefined,
        status: newPiece.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setPieces(prev => [newItem, ...prev])
      toast.success("Inventory item added (local only - API connection failed)")
      setShowDialog(false)
      setNewPiece({
        sku: "",
        name: "",
        category: "",
        price: 0,
        cost: 0,
        quantity: 1,
        status: "in_stock",
        description: "",
      })
    }
  }

  const openEditDialog = (piece: Inventory) => {
    setEditPiece(piece)
    setEditForm({
      sku: piece.sku,
      name: piece.name,
      category: piece.category || "",
      price: piece.price,
      cost: piece.cost || 0,
      quantity: piece.quantity,
      status: piece.status,
      description: piece.description || "",
    })
    setEditDialogOpen(true)
  }

  const handleEditPiece = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPiece) return
    try {
      const updated = await updateInventoryItem(editPiece.id, {
        ...editForm,
        price: Number(editForm.price),
        cost: editForm.cost ? Number(editForm.cost) : undefined,
        quantity: Number(editForm.quantity),
        status: editForm.status,
        category: editForm.category || undefined,
        description: editForm.description || undefined,
      })
      setPieces(prev => prev.map(p => p.id === updated.id ? updated : p))
      toast.success("Inventory item updated.")
      setEditDialogOpen(false)
      setEditPiece(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to update item.")
    }
  }

  const openDeleteDialog = (piece: Inventory) => {
    setDeletePiece(piece)
    setDeleteDialogOpen(true)
  }

  const handleDeletePiece = async () => {
    if (!deletePiece) return
    try {
      await deleteInventoryItem(deletePiece.id)
      setPieces(prev => prev.filter(p => p.id !== deletePiece.id))
      toast.success("Inventory item deleted.")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item.")
    } finally {
      setDeleteDialogOpen(false)
      setDeletePiece(null)
    }
  }

  const filteredPieces = pieces.filter(piece => {
    if (filterCategory && piece.category !== filterCategory) return false
    if (filterStatus && piece.status !== filterStatus) return false
    if (filterPriceMin && piece.price < Number(filterPriceMin)) return false
    if (filterPriceMax && piece.price > Number(filterPriceMax)) return false
    if (filterQtyMin && piece.quantity < Number(filterQtyMin)) return false
    if (filterQtyMax && piece.quantity > Number(filterQtyMax)) return false
    if (searchQuery && !(
      piece.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      piece.name.toLowerCase().includes(searchQuery.toLowerCase())
    )) return false
    return true
  })

  const allSelected = filteredPieces.length > 0 && filteredPieces.every(p => selectedIds.includes(p.id))
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(filteredPieces.map(p => p.id))
  }
  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])
  }
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteInventoryItem(id)))
      setPieces(prev => prev.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
      toast.success("Selected items deleted.")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete selected items.")
    }
  }

  function exportToCSV(items: Inventory[], columns: string[]) {
    const header = columns.join(",")
    const rows = items.map(item =>
      columns.map(col => {
        const val = (item as any)[col]
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
    a.download = 'inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button variant="outline" className="min-w-[140px] sm:min-w-[160px] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium min-h-[44px]" onClick={() => exportToCSV(selectedIds.length > 0 ? pieces.filter(p => selectedIds.includes(p.id)) : filteredPieces, visibleColumns)}>
            Export to CSV
          </Button>
          <Button className="min-w-[140px] sm:min-w-[160px] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium min-h-[44px]" onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Add Piece
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
          <Input
            placeholder="Search pieces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[280px] lg:w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 min-h-[44px]"
          />
          <Input
            placeholder="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto min-h-[44px]"
          />
          <Input
            placeholder="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto min-h-[44px]"
          />
          <Input
            placeholder="Price min"
            value={filterPriceMin}
            onChange={(e) => setFilterPriceMin(e.target.value)}
            className="w-full sm:w-auto min-h-[44px]"
          />
          <Input
            placeholder="Price max"
            value={filterPriceMax}
            onChange={(e) => setFilterPriceMax(e.target.value)}
            className="w-full sm:w-auto min-h-[44px]"
          />
          <Input
            placeholder="QTY Min"
            value={filterQtyMin}
            onChange={(e) => setFilterQtyMin(e.target.value)}
            className="w-full sm:w-auto min-h-[44px]"
          />
          <Input
            placeholder="QTY Max"
            value={filterQtyMax}
            onChange={(e) => setFilterQtyMax(e.target.value)}
            className="w-full sm:w-auto min-h-[44px]"
          />
        </div>
        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]"><Settings className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {allColumns.map(col => (
                <DropdownMenuCheckboxItem key={col.key} checked={visibleColumns.includes(col.key)} onCheckedChange={() => toggleColumn(col.key)}>
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Add New Finished Piece</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPiece} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                placeholder="SKU"
                value={newPiece.sku}
                onChange={e => setNewPiece({ ...newPiece, sku: e.target.value })}
                required
                className="min-h-[44px]"
              />
              <Input
                placeholder="Name"
                value={newPiece.name}
                onChange={e => setNewPiece({ ...newPiece, name: e.target.value })}
                required
                className="min-h-[44px]"
              />
              <Input
                placeholder="Category"
                value={newPiece.category}
                onChange={e => setNewPiece({ ...newPiece, category: e.target.value })}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Price"
                value={newPiece.price}
                onChange={e => setNewPiece({ ...newPiece, price: Number(e.target.value) })}
                min={0}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Cost"
                value={newPiece.cost}
                onChange={e => setNewPiece({ ...newPiece, cost: Number(e.target.value) })}
                min={0}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Quantity"
                value={newPiece.quantity}
                onChange={e => setNewPiece({ ...newPiece, quantity: Number(e.target.value) })}
                min={1}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Status"
                value={newPiece.status}
                onChange={e => setNewPiece({ ...newPiece, status: e.target.value as any })}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Description"
                value={newPiece.description}
                onChange={e => setNewPiece({ ...newPiece, description: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="min-h-[44px]">
                Cancel
              </Button>
              <Button type="submit" className="min-h-[44px]">Add Piece</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border overflow-x-auto responsive-table">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('sku') && <TableHead className="text-xs sm:text-sm">SKU</TableHead>}
              {visibleColumns.includes('name') && <TableHead className="text-xs sm:text-sm">Name</TableHead>}
              {visibleColumns.includes('category') && <TableHead className="text-xs sm:text-sm">Category</TableHead>}
              {visibleColumns.includes('quantity') && <TableHead className="text-xs sm:text-sm">Quantity</TableHead>}
              {visibleColumns.includes('cost') && <TableHead className="text-xs sm:text-sm">Cost</TableHead>}
              {visibleColumns.includes('price') && <TableHead className="text-xs sm:text-sm">Price</TableHead>}
              {visibleColumns.includes('status') && <TableHead className="text-xs sm:text-sm">Status</TableHead>}
              {visibleColumns.includes('description') && <TableHead className="text-xs sm:text-sm">Description</TableHead>}
              <TableHead className="w-[50px] text-xs sm:text-sm"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPieces.map((piece) => (
              <TableRow key={piece.id}>
                {visibleColumns.includes('sku') && <TableCell className="text-xs sm:text-sm">{piece.sku}</TableCell>}
                {visibleColumns.includes('name') && <TableCell className="text-xs sm:text-sm">{piece.name}</TableCell>}
                {visibleColumns.includes('category') && <TableCell className="text-xs sm:text-sm">{piece.category}</TableCell>}
                {visibleColumns.includes('quantity') && <TableCell className="text-xs sm:text-sm">{piece.quantity}</TableCell>}
                {visibleColumns.includes('cost') && <TableCell className="text-xs sm:text-sm">${piece.cost}</TableCell>}
                {visibleColumns.includes('price') && <TableCell className="text-xs sm:text-sm">${piece.price}</TableCell>}
                {visibleColumns.includes('status') && <TableCell className="text-xs sm:text-sm">{piece.status}</TableCell>}
                {visibleColumns.includes('description') && <TableCell className="text-xs sm:text-sm">{piece.description}</TableCell>}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 min-h-[44px] min-w-[44px]">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(piece)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(piece)} className="text-red-600">Delete</DropdownMenuItem>
                      <DropdownMenuItem>Adjust Quantity</DropdownMenuItem>
                      <DropdownMenuItem>View History</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Edit Finished Piece</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPiece} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                placeholder="SKU"
                value={editForm.sku}
                onChange={e => setEditForm({ ...editForm, sku: e.target.value })}
                required
                className="min-h-[44px]"
              />
              <Input
                placeholder="Name"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="min-h-[44px]"
              />
              <Input
                placeholder="Category"
                value={editForm.category}
                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Price"
                value={editForm.price}
                onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                min={0}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Cost"
                value={editForm.cost}
                onChange={e => setEditForm({ ...editForm, cost: Number(e.target.value) })}
                min={0}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Quantity"
                value={editForm.quantity}
                onChange={e => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                min={1}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Status"
                value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                className="min-h-[44px]"
              />
              <Input
                placeholder="Description"
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="min-h-[44px]">
                Cancel
              </Button>
              <Button type="submit" className="min-h-[44px]">Update Piece</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)} className="min-h-[44px]">
              Cancel
            </Button>
            <Button type="submit" onClick={handleDeletePiece} className="text-red-600 min-h-[44px]">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
 
 