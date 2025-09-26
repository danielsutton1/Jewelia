"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Gem, Plus, ShoppingCart, Filter, Download, Upload, MoreHorizontal, ArrowUpDown, Eye, Edit, Trash, Copy, Barcode, Tag, Crown, Sparkles, TrendingUp, DollarSign, Package, Clock, CheckCircle, AlertCircle, Star, Target, Settings, RefreshCw, Activity, Zap, Award, Shield, Globe, Briefcase, Search, Database, Warehouse, Diamond, Circle, Square, Hexagon, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog as UIDialog } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InventoryTags } from "@/components/inventory/inventory-tags"
import { EnhancedInventoryAnalytics } from "@/components/inventory/enhanced-inventory-analytics"
import { EnhancedInventoryTracking } from "@/components/inventory/enhanced-inventory-tracking"
import { ShareInventoryDialog } from "@/components/inventory-sharing/ShareInventoryDialog"

// Define a type for Jewelry Item
interface JewelryItem {
  sku: string
  productType: string
  name: string
  description: string
  price: number
  status: string
  vendor: string
  location: string
  memo: boolean
  notes: string
  
  // Common fields for most jewelry
  metal: string
  sizesAvailable: string[]
  
  // Ring specific fields
  ringSize?: number
  bandWidth?: number
  settingType?: string
  
  // Necklace specific fields
  necklaceLength?: number
  chainType?: string
  claspType?: string
  
  // Bracelet specific fields
  braceletLength?: number
  braceletWidth?: number
  braceletClaspType?: string
  
  // Earring specific fields
  earringType?: string
  backingType?: string
  
  // Watch specific fields
  watchMovement?: string
  watchCaseSize?: number
  watchBandType?: string
  
  // Cufflink specific fields
  cufflinkStyle?: string
  
  // Tie clip specific fields
  tieClipStyle?: string
  
  // Pocket watch specific fields
  pocketWatchMovement?: string
  pocketWatchCaseSize?: number
  
  // Diamond/Gemstone specific fields
  diamondType?: string
  totalCaratWeight?: number
  numberOfDiamonds?: number
  stoneShape?: string
  stoneColor?: string
  stoneClarity?: string
  stoneCut?: string
  certificate?: string
  
  // Dimensions
  length?: number
  width?: number
  height?: number
  weight?: number
}

// Raw Materials interface
interface RawMaterial {
  sku: string
  name: string
  type: string
  material: string
  weight: number
  purity: string
  status: string
  vendor: string
  location: string
  price: number
  notes: string
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
}

// Loose Stones interface
interface LooseStone {
  sku: string
  name: string
  type: string
  shape: string
  carat: number
  color: string
  clarity: string
  cut: string
  certificate?: string
  status: string
  vendor: string
  location: string
  price: number
  notes: string
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
}

// Add sync status type
interface JewelryItemWithSync extends JewelryItem {
  shopifySyncStatus?: "not_synced" | "pending" | "synced" | "error"
  shopifyProductId?: string
  woocommerceSyncStatus?: "not_synced" | "pending" | "synced" | "error"
  woocommerceProductId?: string
  platform?: string // selected platform for this row
}

const initialJewelryItems: JewelryItem[] = [
  {
    sku: "RING-001",
    productType: "Ring",
    name: "Classic Solitaire Engagement Ring",
    description: "Beautiful 1.01 carat round diamond in 18k white gold setting",
    price: 8500,
    status: "In Stock",
    vendor: "Brilliant Gems",
    location: "Safe 1",
    memo: false,
    notes: "Excellent cut, no fluorescence",
    metal: "18k White Gold",
    sizesAvailable: ["5", "6", "7", "8", "9"],
    ringSize: 7,
    bandWidth: 2.5,
    settingType: "Prong",
    diamondType: "Natural Diamond",
    totalCaratWeight: 1.01,
    numberOfDiamonds: 1,
    stoneShape: "Round",
    stoneColor: "G",
    stoneClarity: "VS1",
    stoneCut: "Excellent",
    certificate: "GIA 1234567",
    length: 2.5,
    width: 2.5,
    height: 1.8,
    weight: 3.2
  },
  {
    sku: "NECK-001",
    productType: "Necklace",
    name: "Diamond Tennis Necklace",
    description: "Elegant tennis necklace with 5 carats of diamonds",
    price: 12000,
    status: "In Stock",
    vendor: "Diamond Source",
    location: "Safe 2",
    memo: false,
    notes: "Perfect for special occasions",
    metal: "14k White Gold",
    sizesAvailable: ["16", "18", "20"],
    necklaceLength: 18,
    chainType: "Tennis",
    claspType: "Lobster",
    diamondType: "Natural Diamond",
    totalCaratWeight: 5.0,
    numberOfDiamonds: 45,
    stoneShape: "Round",
    stoneColor: "F",
    stoneClarity: "VS2",
    stoneCut: "Very Good",
    length: 18,
    width: 0.5,
    height: 0.3,
    weight: 8.5
  },
  {
    sku: "BRAC-001",
    productType: "Bracelet",
    name: "Diamond Tennis Bracelet",
    description: "Classic tennis bracelet with 3 carats of diamonds",
    price: 7500,
    status: "On Memo",
    vendor: "Gem Traders",
    location: "Memo to ABC Jewelers",
    memo: true,
    notes: "On memo until 2024-06-01",
    metal: "14k Yellow Gold",
    sizesAvailable: ["7", "7.5", "8"],
    braceletLength: 7.5,
    braceletWidth: 0.4,
    braceletClaspType: "Box",
    diamondType: "Natural Diamond",
    totalCaratWeight: 3.0,
    numberOfDiamonds: 25,
    stoneShape: "Round",
    stoneColor: "G",
    stoneClarity: "SI1",
    stoneCut: "Good",
    length: 7.5,
    width: 0.4,
    height: 0.2,
    weight: 5.8
  },
  {
    sku: "EARR-001",
    productType: "Earrings",
    name: "Diamond Stud Earrings",
    description: "Classic 1 carat total weight diamond studs",
    price: 3200,
    status: "In Stock",
    vendor: "Brilliant Gems",
    location: "Safe 1",
    memo: false,
    notes: "Perfect everyday earrings",
    metal: "14k White Gold",
    sizesAvailable: ["Standard"],
    earringType: "Stud",
    backingType: "Push Back",
    diamondType: "Natural Diamond",
    totalCaratWeight: 1.0,
    numberOfDiamonds: 2,
    stoneShape: "Round",
    stoneColor: "H",
    stoneClarity: "SI2",
    stoneCut: "Very Good",
    length: 0.3,
    width: 0.3,
    height: 0.2,
    weight: 2.1
  },
  {
    sku: "WATCH-001",
    productType: "Watch",
    name: "Luxury Diamond Watch",
    description: "Swiss automatic watch with diamond bezel",
    price: 15000,
    status: "In Stock",
    vendor: "Luxury Timepieces",
    location: "Safe 3",
    memo: false,
    notes: "Limited edition, serial number 001",
    metal: "18k Rose Gold",
    sizesAvailable: ["38mm", "40mm", "42mm"],
    watchMovement: "Automatic",
    watchCaseSize: 40,
    watchBandType: "Leather",
    diamondType: "Natural Diamond",
    totalCaratWeight: 2.5,
    numberOfDiamonds: 12,
    stoneShape: "Round",
    stoneColor: "F",
    stoneClarity: "VS1",
    stoneCut: "Excellent",
    length: 40,
    width: 40,
    height: 12,
    weight: 85
  }
]

