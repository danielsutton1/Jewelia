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

export function RawMaterials() {
  const [materials, setMaterials] = useState<Inventory[]>([])
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
      const saved = localStorage.getItem('raw_materials_columns')
      if (saved) return JSON.parse(saved)
    }
    return allColumns.map(c => c.key)
  })
  const [showDialog, setShowDialog] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    sku: "",
    name: "",
    category: "Raw Material",
    price: 0,
    cost: 0,
    quantity: 1,
    status: "in_stock",
    description: "",
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editMaterial, setEditMaterial] = useState<Inventory | null>(null)
  const [editForm, setEditForm] = useState({
    sku: "",
    name: "",
    category: "Raw Material",
    price: 0,
    cost: 0,
    quantity: 1,
    status: "in_stock",
    description: "",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteMaterial, setDeleteMaterial] = useState<Inventory | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('raw_materials_columns', JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  const toggleColumn = (key: string) => {
    setVisibleColumns(cols => cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key])
  }

  useEffect(() => {
    setLoading(true)
    getInventory()
      .then(data => setMaterials(data.filter(item => item.category === 'Raw Material')))
      .catch(() => toast.error("Failed to load raw materials."))
      .finally(() => setLoading(false))
  }, [])

  const filteredMaterials = materials.filter(material => {
    if (filterStatus && material.status !== filterStatus) return false
    if (filterPriceMin && material.price < Number(filterPriceMin)) return false
    if (filterPriceMax && material.price > Number(filterPriceMax)) return false
    if (filterQtyMin && material.quantity < Number(filterQtyMin)) return false
    if (filterQtyMax && material.quantity > Number(filterQtyMax)) return false
    if (searchQuery && !(
      material.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.name.toLowerCase().includes(searchQuery.toLowerCase())
    )) return false
    return true
  })

  const allSelected = filteredMaterials.length > 0 && filteredMaterials.every(m => selectedIds.includes(m.id))
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(filteredMaterials.map(m => m.id))
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
    a.download = 'raw_materials.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteInventoryItem(id)))
      setMaterials(prev => prev.filter(m => !selectedIds.includes(m.id)))
      setSelectedIds([])
      toast.success("Selected items deleted.")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete selected items.")
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await createInventoryItem({
        ...newMaterial,
        price: Number(newMaterial.price),
        cost: newMaterial.cost ? Number(newMaterial.cost) : null,
        quantity: Number(newMaterial.quantity),
        status: newMaterial.status as any,
        description: newMaterial.description || null,
      })
      setMaterials(prev => [created, ...prev])
      toast.success("Raw material added.")
      setShowDialog(false)
      setNewMaterial({
        sku: "",
        name: "",
        category: "Raw Material",
        price: 0,
        cost: 0,
        quantity: 1,
        status: "in_stock",
        description: "",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to add material.")
    }
  }
  const openEditDialog = (material: Inventory) => {
    setEditMaterial(material)
    setEditForm({
      sku: material.sku,
      name: material.name,
      category: material.category || "Raw Material",
      price: material.price,
      cost: material.cost || 0,
      quantity: material.quantity,
      status: material.status,
      description: material.description || "",
    })
    setEditDialogOpen(true)
  }
  const handleEditMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editMaterial) return
    try {
      const updated = await updateInventoryItem(editMaterial.id, {
        ...editForm,
        price: Number(editForm.price),
        cost: editForm.cost ? Number(editForm.cost) : null,
        quantity: Number(editForm.quantity),
        status: editForm.status as any,
        category: "Raw Material",
        description: editForm.description || null,
      })
      setMaterials(prev => prev.map(m => m.id === updated.id ? updated : m))
      toast.success("Raw material updated.")
      setEditDialogOpen(false)
      setEditMaterial(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to update material.")
    }
  }
  const openDeleteDialog = (material: Inventory) => {
    setDeleteMaterial(material)
    setDeleteDialogOpen(true)
  }
  const handleDeleteMaterial = async () => {
    if (!deleteMaterial) return
    try {
      await deleteInventoryItem(deleteMaterial.id)
      setMaterials(prev => prev.filter(m => m.id !== deleteMaterial.id))
      toast.success("Raw material deleted.")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete material.")
    } finally {
      setDeleteDialogOpen(false)
      setDeleteMaterial(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
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
            {filteredMaterials.map((material) => (
              <TableRow key={material.id}>
                {visibleColumns.includes('sku') && <TableCell>{material.sku}</TableCell>}
                {visibleColumns.includes('name') && <TableCell>{material.name}</TableCell>}
                {visibleColumns.includes('quantity') && <TableCell>{material.quantity}</TableCell>}
                {visibleColumns.includes('cost') && <TableCell>${material.cost}</TableCell>}
                {visibleColumns.includes('price') && <TableCell>${material.price}</TableCell>}
                {visibleColumns.includes('status') && <TableCell>{material.status}</TableCell>}
                {visibleColumns.includes('description') && <TableCell>{material.description}</TableCell>}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(material)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(material)} className="text-red-600">Delete</DropdownMenuItem>
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
            <DialogTitle>Add Raw Material</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="SKU" value={newMaterial.sku} onChange={e => setNewMaterial({ ...newMaterial, sku: e.target.value })} required />
              <Input placeholder="Name" value={newMaterial.name} onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })} required />
              <Input placeholder="Price" value={newMaterial.price} onChange={e => setNewMaterial({ ...newMaterial, price: Number(e.target.value) })} min={0} />
              <Input placeholder="Cost" value={newMaterial.cost} onChange={e => setNewMaterial({ ...newMaterial, cost: Number(e.target.value) })} min={0} />
              <Input placeholder="Quantity" value={newMaterial.quantity} onChange={e => setNewMaterial({ ...newMaterial, quantity: Number(e.target.value) })} min={1} />
              <Input placeholder="Status" value={newMaterial.status} onChange={e => setNewMaterial({ ...newMaterial, status: e.target.value as any })} />
              <Input placeholder="Description" value={newMaterial.description} onChange={e => setNewMaterial({ ...newMaterial, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Material</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Raw Material</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMaterial} className="space-y-4">
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
              <Button type="submit">Update Material</Button>
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
            <Button type="submit" onClick={handleDeleteMaterial} className="text-red-600">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
 
 