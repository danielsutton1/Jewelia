"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Scale,
  Gem,
  Crown,
  Zap,
  RefreshCw,
  Download,
  Upload,
  BarChart3
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Material {
  id: string
  name: string
  category: string
  type: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  unitPrice: number
  totalValue: number
  supplier: string
  location: string
  lastUpdated: string
  status: "in_stock" | "low_stock" | "out_of_stock" | "on_order"
  quality: "excellent" | "good" | "fair" | "poor"
  certifications: string[]
  notes: string
}

// Sample materials data
const sampleMaterials: Material[] = [
  {
    id: "M001",
    name: "14K Yellow Gold",
    category: "Precious Metals",
    type: "Gold",
    currentStock: 250,
    minStock: 100,
    maxStock: 500,
    unit: "g",
    unitPrice: 45.50,
    totalValue: 11375,
    supplier: "GoldCorp Metals",
    location: "Vault A",
    lastUpdated: "2024-01-15",
    status: "in_stock",
    quality: "excellent",
    certifications: ["LBMA", "ISO 9001"],
    notes: "High purity gold for premium jewelry"
  },
  {
    id: "M002",
    name: "Diamond 1ct Round Brilliant",
    category: "Gemstones",
    type: "Diamond",
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    unit: "pcs",
    unitPrice: 8500,
    totalValue: 68000,
    supplier: "Diamond Source Inc",
    location: "Vault B",
    lastUpdated: "2024-01-14",
    status: "low_stock",
    quality: "excellent",
    certifications: ["GIA", "IGI"],
    notes: "VS1 clarity, D color"
  },
  {
    id: "M003",
    name: "Sterling Silver",
    category: "Precious Metals",
    type: "Silver",
    currentStock: 500,
    minStock: 200,
    maxStock: 1000,
    unit: "g",
    unitPrice: 0.85,
    totalValue: 425,
    supplier: "Silver Solutions",
    location: "Storage C",
    lastUpdated: "2024-01-13",
    status: "in_stock",
    quality: "good",
    certifications: ["ISO 9001"],
    notes: "925 sterling silver"
  },
  {
    id: "M004",
    name: "Sapphire 2ct Oval",
    category: "Gemstones",
    type: "Sapphire",
    currentStock: 3,
    minStock: 2,
    maxStock: 10,
    unit: "pcs",
    unitPrice: 1200,
    totalValue: 3600,
    supplier: "Gemstone World",
    location: "Vault B",
    lastUpdated: "2024-01-12",
    status: "low_stock",
    quality: "excellent",
    certifications: ["GRS"],
    notes: "Royal blue, untreated"
  },
  {
    id: "M005",
    name: "Platinum",
    category: "Precious Metals",
    type: "Platinum",
    currentStock: 50,
    minStock: 25,
    maxStock: 100,
    unit: "g",
    unitPrice: 32.00,
    totalValue: 1600,
    supplier: "Platinum Plus",
    location: "Vault A",
    lastUpdated: "2024-01-11",
    status: "in_stock",
    quality: "excellent",
    certifications: ["LBMA", "ISO 9001"],
    notes: "99.95% pure platinum"
  },
  {
    id: "M006",
    name: "Lobster Clasp 14K",
    category: "Findings",
    type: "Clasp",
    currentStock: 0,
    minStock: 10,
    maxStock: 50,
    unit: "pcs",
    unitPrice: 25.00,
    totalValue: 0,
    supplier: "Findings Factory",
    location: "Storage D",
    lastUpdated: "2024-01-10",
    status: "out_of_stock",
    quality: "good",
    certifications: ["ISO 9001"],
    notes: "14K gold lobster clasp"
  }
]

export function MaterialInventoryManager() {
  const [materials, setMaterials] = useState<Material[]>(sampleMaterials)
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>(sampleMaterials)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [qualityFilter, setQualityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Calculate inventory statistics
  const stats = {
    totalItems: materials.length,
    totalValue: materials.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockItems: materials.filter(item => item.status === "low_stock").length,
    outOfStockItems: materials.filter(item => item.status === "out_of_stock").length,
    onOrderItems: materials.filter(item => item.status === "on_order").length,
    averageUtilization: Math.round(
      materials.reduce((sum, item) => sum + (item.currentStock / item.maxStock) * 100, 0) / materials.length
    )
  }

  useEffect(() => {
    let filtered = materials

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Apply quality filter
    if (qualityFilter !== "all") {
      filtered = filtered.filter(item => item.quality === qualityFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Material]
      let bValue: any = b[sortBy as keyof Material]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredMaterials(filtered)
  }, [materials, searchTerm, categoryFilter, statusFilter, qualityFilter, sortBy, sortOrder])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
      case "low_stock":
        return <Badge className="bg-amber-100 text-amber-800">Low Stock</Badge>
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
      case "on_order":
        return <Badge className="bg-blue-100 text-blue-800">On Order</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case "fair":
        return <Badge className="bg-amber-100 text-amber-800">Fair</Badge>
      case "poor":
        return <Badge className="bg-red-100 text-red-800">Poor</Badge>
      default:
        return <Badge variant="outline">{quality}</Badge>
    }
  }

  const getStockUtilization = (current: number, max: number) => {
    return Math.round((current / max) * 100)
  }

  const handleAddMaterial = () => {
    toast({ title: "Add Material", description: "Navigate to add new material form." })
  }

  const handleEditMaterial = (id: string) => {
    toast({ title: "Edit Material", description: `Edit material ${id}` })
  }

  const handleViewMaterial = (id: string) => {
    toast({ title: "View Material", description: `View details for material ${id}` })
  }

  const handleDeleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(item => item.id !== id))
    toast({ title: "Material Deleted", description: `Material ${id} has been removed.` })
  }

  const handleExportInventory = () => {
    toast({ title: "Export Started", description: "Inventory data export has been initiated." })
  }

  const handleImportInventory = () => {
    toast({ title: "Import Started", description: "Inventory data import has been initiated." })
  }

  const categories = Array.from(new Set(materials.map(item => item.category)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Track and manage all materials in your inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Import/Export">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImportInventory}>
                <Upload className="h-4 w-4 mr-2" /> Import
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportInventory}>
                <Download className="h-4 w-4 mr-2" /> Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddMaterial}>
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageUtilization}% avg utilization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Average: ${Math.round(stats.totalValue / stats.totalItems).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.outOfStockItems} out of stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Order</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.onOrderItems}</div>
            <p className="text-xs text-muted-foreground">
              Pending delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Filter and search through your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="on_order">On Order</SelectItem>
              </SelectContent>
            </Select>
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="currentStock">Stock Level</SelectItem>
                <SelectItem value="totalValue">Value</SelectItem>
                <SelectItem value="lastUpdated">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items ({filteredMaterials.length})</CardTitle>
          <CardDescription>Manage your material inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{material.name}</div>
                      <div className="text-sm text-muted-foreground">{material.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{material.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {material.currentStock} {material.unit}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {material.maxStock}
                        </span>
                      </div>
                      <Progress 
                        value={getStockUtilization(material.currentStock, material.maxStock)} 
                        className="h-2 w-20"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${material.totalValue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        ${material.unitPrice}/{material.unit}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(material.status)}</TableCell>
                  <TableCell>{getQualityBadge(material.quality)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{material.supplier}</div>
                    <div className="text-xs text-muted-foreground">{material.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{material.lastUpdated}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewMaterial(material.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditMaterial(material.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {stats.lowStockItems > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            {stats.lowStockItems} materials are running low on stock. Consider placing reorders to maintain production capacity.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 
 