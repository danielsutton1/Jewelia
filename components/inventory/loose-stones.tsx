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
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/database"
import type { Inventory } from "@/types/database"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const allColumns = [
  { key: "sku", label: "SKU" },
  { key: "name", label: "Name" },
  { key: "quantity", label: "Quantity" },
  { key: "cost", label: "Cost" },
  { key: "price", label: "Price" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description" },
]

export function LooseStones() {
  const [stones, setStones] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPriceMin, setFilterPriceMin] = useState("")
  const [filterPriceMax, setFilterPriceMax] = useState("")
  const [filterQtyMin, setFilterQtyMin] = useState("")
  const [filterQtyMax, setFilterQtyMax] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loose_stones_columns')
      if (saved) return JSON.parse(saved)
    }
    return allColumns.map(c => c.key)
  })
  const [showDialog, setShowDialog] = useState(false)
  const [newStone, setNewStone] = useState({
    sku: "",
    name: "",
    category: "Loose Stone",
    price: 0,
    cost: 0,
    quantity: 1,
    status: "in_stock",
    description: "",
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editStone, setEditStone] = useState<Inventory | null>(null)
  const [editForm, setEditForm] = useState({
    sku: "",
    name: "",
    category: "Loose Stone",
    price: 0,
    cost: 0,
    quantity: 1,
    status: "in_stock",
    description: "",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteStone, setDeleteStone] = useState<Inventory | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('loose_stones_columns', JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  const toggleColumn = (key: string) => {
    setVisibleColumns(cols => cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key])
  }

  useEffect(() => {
    setLoading(true)
    getInventory()
      .then(data => setStones(data.filter(item => item.category === 'Loose Stone')))
      .catch(() => toast.error("Failed to load loose stones."))
      .finally(() => setLoading(false))
  }, [])

  const filteredStones = stones.filter(stone => {
    if (filterStatus && stone.status !== filterStatus) return false
    if (filterPriceMin && stone.price < Number(filterPriceMin)) return false
    if (filterPriceMax && stone.price > Number(filterPriceMax)) return false
    if (filterQtyMin && stone.quantity < Number(filterQtyMin)) return false
    if (filterQtyMax && stone.quantity > Number(filterQtyMax)) return false
    if (searchQuery && !(
      stone.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stone.name.toLowerCase().includes(searchQuery.toLowerCase())
    )) return false
    return true
  })

  const allSelected = filteredStones.length > 0 && filteredStones.every(m => selectedIds.includes(m.id))
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(filteredStones.map(m => m.id))
  }
  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])
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
    a.download = 'loose_stones.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteInventoryItem(id)))
      setStones(prev => prev.filter(m => !selectedIds.includes(m.id)))
      setSelectedIds([])
      toast.success("Selected items deleted.")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete selected items.")
    }
  }

  const handleAddStone = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await createInventoryItem({
        ...newStone,
        price: Number(newStone.price),
        cost: newStone.cost ? Number(newStone.cost) : null,
        quantity: Number(newStone.quantity),
        status: newStone.status as any,
        description: newStone.description || null,
      })
      setStones(prev => [created, ...prev])
      toast.success("Loose stone added.")
      setShowDialog(false)
      setNewStone({
        sku: "",
        name: "",
        category: "Loose Stone",
        price: 0,
        cost: 0,
        quantity: 1,
        status: "in_stock",
        description: "",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to add stone.")
    }
  }

  const openEditDialog = (stone: Inventory) => {
    setEditStone(stone)
    setEditForm({
      sku: stone.sku,
      name: stone.name,
      category: stone.category || "Loose Stone",
      price: stone.price,
      cost: stone.cost || 0,
      quantity: stone.quantity,
      status: stone.status,
      description: stone.description || "",
    })
    setEditDialogOpen(true)
  }

  const handleEditStone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editStone) return
    try {
      const updated = await updateInventoryItem(editStone.id, {
        ...editForm,
        price: Number(editForm.price),
        cost: editForm.cost ? Number(editForm.cost) : null,
        quantity: Number(editForm.quantity),
        status: editForm.status as any,
        category: "Loose Stone",
        description: editForm.description || null,
      })
      setStones(prev => prev.map(m => m.id === updated.id ? updated : m))
      toast.success("Loose stone updated.")
      setEditDialogOpen(false)
      setEditStone(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to update stone.")
    }
  }

  const openDeleteDialog = (stone: Inventory) => {
    setDeleteStone(stone)
    setDeleteDialogOpen(true)
  }

  const handleDeleteStone = async () => {
    if (!deleteStone) return
    try {
      await deleteInventoryItem(deleteStone.id)
      setStones(prev => prev.filter(m => m.id !== deleteStone.id))
      toast.success("Loose stone deleted.")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete stone.")
    } finally {
      setDeleteDialogOpen(false)
      setDeleteStone(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search stones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Stone
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('sku') && <TableHead>SKU</TableHead>}
              {visibleColumns.includes('name') && <TableHead>Name</TableHead>}
              {visibleColumns.includes('quantity') && <TableHead>Quantity</TableHead>}
              {visibleColumns.includes('cost') && <TableHead>Cost</TableHead>}
              {visibleColumns.includes('price') && <TableHead>Price</TableHead>}
              {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
              {visibleColumns.includes('description') && <TableHead>Description</TableHead>}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStones.map((stone) => (
              <TableRow key={stone.id}>
                {visibleColumns.includes('sku') && <TableCell>{stone.sku}</TableCell>}
                {visibleColumns.includes('name') && <TableCell>{stone.name}</TableCell>}
                {visibleColumns.includes('quantity') && <TableCell>{stone.quantity}</TableCell>}
                {visibleColumns.includes('cost') && <TableCell>${stone.cost}</TableCell>}
                {visibleColumns.includes('price') && <TableCell>${stone.price}</TableCell>}
                {visibleColumns.includes('status') && <TableCell>{stone.status}</TableCell>}
                {visibleColumns.includes('description') && <TableCell>{stone.description}</TableCell>}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(stone)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(stone)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Loose Stone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStone} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="SKU" value={newStone.sku} onChange={e => setNewStone({ ...newStone, sku: e.target.value })} required />
              <Input placeholder="Name" value={newStone.name} onChange={e => setNewStone({ ...newStone, name: e.target.value })} required />
              <Input placeholder="Price" value={newStone.price} onChange={e => setNewStone({ ...newStone, price: Number(e.target.value) })} min={0} />
              <Input placeholder="Cost" value={newStone.cost} onChange={e => setNewStone({ ...newStone, cost: Number(e.target.value) })} min={0} />
              <Input placeholder="Quantity" value={newStone.quantity} onChange={e => setNewStone({ ...newStone, quantity: Number(e.target.value) })} min={1} />
              <Input placeholder="Status" value={newStone.status} onChange={e => setNewStone({ ...newStone, status: e.target.value as any })} />
              <Input placeholder="Description" value={newStone.description} onChange={e => setNewStone({ ...newStone, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Stone</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Loose Stone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStone} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="SKU" value={editForm.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} required />
              <Input placeholder="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              <Input placeholder="Price" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} min={0} />
              <Input placeholder="Cost" value={editForm.cost} onChange={e => setEditForm({ ...editForm, cost: Number(e.target.value) })} min={0} />
              <Input placeholder="Quantity" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: Number(e.target.value) })} min={1} />
              <Input placeholder="Status" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as any })} />
              <Input placeholder="Description" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Stone</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleDeleteStone} className="text-red-600">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
 
 