const initialRawMaterials: RawMaterial[] = [
  {
    sku: "GOLD-001",
    name: "18k White Gold Sheet",
    type: "Sheet",
    material: "Gold",
    weight: 50.5,
    purity: "18k",
    status: "In Stock",
    vendor: "Metal Suppliers Inc",
    location: "Storage A",
    price: 2500,
    notes: "High quality sheet for ring making",
    dimensions: { length: 100, width: 50, height: 0.5 }
  },
  {
    sku: "PLAT-001",
    name: "Platinum Wire",
    type: "Wire",
    material: "Platinum",
    weight: 25.0,
    purity: "950",
    status: "In Stock",
    vendor: "Precious Metals Co",
    location: "Storage B",
    price: 1800,
    notes: "Fine wire for delicate work",
    dimensions: { length: 200, width: 0.5, height: 0.5 }
  },
  {
    sku: "SILV-001",
    name: "Sterling Silver Sheet",
    type: "Sheet",
    material: "Silver",
    weight: 100.0,
    purity: "925",
    status: "In Stock",
    vendor: "Silver Supply",
    location: "Storage C",
    price: 800,
    notes: "Standard sheet for various projects",
    dimensions: { length: 150, width: 75, height: 1.0 }
  }
]

const initialLooseStones: LooseStone[] = [
  {
    sku: "DIA-001",
    name: "Round Brilliant Diamond",
    type: "Diamond",
    shape: "Round",
    carat: 1.01,
    color: "G",
    clarity: "VS1",
    cut: "Excellent",
    certificate: "GIA 1234567",
    status: "In Stock",
    vendor: "Brilliant Gems",
    location: "Stone Safe 1",
    price: 6500,
    notes: "No fluorescence, excellent make",
    dimensions: { length: 6.5, width: 6.5, height: 3.9 }
  },
  {
    sku: "RUBY-001",
    name: "Burmese Ruby",
    type: "Ruby",
    shape: "Oval",
    carat: 2.5,
    color: "Pigeon Blood",
    clarity: "VS2",
    cut: "Very Good",
    status: "In Stock",
    vendor: "Gem Traders",
    location: "Stone Safe 2",
    price: 4500,
    notes: "Natural Burmese ruby, untreated",
    dimensions: { length: 8.2, width: 6.1, height: 3.8 }
  },
  {
    sku: "SAPH-001",
    name: "Ceylon Sapphire",
    type: "Sapphire",
    shape: "Cushion",
    carat: 3.2,
    color: "Royal Blue",
    clarity: "VS1",
    cut: "Excellent",
    status: "On Memo",
    vendor: "Ceylon Gems",
    location: "Memo to XYZ Jewelers",
    price: 7200,
    notes: "Classic Ceylon sapphire, heat treated",
    dimensions: { length: 9.1, width: 7.8, height: 4.2 }
  }
]

const jewelryAttributes: { id: keyof JewelryItem; label: string }[] = [
  { id: "sku", label: "SKU" },
  { id: "productType", label: "Type" },
  { id: "name", label: "Name" },
  { id: "metal", label: "Metal" },
  { id: "totalCaratWeight", label: "Total Carat" },
  { id: "numberOfDiamonds", label: "Diamonds" },
  { id: "price", label: "Price ($)" },
  { id: "status", label: "Status" },
  { id: "vendor", label: "Vendor" },
  { id: "location", label: "Location" },
]

const rawMaterialAttributes: { id: keyof RawMaterial; label: string }[] = [
  { id: "sku", label: "SKU" },
  { id: "name", label: "Name" },
  { id: "type", label: "Type" },
  { id: "material", label: "Material" },
  { id: "weight", label: "Weight (g)" },
  { id: "purity", label: "Purity" },
  { id: "price", label: "Price ($)" },
  { id: "status", label: "Status" },
  { id: "vendor", label: "Vendor" },
  { id: "location", label: "Location" },
]

const looseStoneAttributes: { id: keyof LooseStone; label: string }[] = [
  { id: "sku", label: "SKU" },
  { id: "name", label: "Name" },
  { id: "type", label: "Type" },
  { id: "shape", label: "Shape" },
  { id: "carat", label: "Carat" },
  { id: "color", label: "Color" },
  { id: "clarity", label: "Clarity" },
  { id: "cut", label: "Cut" },
  { id: "price", label: "Price ($)" },
  { id: "status", label: "Status" },
  { id: "vendor", label: "Vendor" },
  { id: "location", label: "Location" },
]

const productTypes = ["Ring", "Necklace", "Bracelet", "Earrings", "Watch", "Cufflinks", "Tie Clip", "Pocket Watch"]
const metals = ["14k White Gold", "14k Yellow Gold", "14k Rose Gold", "18k White Gold", "18k Yellow Gold", "18k Rose Gold", "Platinum", "Sterling Silver"]
const statuses = ["In Stock", "On Memo", "Sold", "On Hold"]
const vendors = ["Brilliant Gems", "Diamond Source", "Gem Traders", "Luxury Timepieces"]

// Additional constants for raw materials and stones
const rawMaterialTypes = ["Sheet", "Wire", "Tube", "Bar", "Granules", "Powder"]
const rawMaterialNames = ["Gold", "Silver", "Platinum", "Palladium", "Copper", "Brass"]
const purities = ["24k", "22k", "18k", "14k", "10k", "950", "925", "900", "800"]
const stoneTypes = ["Diamond", "Ruby", "Sapphire", "Emerald", "Pearl", "Opal", "Amethyst", "Citrine", "Garnet", "Topaz"]
const stoneShapes = ["Round", "Oval", "Princess", "Cushion", "Emerald", "Asscher", "Marquise", "Radiant", "Pear", "Heart"]
const stoneColors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
const stoneClarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"]
const stoneCuts = ["Excellent", "Very Good", "Good", "Fair", "Poor"]

const PLATFORMS = [
  { id: 'shopify', label: 'Shopify' },
  { id: 'woocommerce', label: 'WooCommerce' },
]

// Helper functions for platform-specific fields
function getProductId(d: JewelryItemWithSync, platform: string) {
  return platform === 'shopify' ? d.shopifyProductId : d.woocommerceProductId
}
function getSyncStatus(d: JewelryItemWithSync, platform: string) {
  return platform === 'shopify' ? d.shopifySyncStatus : d.woocommerceSyncStatus
}

const formatPrice = (price: number) => {
  return `$${price.toLocaleString('en-US')}`
}

