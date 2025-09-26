"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, ChevronDown, Edit, Eye, MoreHorizontal, Trash, Copy, Tag, Move, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useApi } from "@/lib/api-service"
import { toast } from "@/components/ui/use-toast"

// Define the inventory item type
export type InventoryItem = {
  id: string
  image: string
  sku: string
  name: string
  category: string
  metal: string
  purity: string
  primaryStone: string
  weight: number
  cost: number
  price: number
  location: string
  status: "available" | "reserved" | "sold"
}

// Generate a random SKU
function generateSku() {
  const prefix = "JWL"
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}-${randomNum}`
}

interface InventoryTableProps {
  data: InventoryItem[]
  onEdit?: (item: InventoryItem) => void
  onDelete?: (item: InventoryItem) => void
  onView?: (item: InventoryItem) => void
}

export function InventoryTable({ data, onEdit, onDelete, onView }: InventoryTableProps) {
  const router = useRouter()
  const api = useApi()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [editingCell, setEditingCell] = useState<{ id: string; column: string } | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const editInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Define columns
  const columns: ColumnDef<InventoryItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <div className="relative h-15 w-15 overflow-hidden rounded-md">
          <Image
            src={row.original.image || "/placeholder.svg"}
            alt={row.original.name}
            width={60}
            height={60}
            className="object-cover"
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "sku",
      header: ({ column }) => (
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            SKU
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div className="font-medium text-xs">{row.original.sku}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row, column }) => {
        const isEditing = editingCell?.id === row.original.id && editingCell?.column === column.id

        if (isEditing) {
          return (
            <Input
              ref={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                setEditingCell(null)
                // Here you would update the data
                console.log(`Updated ${row.original.id} name to ${editValue}`)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingCell(null)
                  // Here you would update the data
                  console.log(`Updated ${row.original.id} name to ${editValue}`)
                }
                if (e.key === "Escape") {
                  setEditingCell(null)
                }
              }}
              className="h-8 w-full"
              autoFocus
            />
          )
        }

        return (
          <div
            className="font-medium cursor-pointer hover:text-primary"
            onDoubleClick={() => {
              setEditingCell({ id: row.original.id, column: column.id })
              setEditValue(row.original.name)
            }}
          >
            {row.original.name}
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.original.category}</div>,
    },
    {
      accessorKey: "metal",
      header: "Metal",
      cell: ({ row }) => <div>{row.original.metal}</div>,
    },
    {
      accessorKey: "purity",
      header: "Purity",
      cell: ({ row }) => <div>{row.original.purity}</div>,
    },
    {
      accessorKey: "primaryStone",
      header: "Primary Stone",
      cell: ({ row }) => <div>{row.original.primaryStone || "—"}</div>,
    },
    {
      accessorKey: "weight",
      header: ({ column }) => (
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Weight (g)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row, column }) => {
        const isEditing = editingCell?.id === row.original.id && editingCell?.column === column.id

        if (isEditing) {
          return (
            <Input
              ref={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                setEditingCell(null)
                // Here you would update the data
                console.log(`Updated ${row.original.id} weight to ${editValue}`)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingCell(null)
                  // Here you would update the data
                  console.log(`Updated ${row.original.id} weight to ${editValue}`)
                }
                if (e.key === "Escape") {
                  setEditingCell(null)
                }
              }}
              className="h-8 w-full"
              type="number"
              step="0.01"
              autoFocus
            />
          )
        }

        return (
          <div
            className="text-right cursor-pointer hover:text-primary"
            onDoubleClick={() => {
              setEditingCell({ id: row.original.id, column: column.id })
              setEditValue(row.original.weight.toString())
            }}
          >
            {row.original.weight.toFixed(2)}
          </div>
        )
      },
    },
    {
      accessorKey: "cost",
      header: ({ column }) => (
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Cost
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row, column }) => {
        const isEditing = editingCell?.id === row.original.id && editingCell?.column === column.id

        if (isEditing) {
          return (
            <Input
              ref={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                setEditingCell(null)
                // Here you would update the data
                console.log(`Updated ${row.original.id} cost to ${editValue}`)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingCell(null)
                  // Here you would update the data
                  console.log(`Updated ${row.original.id} cost to ${editValue}`)
                }
                if (e.key === "Escape") {
                  setEditingCell(null)
                }
              }}
              className="h-8 w-full"
              type="number"
              step="0.01"
              autoFocus
            />
          )
        }

        return (
          <div
            className="text-right cursor-pointer hover:text-primary"
            onDoubleClick={() => {
              setEditingCell({ id: row.original.id, column: column.id })
              setEditValue(row.original.cost.toString())
            }}
          >
            ${row.original.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row, column }) => {
        const isEditing = editingCell?.id === row.original.id && editingCell?.column === column.id

        if (isEditing) {
          return (
            <Input
              ref={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                setEditingCell(null)
                // Here you would update the data
                console.log(`Updated ${row.original.id} price to ${editValue}`)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingCell(null)
                  // Here you would update the data
                  console.log(`Updated ${row.original.id} price to ${editValue}`)
                }
                if (e.key === "Escape") {
                  setEditingCell(null)
                }
              }}
              className="h-8 w-full"
              type="number"
              step="0.01"
              autoFocus
            />
          )
        }

        return (
          <div
            className="text-right font-medium cursor-pointer hover:text-primary"
            onDoubleClick={() => {
              setEditingCell({ id: row.original.id, column: column.id })
              setEditValue(row.original.price.toString())
            }}
          >
            ${row.original.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-muted/50">
          {row.original.location}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <Badge
            className={cn(
              "capitalize",
              row.original.status === "available" && "bg-green-500 hover:bg-green-600",
              row.original.status === "reserved" && "bg-amber-500 hover:bg-amber-600",
              row.original.status === "sold" && "bg-blue-500 hover:bg-blue-600",
            )}
          >
            {row.original.status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleView(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
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
              <DropdownMenuItem onClick={() => handlePrintLabel(row.original)}>
                <Tag className="mr-2 h-4 w-4" />
                Print Label
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(row.original)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArchive(row.original)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Focus the edit input when editing starts
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingCell])

  // Make columns resizable
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (tableContainerRef.current) {
        const tableWidth = tableContainerRef.current.offsetWidth
        // Adjust column widths based on container width
        // This is a simple implementation - you might want to make this more sophisticated
        if (tableWidth < 768) {
          setColumnVisibility({
            image: true,
            sku: true,
            name: true,
            price: true,
            status: true,
            actions: true,
            category: false,
            metal: false,
            purity: false,
            primaryStone: false,
            weight: false,
            cost: false,
            location: false,
          })
        }
      }
    })

    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleView = (item: InventoryItem) => {
    router.push(`/inventory/${item.id}`)
  }

  const handleEdit = (item: InventoryItem) => {
    router.push(`/inventory/${item.id}/edit`)
  }

  const handleDuplicate = async (item: InventoryItem) => {
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

  const handleArchive = async (item: InventoryItem) => {
    if (confirm("Are you sure you want to archive this item? You can unarchive it later from the archive section.")) {
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
    } else {
      toast({
        title: "Archive cancelled",
        description: "The item was not archived.",
        variant: "default",
      })
    }
  }

  const handleDelete = async (item: InventoryItem) => {
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

  const handlePrintLabel = (item: InventoryItem) => {
    // Implement label printing functionality
    console.log("Printing label for item:", item)
    toast({
      title: "Printing label",
      description: "The label is being prepared for printing.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
              selected.
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        className="rounded-md border overflow-auto"
        ref={tableContainerRef}
        style={{
          maxWidth: "100%",
          // Enable horizontal scrolling on mobile
          overflowX: "auto",
          // Make the first column sticky on mobile
          position: "relative",
        }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap",
                        // Make the first column sticky on mobile
                        (header.id === "select" || header.id === "image") && isMobile && "sticky left-0 bg-white z-20",
                      )}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        // Make the first column sticky on mobile
                        (cell.column.id === "select" || cell.column.id === "image") &&
                          isMobile &&
                          "sticky left-0 bg-white z-10",
                        // Add hover background to maintain visibility of sticky columns
                        row.getIsSelected() &&
                          (cell.column.id === "select" || cell.column.id === "image") &&
                          "bg-muted/50",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} items
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