// Mock analytics data for inventory management
const mockInventoryAnalytics = {
  totalItems: 2847,
  totalValue: 8450000,
  lowStockItems: 89,
  outOfStockItems: 23,
  averageValue: 2970,
  topCategories: [
    { name: "Diamond Rings", count: 456, value: 2100000 },
    { name: "Gold Necklaces", count: 823, value: 1800000 },
    { name: "Silver Bracelets", count: 289, value: 450000 },
    { name: "Pearl Earrings", count: 167, value: 280000 }
  ],
  recentActivity: [
    { type: "added", item: "Diamond Ring", sku: "RING-2024-001", time: "2 hours ago" },
    { type: "sold", item: "Gold Necklace", sku: "NECK-2024-002", time: "4 hours ago" },
    { type: "low_stock", item: "Silver Bracelet", sku: "BRAC-2024-003", time: "6 hours ago" },
    { type: "restocked", item: "Pearl Earrings", sku: "EARR-2024-004", time: "1 day ago" }
  ]
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
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create inventory item')
  }

  const result = await response.json()
  return result.data
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

// Inventory type from API
interface InventoryItem {
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

export default function JewelryInventoryPage() {
  // Add state for real inventory data from API
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [jewelryItems, setJewelryItems] = useState<JewelryItemWithSync[]>(initialJewelryItems.map(d => ({ ...d, shopifySyncStatus: "not_synced", woocommerceSyncStatus: "not_synced", platform: 'shopify' })))
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(initialRawMaterials)
  const [looseStones, setLooseStones] = useState<LooseStone[]>(initialLooseStones)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("sku")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [selectedItem, setSelectedItem] = useState<JewelryItemWithSync | RawMaterial | LooseStone | null>(null)
  const [editItem, setEditItem] = useState<JewelryItemWithSync | RawMaterial | LooseStone | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState<{ open: boolean; item: JewelryItemWithSync | RawMaterial | LooseStone | null }>({ open: false, item: null })
  const [logDialog, setLogDialog] = useState<{ open: boolean; logs: any[]; itemId?: string }>({ open: false, logs: [], itemId: undefined })
  const [activeTab, setActiveTab] = useState("jewelry")
  const [shareInventoryDialog, setShareInventoryDialog] = useState<{ open: boolean; selectedItems: any[] }>({ open: false, selectedItems: [] })

  // Fetch inventory data from API
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchInventory()
        setInventoryItems(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load inventory')
        toast.error('Failed to load inventory data')
      } finally {
        setLoading(false)
      }
    }

    loadInventory()
  }, [])

  // Function to refresh inventory data
  const refreshInventory = async () => {
    try {
      setLoading(true)
      const data = await fetchInventory()
      setInventoryItems(data)
      toast.success('Inventory refreshed successfully')
    } catch (err: any) {
      toast.error('Failed to refresh inventory')
    } finally {
      setLoading(false)
    }
  }

  // Advanced filter state
  const [filterProductType, setFilterProductType] = useState<string>("all")
  const [filterMetal, setFilterMetal] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterVendor, setFilterVendor] = useState<string>("all")
  const [caratMin, setCaratMin] = useState<string>("")
  const [caratMax, setCaratMax] = useState<string>("")
  
  // Raw material filters
  const [filterMaterialType, setFilterMaterialType] = useState<string>("all")
  const [filterMaterial, setFilterMaterial] = useState<string>("all")
  const [filterPurity, setFilterPurity] = useState<string>("all")
  
  // Stone filters
  const [filterStoneType, setFilterStoneType] = useState<string>("all")
  const [filterStoneShape, setFilterStoneShape] = useState<string>("all")
  const [filterStoneColor, setFilterStoneColor] = useState<string>("all")
  const [filterStoneClarity, setFilterStoneClarity] = useState<string>("all")
  
  // Add Item dialog state
  const [newItem, setNewItem] = useState<any>({
    productType: "Ring",
    name: "",
    description: "",
    price: 0,
    status: "In Stock",
    vendor: vendors[0],
    location: "",
    memo: false,
    notes: "",
    metal: metals[0],
    sizesAvailable: [],
  })
  const [isScanning, setIsScanning] = useState(false)
  const csvLinkRef = useRef<HTMLAnchorElement>(null)
  const [filterShopifySync, setFilterShopifySync] = useState<"all" | "synced" | "not_synced" | "pending" | "error">("all")

  // Incremental search and advanced filter
  const filteredItems = useMemo(() => {
    let data = jewelryItems.filter((d) => {
      const q = search.toLowerCase()
      const match = (
        d.sku.toLowerCase().includes(q) ||
        d.productType.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.metal.toLowerCase().includes(q) ||
        (d.totalCaratWeight?.toString() || "").includes(q) ||
        (d.numberOfDiamonds?.toString() || "").includes(q) ||
        d.status.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      )
      if (filterProductType !== "all" && d.productType !== filterProductType) return false
      if (filterMetal !== "all" && d.metal !== filterMetal) return false
      if (filterStatus !== "all" && d.status !== filterStatus) return false
      if (filterVendor !== "all" && d.vendor !== filterVendor) return false
      if (caratMin && (d.totalCaratWeight || 0) < parseFloat(caratMin)) return false
      if (caratMax && (d.totalCaratWeight || 0) > parseFloat(caratMax)) return false
      if (filterShopifySync !== "all" && getSyncStatus(d, filterShopifySync) !== filterShopifySync) return false
      return match
    })
    data = data.sort((a, b) => {
      const aVal = String((a as any)[sortBy] || "")
      const bVal = String((b as any)[sortBy] || "")
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return data
  }, [jewelryItems, search, sortBy, sortDir, filterProductType, filterMetal, filterStatus, filterVendor, caratMin, caratMax, filterShopifySync])

  // Filter raw materials
  const filteredRawMaterials = useMemo(() => {
    let data = rawMaterials.filter((item) => {
      const q = search.toLowerCase()
      const match = (
        item.sku.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.material.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      )
      if (filterMaterialType !== "all" && item.type !== filterMaterialType) return false
      if (filterMaterial !== "all" && item.material !== filterMaterial) return false
      if (filterPurity !== "all" && item.purity !== filterPurity) return false
      if (filterStatus !== "all" && item.status !== filterStatus) return false
      if (filterVendor !== "all" && item.vendor !== filterVendor) return false
      return match
    })
    data = data.sort((a, b) => {
      const aVal = String((a as any)[sortBy] || "")
      const bVal = String((b as any)[sortBy] || "")
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return data
  }, [rawMaterials, search, sortBy, sortDir, filterMaterialType, filterMaterial, filterPurity, filterStatus, filterVendor])

  // Filter loose stones
  const filteredLooseStones = useMemo(() => {
    let data = looseStones.filter((item) => {
      const q = search.toLowerCase()
      const match = (
        item.sku.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.shape.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.clarity.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      )
      if (filterStoneType !== "all" && item.type !== filterStoneType) return false
      if (filterStoneShape !== "all" && item.shape !== filterStoneShape) return false
      if (filterStoneColor !== "all" && item.color !== filterStoneColor) return false
      if (filterStoneClarity !== "all" && item.clarity !== filterStoneClarity) return false
      if (filterStatus !== "all" && item.status !== filterStatus) return false
      if (filterVendor !== "all" && item.vendor !== filterVendor) return false
      if (caratMin && item.carat < parseFloat(caratMin)) return false
      if (caratMax && item.carat > parseFloat(caratMax)) return false
      return match
    })
    data = data.sort((a, b) => {
      const aVal = String((a as any)[sortBy] || "")
      const bVal = String((b as any)[sortBy] || "")
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return data
  }, [looseStones, search, sortBy, sortDir, filterStoneType, filterStoneShape, filterStoneColor, filterStoneClarity, filterStatus, filterVendor, caratMin, caratMax])

  const handleSort = (attr: string) => {
    if (sortBy === attr) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(attr)
      setSortDir("asc")
    }
  }

  const handleAddItem = async () => {
    // Validate required fields
    if (!newItem.name.trim()) {
      toast.error("Please enter an item name")
      return
    }
    if (!newItem.productType) {
      toast.error("Please select a product type")
      return
    }
    if (newItem.price <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    try {
      // Generate a new SKU based on product type
      const typePrefix = newItem.productType.substring(0, 4).toUpperCase()
      const nextId = `${typePrefix}-${(jewelryItems.length + 1).toString().padStart(3, "0")}`
      
      const itemToAdd = {
        sku: nextId,
        name: newItem.name,
        description: newItem.description,
        category: newItem.productType,
        unit_price: newItem.price,
        unit_cost: newItem.price * 0.6, // Assume 40% margin
        quantity: 1,
        status: newItem.status.toLowerCase().replace(' ', '_'),
        // Additional jewelry-specific fields
        productType: newItem.productType,
        metal: newItem.metal,
        vendor: newItem.vendor,
        location: newItem.location,
        memo: newItem.memo,
        notes: newItem.notes,
        sizesAvailable: newItem.sizesAvailable,
        // Ring specific fields
        caratWeight: newItem.caratWeight,
        diamondCount: newItem.diamondCount,
        // Necklace specific fields
        chainLength: newItem.chainLength,
        pendantSize: newItem.pendantSize,
        // Earring specific fields
        earringType: newItem.earringType,
        // Bracelet specific fields
        braceletLength: newItem.braceletLength,
        // Watch specific fields
        watchMovement: newItem.watchMovement,
        watchCaseSize: newItem.watchCaseSize,
        // Common metadata
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as JewelryItemWithSync

      // Try to add to backend first - call both inventory and products APIs
      try {
        // Call inventory API
        const inventoryResponse = await fetch('/api/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemToAdd),
        })

        // Call products API for product data flow
        const productData = {
          name: itemToAdd.name,
          sku: itemToAdd.sku,
          price: itemToAdd.unit_price,
          stock: itemToAdd.quantity,
          category: itemToAdd.category,
          status: itemToAdd.status,
          description: itemToAdd.description,
          cost: itemToAdd.unit_cost,
          material: itemToAdd.metal,
          // Add jewelry-specific fields
          carat_weight: itemToAdd.caratWeight,
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

        if (inventoryResponse.ok && productsResponse.ok) {
          const inventoryResult = await inventoryResponse.json()
          const productsResult = await productsResponse.json()
          // Use the item returned from the API if successful
          setJewelryItems([...jewelryItems, inventoryResult.data || itemToAdd])
          toast.success("Item added successfully to inventory and products!")
        } else {
          throw new Error('API call failed')
        }
      } catch (apiError) {
        // Fallback: Add to local state when API fails
        console.log('API failed, adding to local state:', apiError)
        setJewelryItems([...jewelryItems, itemToAdd])
        toast.success("Item added to local inventory (API connection failed)")
      }

      // Close modal and reset form
      setShowAdd(false)
      setNewItem({
        productType: "Ring",
        name: "",
        description: "",
        price: 0,
        status: "In Stock",
        vendor: vendors[0],
        location: "",
        memo: false,
        notes: "",
        metal: metals[0],
        sizesAvailable: [],
      })
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error("Failed to add item. Please try again.")
    }
  }

  // Platform-specific sync logic
  const handleSyncToPlatform = async (itemId: string, platform: string) => {
    setJewelryItems(prev => prev.map(d =>
      d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "pending" } : d
    ))
    const item = jewelryItems.find(d => d.sku === itemId)
    if (!item) return
    try {
      let res
      if (platform === 'shopify') {
        res = await fetch("/api/shopify/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: item }),
        })
      } else if (platform === 'woocommerce') {
        res = await fetch("/api/woocommerce/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: item }),
        })
      }
      if (res && res.ok) {
        const data = await res.json()
        setJewelryItems(prev => prev.map(d =>
          d.sku === itemId ? {
            ...d,
            [`${platform}SyncStatus`]: "synced",
            [`${platform}ProductId`]: data[`${platform}ProductId`] || getProductId(d, platform),
          } : d
        ))
        toast.success(`Item ${itemId} synced to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`)
      } else {
        setJewelryItems(prev => prev.map(d =>
          d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "error" } : d
        ))
        toast.error(`Failed to sync item ${itemId} to ${platform}.`)
      }
    } catch (e) {
      setJewelryItems(prev => prev.map(d =>
        d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "error" } : d
      ))
      toast.error(`Failed to sync item ${itemId} to ${platform}.`)
    }
  }

  const handleUpdateOnPlatform = async (itemId: string, platform: string) => {
    setJewelryItems(prev => prev.map(d =>
      d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "pending" } : d
    ))
    const item = jewelryItems.find(d => d.sku === itemId)
    if (!item) return
    try {
      let res
      if (platform === 'shopify') {
        res = await fetch("/api/shopify/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shopifyProductId: getProductId(item, platform) || "gid://shopify/Product/1234567890", updates: item }),
        })
      } else if (platform === 'woocommerce') {
        res = await fetch("/api/woocommerce/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ woocommerceProductId: getProductId(item, platform) || "12345", updates: item }),
        })
      }
      if (res && res.ok) {
        setJewelryItems(prev => prev.map(d =>
          d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "synced" } : d
        ))
        toast.success(`Item ${itemId} updated on ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`)
      } else {
        setJewelryItems(prev => prev.map(d =>
          d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "error" } : d
        ))
        toast.error(`Failed to update item ${itemId} on ${platform}.`)
      }
    } catch (e) {
      setJewelryItems(prev => prev.map(d =>
        d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "error" } : d
      ))
      toast.error(`Failed to update item ${itemId} on ${platform}.`)
    }
  }

  const handleSyncInventoryPlatform = async (itemId: string, platform: string) => {
    setJewelryItems(prev => prev.map(d =>
      d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "pending" } : d
    ))
    const item = jewelryItems.find(d => d.sku === itemId)
    if (!item) return
    try {
      let res
      if (platform === 'shopify') {
        res = await fetch("/api/shopify/sync-inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shopifyProductId: getProductId(item, platform) || "gid://shopify/Product/1234567890", quantity: 1 }),
        })
      } else if (platform === 'woocommerce') {
        res = await fetch("/api/woocommerce/sync-inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ woocommerceProductId: getProductId(item, platform) || "12345", quantity: 1 }),
        })
      }
      if (res && res.ok) {
        setJewelryItems(prev => prev.map(d =>
          d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "synced" } : d
        ))
        toast.success(`Inventory for item ${itemId} synced to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`)
      } else {
        setJewelryItems(prev => prev.map(d =>
          d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "error" } : d
        ))
        toast.error(`Failed to sync inventory for item ${itemId} to ${platform}.`)
      }
    } catch (e) {
      setJewelryItems(prev => prev.map(d =>
        d.sku === itemId ? { ...d, [`${platform}SyncStatus`]: "error" } : d
      ))
      toast.error(`Failed to sync inventory for item ${itemId} to ${platform}.`)
    }
  }

  const handleViewLogsPlatform = useCallback(async (itemId: string, platform: string) => {
    try {
      let res
      if (platform === 'shopify') {
        res = await fetch("/api/shopify/logs")
      } else if (platform === 'woocommerce') {
        res = await fetch("/api/woocommerce/logs")
      }
      if (res && res.ok) {
        const data = await res.json()
        setLogDialog({ open: true, logs: data.logs, itemId })
      } else {
        setLogDialog({ open: true, logs: [], itemId })
      }
    } catch {
      setLogDialog({ open: true, logs: [], itemId })
    }
  }, [])

  // CSV Export
  const handleExportCSV = () => {
    const headers = jewelryAttributes.map((a) => a.label)
    const rows = filteredItems.map((d) =>
      jewelryAttributes.map((a) => d[a.id]).join(",")
    )
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    if (csvLinkRef.current) {
      csvLinkRef.current.href = url
      csvLinkRef.current.download = `jewelry-${Date.now()}.csv`
      csvLinkRef.current.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }

  // Bulk sync for selected platform
  const handleBulkSyncToPlatform = async (platform: string) => {
    setJewelryItems(prev => prev.map(d =>
      selectedRows.includes(d.sku) ? { ...d, [`${platform}SyncStatus`]: "pending" } : d
    ))
    for (const itemId of selectedRows) {
      await handleSyncToPlatform(itemId, platform)
    }
    toast.success(`Selected items synced to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-1 p-1 w-full">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Inventory Management
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Comprehensive jewelry inventory tracking and management system</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Multi-Platform Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Secure Storage</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => setShowAdd(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Jewelry Item
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards - Matching Dashboard Style */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4">
            <div className="w-full overflow-x-auto md:overflow-visible">
              <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
                {/* Total Items */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Items</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Inventory
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {mockInventoryAnalytics.totalItems.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>+{mockInventoryAnalytics.lowStockItems} low stock</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total items in inventory
                    </p>
                  </CardContent>
                </Card>
                
                {/* Total Value */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Value</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Financial
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        ${(mockInventoryAnalytics.totalValue / 1000000).toFixed(1)}M
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>${mockInventoryAnalytics.averageValue.toLocaleString()} avg value</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total value of inventory
                    </p>
                  </CardContent>
                </Card>
                
                {/* Stock Status */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Stock Status</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Alert
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {mockInventoryAnalytics.outOfStockItems}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>out of stock</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Items out of stock
                    </p>
                  </CardContent>
                </Card>
                
                {/* Sync Status */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Sync Status</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Platform
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        98.5%
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>synced to platforms</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Platform synchronization status
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            {/* Enhanced Action Bar */}
            <div className="flex flex-wrap gap-2 mb-6 items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300" onClick={() => handleBulkSyncToPlatform('shopify')} disabled={selectedRows.length === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" /> Sync Selected to Shopify
                </Button>
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300" onClick={() => handleBulkSyncToPlatform('woocommerce')} disabled={selectedRows.length === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" /> Sync Selected to WooCommerce
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200" 
                  onClick={() => {
                    const selectedItems = filteredItems.filter(item => selectedRows.includes(item.sku))
                    setShareInventoryDialog({ open: true, selectedItems })
                  }} 
                  disabled={selectedRows.length === 0}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share Selected ({selectedRows.length})
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterShopifySync} onValueChange={v => setFilterShopifySync(v as any)}>
                  <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-slate-200">
                    <SelectValue placeholder="Shopify Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shopify Status</SelectItem>
                    <SelectItem value="synced">Synced</SelectItem>
                    <SelectItem value="not_synced">Not Synced</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  onClick={handleExportCSV}
                  aria-label="Export CSV"
                  title="Export CSV"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <a ref={csvLinkRef} style={{ display: 'none' }} />
              </div>
            </div>

            {/* Enhanced Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
                <TabsTrigger 
                  value="jewelry" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Gem className="h-4 w-4 text-white" />
                  </div>
                  Jewelry Items
                </TabsTrigger>
                <TabsTrigger 
                  value="raw-materials" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                                     <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                     <Circle className="h-4 w-4 text-white" />
                   </div>
                  Raw Materials
                </TabsTrigger>
                <TabsTrigger 
                  value="loose-stones" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Diamond className="h-4 w-4 text-white" />
                  </div>
                  Loose Stones
                </TabsTrigger>
                <TabsTrigger 
                  value="tags-barcodes" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Tag className="h-4 w-4 text-white" />
                  </div>
                  Tags & Barcodes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jewelry" className="space-y-6 mt-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-800">Jewelry Inventory</CardTitle>
                    <CardDescription className="text-slate-600">Search, filter, and sort your jewelry inventory with precision</CardDescription>
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("tags-barcodes")}
                        disabled={selectedRows.length === 0}
                        className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        Print Tags for Selected ({selectedRows.length})
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Enhanced Search and Filters */}
                    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search by SKU, type, name, metal, carat, diamonds, status, vendor, location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                          />
                        </div>
                        <Button
                          variant={isScanning ? "destructive" : "outline"}
                          onClick={() => setIsScanning(!isScanning)}
                          className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                        >
                          <Barcode className="mr-2 h-4 w-4" />
                          {isScanning ? "Stop Scanning" : "Start Scanning"}
                        </Button>
                      </div>
                      <Select value={filterProductType} onValueChange={setFilterProductType}>
                        <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {productTypes.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterMetal} onValueChange={setFilterMetal}>
                        <SelectTrigger className="w-24 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Metal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Metals</SelectItem>
                          {metals.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-28 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterVendor} onValueChange={setFilterVendor}>
                        <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vendors</SelectItem>
                          {vendors.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="Min Carat"
                          value={caratMin}
                          onChange={(e) => setCaratMin(e.target.value)}
                          className="w-24 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                        <span className="text-slate-500">-</span>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="Max Carat"
                          value={caratMax}
                          onChange={(e) => setCaratMax(e.target.value)}
                          className="w-24 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                      </div>
                      <Button variant="outline" onClick={() => {
                        setFilterProductType("all"); setFilterMetal("all"); setFilterStatus("all"); setFilterVendor("all"); setCaratMin(""); setCaratMax("");
                      }} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                        Clear Filters
                      </Button>
                    </div>

                    {/* Enhanced Table */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead>
                              <input type="checkbox" checked={selectedRows.length === filteredItems.length && filteredItems.length > 0} onChange={e => setSelectedRows(e.target.checked ? filteredItems.map(d => d.sku) : [])} />
                            </TableHead>
                            {jewelryAttributes.map((attr) => (
                              <TableHead
                                key={attr.id}
                                className="cursor-pointer select-none text-slate-700 font-semibold"
                                onClick={() => handleSort(attr.id)}
                              >
                                {attr.label}
                                {sortBy === attr.id ? (
                                  <span className="ml-1 text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>
                                ) : null}
                              </TableHead>
                            ))}
                            <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={jewelryAttributes.length + 2} className="text-center text-slate-600 py-8">
                                No jewelry items found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredItems.map((d) => (
                              <TableRow key={d.sku} className="hover:bg-slate-50/50 transition-colors duration-200">
                                <TableCell>
                                  <input type="checkbox" checked={selectedRows.includes(d.sku)} onChange={e => setSelectedRows(e.target.checked ? [...selectedRows, d.sku] : selectedRows.filter(id => id !== d.sku))} />
                                </TableCell>
                                {jewelryAttributes.map((attr) => (
                                  <TableCell key={attr.id}>
                                    {attr.id === 'price' 
                                      ? <span className="font-semibold text-emerald-600">{formatPrice((d as any)[attr.id])}</span>
                                      : typeof (d as any)[attr.id] === 'object' && (d as any)[attr.id] !== null
                                        ? JSON.stringify((d as any)[attr.id])
                                        : (d as any)[attr.id]}
                                  </TableCell>
                                ))}
                                <TableCell className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200"
                                    onClick={() => setShareInventoryDialog({ open: true, selectedItems: [d] })}
                                  >
                                    <Share2 className="h-4 w-4 mr-1" />
                                    Share
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                                        aria-label="Actions"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      className="w-40 bg-white border border-emerald-200 shadow-lg rounded-xl p-1"
                                      align="end"
                                    >
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedItem(d)}
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span>View</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                                        onClick={() => setEditItem({ ...d })}
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                        onClick={() => setShowDelete({ open: true, item: d })}
                                      >
                                        <Trash className="h-4 w-4" />
                                        <span>Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="raw-materials" className="space-y-6 mt-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-800">Raw Materials Inventory</CardTitle>
                    <CardDescription className="text-slate-600">Manage precious metals, alloys, and other raw materials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Enhanced Search and Filters */}
                    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search by SKU, name, type, material, status, vendor, location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                          />
                        </div>
                        <Button
                          variant={isScanning ? "destructive" : "outline"}
                          onClick={() => setIsScanning(!isScanning)}
                          className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                        >
                          <Barcode className="mr-2 h-4 w-4" />
                          {isScanning ? "Stop Scanning" : "Start Scanning"}
                        </Button>
                      </div>
                      <Select value={filterMaterialType} onValueChange={setFilterMaterialType}>
                        <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {rawMaterialTypes.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterMaterial} onValueChange={setFilterMaterial}>
                        <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Materials</SelectItem>
                          {rawMaterialNames.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterPurity} onValueChange={setFilterPurity}>
                        <SelectTrigger className="w-24 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Purity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Purity</SelectItem>
                          {purities.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-28 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={() => {
                        setFilterMaterialType("all"); setFilterMaterial("all"); setFilterPurity("all"); setFilterStatus("all");
                      }} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                        Clear Filters
                      </Button>
                    </div>

                    {/* Enhanced Table */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead>
                              <input type="checkbox" checked={selectedRows.length === filteredRawMaterials.length && filteredRawMaterials.length > 0} onChange={e => setSelectedRows(e.target.checked ? filteredRawMaterials.map(d => d.sku) : [])} />
                            </TableHead>
                            {rawMaterialAttributes.map((attr) => (
                              <TableHead
                                key={attr.id}
                                className="cursor-pointer select-none text-slate-700 font-semibold"
                                onClick={() => handleSort(attr.id)}
                              >
                                {attr.label}
                                {sortBy === attr.id ? (
                                  <span className="ml-1 text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>
                                ) : null}
                              </TableHead>
                            ))}
                            <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRawMaterials.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={rawMaterialAttributes.length + 2} className="text-center text-slate-600 py-8">
                                No raw materials found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRawMaterials.map((item) => (
                              <TableRow key={item.sku} className="hover:bg-slate-50/50 transition-colors duration-200">
                                <TableCell>
                                  <input type="checkbox" checked={selectedRows.includes(item.sku)} onChange={e => setSelectedRows(e.target.checked ? [...selectedRows, item.sku] : selectedRows.filter(id => id !== item.sku))} />
                                </TableCell>
                                {rawMaterialAttributes.map((attr) => (
                                  <TableCell key={attr.id}>
                                    {attr.id === 'price' 
                                      ? <span className="font-semibold text-emerald-600">{formatPrice((item as any)[attr.id])}</span>
                                      : typeof (item as any)[attr.id] === 'object' && (item as any)[attr.id] !== null
                                        ? JSON.stringify((item as any)[attr.id])
                                        : (item as any)[attr.id]}
                                  </TableCell>
                                ))}
                                <TableCell className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200"
                                    onClick={() => setShareInventoryDialog({ open: true, selectedItems: [item] })}
                                  >
                                    <Share2 className="h-4 w-4 mr-1" />
                                    Share
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                                        aria-label="Actions"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      className="w-40 bg-white border border-emerald-200 shadow-lg rounded-xl p-1"
                                      align="end"
                                    >
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedItem(item)}
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span>View</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                                        onClick={() => setEditItem({ ...item })}
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                        onClick={() => setShowDelete({ open: true, item: item })}
                                      >
                                        <Trash className="h-4 w-4" />
                                        <span>Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="loose-stones" className="space-y-6 mt-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-800">Loose Stones Inventory</CardTitle>
                    <CardDescription className="text-slate-600">Manage diamonds, gemstones, and other precious stones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Enhanced Search and Filters */}
                    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search by SKU, name, type, shape, color, clarity, status, vendor, location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                          />
                        </div>
                        <Button
                          variant={isScanning ? "destructive" : "outline"}
                          onClick={() => setIsScanning(!isScanning)}
                          className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                        >
                          <Barcode className="mr-2 h-4 w-4" />
                          {isScanning ? "Stop Scanning" : "Start Scanning"}
                        </Button>
                      </div>
                      <Select value={filterStoneType} onValueChange={setFilterStoneType}>
                        <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {stoneTypes.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterStoneShape} onValueChange={setFilterStoneShape}>
                        <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Shape" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Shapes</SelectItem>
                          {stoneShapes.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterStoneColor} onValueChange={setFilterStoneColor}>
                        <SelectTrigger className="w-24 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Colors</SelectItem>
                          {stoneColors.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterStoneClarity} onValueChange={setFilterStoneClarity}>
                        <SelectTrigger className="w-28 bg-white/80 backdrop-blur-sm border-slate-200">
                          <SelectValue placeholder="Clarity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clarity</SelectItem>
                          {stoneClarities.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="Min Carat"
                          value={caratMin}
                          onChange={(e) => setCaratMin(e.target.value)}
                          className="w-24 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                        <span className="text-slate-500">-</span>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="Max Carat"
                          value={caratMax}
                          onChange={(e) => setCaratMax(e.target.value)}
                          className="w-24 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                      </div>
                      <Button variant="outline" onClick={() => {
                        setFilterStoneType("all"); setFilterStoneShape("all"); setFilterStoneColor("all"); setFilterStoneClarity("all"); setCaratMin(""); setCaratMax("");
                      }} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                        Clear Filters
                      </Button>
                    </div>

                    {/* Enhanced Table */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead>
                              <input type="checkbox" checked={selectedRows.length === filteredLooseStones.length && filteredLooseStones.length > 0} onChange={e => setSelectedRows(e.target.checked ? filteredLooseStones.map(d => d.sku) : [])} />
                            </TableHead>
                            {looseStoneAttributes.map((attr) => (
                              <TableHead
                                key={attr.id}
                                className="cursor-pointer select-none text-slate-700 font-semibold"
                                onClick={() => handleSort(attr.id)}
                              >
                                {attr.label}
                                {sortBy === attr.id ? (
                                  <span className="ml-1 text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>
                                ) : null}
                              </TableHead>
                            ))}
                            <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLooseStones.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={looseStoneAttributes.length + 2} className="text-center text-slate-600 py-8">
                                No loose stones found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredLooseStones.map((item) => (
                              <TableRow key={item.sku} className="hover:bg-slate-50/50 transition-colors duration-200">
                                <TableCell>
                                  <input type="checkbox" checked={selectedRows.includes(item.sku)} onChange={e => setSelectedRows(e.target.checked ? [...selectedRows, item.sku] : selectedRows.filter(id => id !== item.sku))} />
                                </TableCell>
                                {looseStoneAttributes.map((attr) => (
                                  <TableCell key={attr.id}>
                                    {attr.id === 'price' 
                                      ? <span className="font-semibold text-emerald-600">{formatPrice((item as any)[attr.id])}</span>
                                      : typeof (item as any)[attr.id] === 'object' && (item as any)[attr.id] !== null
                                        ? JSON.stringify((item as any)[attr.id])
                                        : (item as any)[attr.id]}
                                  </TableCell>
                                ))}
                                <TableCell className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200"
                                    onClick={() => setShareInventoryDialog({ open: true, selectedItems: [item] })}
                                  >
                                    <Share2 className="h-4 w-4 mr-1" />
                                    Share
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                                        aria-label="Actions"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      className="w-40 bg-white border border-emerald-200 shadow-lg rounded-xl p-1"
                                      align="end"
                                    >
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedItem(item)}
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span>View</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                                        onClick={() => setEditItem({ ...item })}
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                        onClick={() => setShowDelete({ open: true, item: item })}
                                      >
                                        <Trash className="h-4 w-4" />
                                        <span>Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tags-barcodes" className="space-y-6 mt-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-800">Tags & Barcodes</CardTitle>
                    <CardDescription className="text-slate-600">Create, customize, and print tags and barcodes for your jewelry inventory. Perfect for physical tracking and display.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InventoryTags 
                      inventoryItems={jewelryItems.map(item => ({
                        id: item.sku,
                        name: item.name,
                        category: item.productType,
                        location: item.location,
                        price: formatPrice(item.price),
                        description: item.description,
                        sku: item.sku
                      }))}
                      title="Jewelry Tags & Barcodes"
                      description="Create and print professional tags and barcodes for your jewelry inventory. Perfect for display cases and physical tracking."
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Dialogs */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800">Item Details</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-3">
                {jewelryAttributes.map((attr) => (
                  <div key={attr.id} className="flex justify-between border-b border-slate-200 py-2">
                    <span className="font-medium text-slate-700">{attr.label}:</span>
                    <span className="text-slate-600">{(selectedItem as any)[attr.id]}</span>
                  </div>
                ))}
                <div className="flex justify-between border-b border-slate-200 py-2">
                  <span className="font-medium text-slate-700">Notes:</span>
                  <span className="text-slate-600">{(selectedItem as any).notes}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-2">
                  <span className="font-medium text-slate-700">On Memo:</span>
                  <span className="text-slate-600">{(selectedItem as any).memo ? "Yes" : "No"}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="w-full max-w-4xl min-w-[1000px] overflow-x-auto bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800">Edit Jewelry Item</DialogTitle>
            </DialogHeader>
            {editItem && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">SKU</label>
                    <Input 
                      value={(editItem as any).sku} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, sku: e.target.value }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Product Type</label>
                    <Select value={(editItem as any).productType} onValueChange={(v: string) => setEditItem((prev: any) => ({ ...prev, productType: v }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Name</label>
                  <Input 
                    placeholder="Item name" 
                    value={(editItem as any).name} 
                    onChange={(e) => setEditItem((prev: any) => ({ ...prev, name: e.target.value }))} 
                    className="bg-white/80 backdrop-blur-sm border-slate-200" 
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Description</label>
                  <Input 
                    placeholder="Item description" 
                    value={(editItem as any).description} 
                    onChange={(e) => setEditItem((prev: any) => ({ ...prev, description: e.target.value }))} 
                    className="bg-white/80 backdrop-blur-sm border-slate-200" 
                  />
                </div>

                {/* Material and Stone Information */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Metal</label>
                    <Select value={(editItem as any).metal} onValueChange={(v: string) => setEditItem((prev: any) => ({ ...prev, metal: v }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Metal" />
                      </SelectTrigger>
                      <SelectContent>
                        {metals.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Total Carat Weight</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.01} 
                      placeholder="Carat" 
                      value={(editItem as any).totalCaratWeight || ""} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, totalCaratWeight: parseFloat(e.target.value) || undefined }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Number of Diamonds</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={1} 
                      placeholder="Count" 
                      value={(editItem as any).numberOfDiamonds || ""} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, numberOfDiamonds: parseInt(e.target.value) || undefined }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                </div>

                {/* Stone Details */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Stone Shape</label>
                    <Select value={(editItem as any).stoneShape || ""} onValueChange={(v: string) => setEditItem((prev: any) => ({ ...prev, stoneShape: v }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Shape" />
                      </SelectTrigger>
                      <SelectContent>
                        {stoneShapes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Stone Color</label>
                    <Select value={(editItem as any).stoneColor || ""} onValueChange={(v: string) => setEditItem((prev: any) => ({ ...prev, stoneColor: v }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent>
                        {stoneColors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Stone Clarity</label>
                    <Select value={(editItem as any).stoneClarity || ""} onValueChange={(v: string) => setEditItem((prev: any) => ({ ...prev, stoneClarity: v }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Clarity" />
                      </SelectTrigger>
                      <SelectContent>
                        {stoneClarities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Stone Cut</label>
                    <Select value={(editItem as any).stoneCut || ""} onValueChange={(v: string) => setEditItem((prev: any) => ({ ...prev, stoneCut: v }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Cut" />
                      </SelectTrigger>
                      <SelectContent>
                        {stoneCuts.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Business Information */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Status</label>
                    <Select value={(editItem as any).status} onValueChange={(v) => setEditItem((prev: any) => ({ ...prev, status: v }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Vendor</label>
                    <Select value={(editItem as any).vendor} onValueChange={(v) => setEditItem((prev: any) => ({ ...prev, vendor: v }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Price ($)</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.01} 
                      placeholder="Price" 
                      value={(editItem as any).price} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, price: parseFloat(e.target.value) }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Location</label>
                    <Input 
                      placeholder="Location" 
                      value={(editItem as any).location} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, location: e.target.value }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">On Memo</label>
                    <Select value={(editItem as any).memo ? "true" : "false"} onValueChange={(v) => setEditItem((prev: any) => ({ ...prev, memo: v === "true" }))}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Memo?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Not on Memo</SelectItem>
                        <SelectItem value="true">On Memo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Notes</label>
                  <Input 
                    placeholder="Notes" 
                    value={(editItem as any).notes} 
                    onChange={(e) => setEditItem((prev: any) => ({ ...prev, notes: e.target.value }))} 
                    className="bg-white/80 backdrop-blur-sm border-slate-200" 
                  />
                </div>

                {/* Certificate Information */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Certificate</label>
                  <Input 
                    placeholder="Certificate number (e.g., GIA 1234567)" 
                    value={(editItem as any).certificate || ""} 
                    onChange={(e) => setEditItem((prev: any) => ({ ...prev, certificate: e.target.value }))} 
                    className="bg-white/80 backdrop-blur-sm border-slate-200" 
                  />
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Length (mm)</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.1} 
                      placeholder="Length" 
                      value={(editItem as any).length || ""} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, length: parseFloat(e.target.value) || undefined }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Width (mm)</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.1} 
                      placeholder="Width" 
                      value={(editItem as any).width || ""} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, width: parseFloat(e.target.value) || undefined }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Height (mm)</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.1} 
                      placeholder="Height" 
                      value={(editItem as any).height || ""} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, height: parseFloat(e.target.value) || undefined }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-slate-700">Weight (g)</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.1} 
                      placeholder="Weight" 
                      value={(editItem as any).weight || ""} 
                      onChange={(e) => setEditItem((prev: any) => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))} 
                      className="bg-white/80 backdrop-blur-sm border-slate-200" 
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditItem(null)} 
                className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (editItem) {
                    try {
                      // Update local state first for immediate feedback
                      setJewelryItems(prev => prev.map(item => 
                        item.sku === (editItem as any).sku ? (editItem as any) : item
                      ))
                      
                      setEditItem(null)
                      toast.success('Item updated successfully')
                      
                      // Note: Since we're using mock data, we don't need to call the API
                      // In a real implementation, you would call the API here
                      // await updateInventoryItem((editItem as any).sku, inventoryItem)
                    } catch (error) {
                      console.error('Error updating item:', error)
                      toast.error('Failed to update item. Please try again.')
                    }
                  }
                }} 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="w-full max-w-4xl min-w-[1000px] overflow-x-auto bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800">Add Jewelry Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Product Type</label>
                  <Select value={newItem.productType} onValueChange={(v: string) => setNewItem((nd: any) => ({ ...nd, productType: v }))}>
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {productTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Name</label>
                  <Input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem((nd: any) => ({ ...nd, name: e.target.value }))} className="bg-white/80 backdrop-blur-sm border-slate-200" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-700">Description</label>
                <Input placeholder="Item description" value={newItem.description} onChange={(e) => setNewItem((nd: any) => ({ ...nd, description: e.target.value }))} className="bg-white/80 backdrop-blur-sm border-slate-200" />
              </div>

              {/* Material and Stone Information */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Metal</label>
                  <Select value={newItem.metal} onValueChange={(v: string) => setNewItem((nd: any) => ({ ...nd, metal: v }))}>
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200"><SelectValue placeholder="Metal" /></SelectTrigger>
                    <SelectContent>
                      {metals.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Total Carat Weight</label>
                  <Input type="number" min={0} step={0.01} placeholder="Carat" value={newItem.totalCaratWeight || ""} onChange={(e) => setNewItem((nd: any) => ({ ...nd, totalCaratWeight: parseFloat(e.target.value) || undefined }))} className="bg-white/80 backdrop-blur-sm border-slate-200" />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Number of Diamonds</label>
                  <Input type="number" min={0} step={1} placeholder="Count" value={newItem.numberOfDiamonds || ""} onChange={(e) => setNewItem((nd: any) => ({ ...nd, numberOfDiamonds: parseInt(e.target.value) || undefined }))} className="bg-white/80 backdrop-blur-sm border-slate-200" />
                </div>
              </div>

              {/* Business Information */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Status</label>
                  <Select value={newItem.status} onValueChange={(v) => setNewItem((nd: any) => ({ ...nd, status: v }))}>
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Vendor</label>
                  <Select value={newItem.vendor} onValueChange={(v) => setNewItem((nd: any) => ({ ...nd, vendor: v }))}>
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200"><SelectValue placeholder="Vendor" /></SelectTrigger>
                    <SelectContent>
                      {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Price ($)</label>
                  <Input type="number" min={0} step={0.01} placeholder="Price" value={newItem.price} onChange={(e) => setNewItem((nd: any) => ({ ...nd, price: parseFloat(e.target.value) }))} className="bg-white/80 backdrop-blur-sm border-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">Location</label>
                  <Input placeholder="Location" value={newItem.location} onChange={(e) => setNewItem((nd: any) => ({ ...nd, location: e.target.value }))} className="bg-white/80 backdrop-blur-sm border-slate-200" />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-700">On Memo</label>
                  <Select value={newItem.memo ? "true" : "false"} onValueChange={(v) => setNewItem((nd: any) => ({ ...nd, memo: v === "true" }))}>
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200"><SelectValue placeholder="Memo?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Not on Memo</SelectItem>
                      <SelectItem value="true">On Memo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-700">Notes</label>
                <Input placeholder="Notes" value={newItem.notes} onChange={(e) => setNewItem((nd: any) => ({ ...nd, notes: e.target.value }))} className="bg-white/80 backdrop-blur-sm border-slate-200" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300">Cancel</Button>
              <Button onClick={handleAddItem} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sync Logs Dialog */}
        <UIDialog open={logDialog.open} onOpenChange={open => setLogDialog(l => ({ ...l, open }))}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800">Shopify Sync Logs {logDialog.itemId ? `for ${logDialog.itemId}` : ""}</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {logDialog.logs.length === 0 ? (
                <div className="text-slate-600">No logs found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-slate-700 font-semibold">ID</th>
                      <th className="text-left text-slate-700 font-semibold">Action</th>
                      <th className="text-left text-slate-700 font-semibold">Status</th>
                      <th className="text-left text-slate-700 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logDialog.logs.map((log: any) => (
                      <tr key={log.id} className="border-b border-slate-100">
                        <td className="text-slate-600">{log.id}</td>
                        <td className="text-slate-600">{log.action}</td>
                        <td className="text-slate-600">{log.status}</td>
                        <td className="text-slate-600">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </DialogContent>
        </UIDialog>

        {/* Share Inventory Dialog */}
        <ShareInventoryDialog
          open={shareInventoryDialog.open}
          onOpenChange={(open) => setShareInventoryDialog(prev => ({ ...prev, open }))}
          selectedItems={shareInventoryDialog.selectedItems}
          onSuccess={() => {
            toast.success('Inventory shared successfully!')
            // Refresh inventory data if needed
          }}
        />
      </div>
    </div>
  )
} 