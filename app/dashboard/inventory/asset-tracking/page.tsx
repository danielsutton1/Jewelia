"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AssetOverviewDashboard } from "@/components/inventory/asset-tracking/asset-overview-dashboard"
import { QuickActionsBar } from "@/components/inventory/asset-tracking/quick-actions-bar"
import { LocationMap } from "@/components/inventory/asset-tracking/location-map"
import { CheckInOutInterface } from "@/components/inventory/asset-tracking/check-in-out-interface"
import { RecentActivityFeed } from "@/components/inventory/asset-tracking/recent-activity-feed"
import { AssetLocationTable } from "@/components/inventory/asset-tracking/asset-location-table"
import { Button } from "@/components/ui/button"
import { Plus, QrCode, MapPin, Shield, Activity, TrendingUp, DollarSign, Package, Clock, CheckCircle, AlertCircle, Crown, Sparkles, Gem, Search, Filter, Download, Upload, RefreshCw, Target, Settings, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Asset, AssetStatus, Location, Employee, AssetActivity } from "@/types/inventory"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import QrScanner from "@/components/inventory/asset-tracking/qr-scanner"

// --- Mock Data ---

const assetLocations: Location[] = [
  // Internal Production Pipeline
  { id: "design_studio", name: "Design Studio", type: "design", category: "internal", priority: "medium" },
  { id: "casting_room", name: "Casting Room", type: "casting", category: "internal", priority: "high" },
  { id: "setting_bench", name: "Setting Bench", type: "setting", category: "internal", priority: "high" },
  { id: "polishing_station", name: "Polishing Station", type: "polishing", category: "internal", priority: "medium" },
  { id: "qc_station", name: "Quality Control", type: "quality_control", category: "internal", priority: "high" },
  { id: "finishing_room", name: "Finishing Room", type: "finishing", category: "internal", priority: "medium" },
  { id: "packaging_area", name: "Packaging Area", type: "packaging", category: "internal", priority: "low" },
  { id: "shipping_dock", name: "Shipping Dock", type: "shipping", category: "internal", priority: "medium" },
  
  // Storage & Display
  { id: "vault_main", name: "Main Vault", type: "vault", category: "storage" },
  { id: "vault_secondary", name: "Secondary Vault", type: "vault", category: "storage" },
  { id: "showcase_front", name: "Front Showcase", type: "showroom", category: "display" },
  { id: "showcase_back", name: "Back Showcase", type: "showroom", category: "display" },
  
  // External Service Providers
  { id: "partner_mike", name: "Mike Rodriguez (Gem Setter)", type: "gem_setter", category: "external", priority: "high" },
  { id: "partner_lisa", name: "Lisa Chen (Polisher)", type: "polishing", category: "external", priority: "medium" },
  { id: "partner_david", name: "David Kim (Engraver)", type: "engraver", category: "external", priority: "medium" },
  { id: "partner_sarah", name: "Sarah Wong (Plater)", type: "plater", category: "external", priority: "low" },
  { id: "stone_supplier_abc", name: "ABC Stone Supply", type: "stone_supplier", category: "external", priority: "medium" },
  { id: "repair_shop_xyz", name: "XYZ Repair Shop", type: "repair_shop", category: "external", priority: "high" },
  
  // Other
  { id: "consign_luxury", name: "Luxury Consignment Shop", type: "consignment", category: "external" },
  { id: "customer_location", name: "Customer Location", type: "customer_location", category: "external" },
]

const mockEmployees: Employee[] = [
  { id: "emp_01", name: "Sarah Johnson", type: "internal", role: "Jewelry Designer", department: "Design" },
  { id: "emp_02", name: "Michael Chen", type: "internal", role: "Gem Setter", department: "Production" },
  { id: "emp_03", name: "Lisa Wong", type: "internal", role: "Polisher", department: "Production" },
  { id: "emp_04", name: "David Kim", type: "internal", role: "Quality Control", department: "QC" },
  { id: "ext_01", name: "Mike Rodriguez", type: "external", role: "Gem Setter", company: "Rodriguez Jewelry Services", contact: "mike@rodriguezjewelry.com" },
  { id: "ext_02", name: "Lisa Chen", type: "external", role: "Polisher", company: "Chen Polishing Co.", contact: "lisa@chenpolishing.com" },
]

const mockAssets: Asset[] = [
  {
    id: "ast_001",
    name: "Diamond Solitaire Ring",
    type: "finished_product",
    sku: "DSR-2024-001",
    value: 8500,
    currentLocation: "Quality Control",
    locationId: "qc_station",
    status: "quality_control",
    checkedOutBy: "Sarah Johnson",
    checkedOutDate: "2024-06-22T09:30:00Z",
    expectedReturnDate: "2024-06-22T16:00:00Z",
    lastActivity: "2 hours ago",
    history: [
      {
        id: "act_001",
        action: "check_out",
        timestamp: "2024-06-22T09:30:00Z",
        employee: "Sarah Johnson",
        fromLocation: "Setting Bench",
        toLocation: "Quality Control",
        notes: "Final QC inspection before delivery",
      },
    ],
  },
  {
    id: "ast_002",
    name: "Emerald Tennis Bracelet",
    type: "finished_product",
    sku: "ETB-2024-008",
    value: 12000,
    currentLocation: "Mike Rodriguez (Gem Setter)",
    locationId: "partner_mike",
    status: "with_partner",
    checkedOutBy: "Mike Rodriguez",
    checkedOutDate: "2024-06-20T14:00:00Z",
    expectedReturnDate: "2024-06-24T10:00:00Z",
    lastActivity: "2 days ago",
    history: [],
  },
  {
    id: "ast_003",
    name: "2.1ct Round Diamond",
    type: "diamond",
    sku: "RD-H-VS1-2.1",
    value: 15200,
    currentLocation: "Main Vault",
    locationId: "vault_main",
    status: "available",
    lastActivity: "1 week ago",
    history: [],
  },
  {
    id: "ast_004",
    name: "Pearl Necklace - Custom",
    type: "finished_product",
    sku: "PN-CUST-024",
    value: 3200,
    currentLocation: "Shipping Dock",
    locationId: "shipping_dock",
    status: "awaiting_shipment",
    checkedOutBy: "David Kim",
    checkedOutDate: "2024-06-22T11:15:00Z",
    lastActivity: "45 minutes ago",
    history: [],
  },
  {
    id: "ast_005",
    name: "Sapphire Earring Set",
    type: "finished_product",
    sku: "SE-BLUE-018",
    value: 6800,
    currentLocation: "Front Showcase",
    locationId: "showcase_front",
    status: "reserved",
    lastActivity: "3 days ago",
    history: [],
  },
  // Additional assets for Main Vault
  {
    id: "ast_006",
    name: "3.5ct Emerald Cut Diamond",
    type: "diamond",
    sku: "EC-D-VVS2-3.5",
    value: 28500,
    currentLocation: "Main Vault",
    locationId: "vault_main",
    status: "available",
    lastActivity: "2 weeks ago",
    history: [],
  },
  {
    id: "ast_007",
    name: "Platinum Wedding Band",
    type: "finished_product",
    sku: "PWB-2024-015",
    value: 2200,
    currentLocation: "Main Vault",
    locationId: "vault_main",
    status: "available",
    lastActivity: "1 week ago",
    history: [],
  },
  {
    id: "ast_008",
    name: "Ruby Pendant",
    type: "finished_product",
    sku: "RP-RED-032",
    value: 4500,
    currentLocation: "Main Vault",
    locationId: "vault_main",
    status: "reserved",
    lastActivity: "5 days ago",
    history: [],
  },
  // Additional assets for Front Showcase
  {
    id: "ast_009",
    name: "Diamond Tennis Bracelet",
    type: "finished_product",
    sku: "DTB-2024-022",
    value: 18500,
    currentLocation: "Front Showcase",
    locationId: "showcase_front",
    status: "available",
    lastActivity: "1 day ago",
    history: [],
  },
  {
    id: "ast_010",
    name: "Emerald Ring",
    type: "finished_product",
    sku: "ER-GREEN-019",
    value: 9200,
    currentLocation: "Front Showcase",
    locationId: "showcase_front",
    status: "reserved",
    lastActivity: "4 days ago",
    history: [],
  },
  // Additional assets for Back Showcase
  {
    id: "ast_011",
    name: "Pearl Earrings",
    type: "finished_product",
    sku: "PE-WHITE-031",
    value: 3800,
    currentLocation: "Back Showcase",
    locationId: "showcase_back",
    status: "available",
    lastActivity: "6 days ago",
    history: [],
  },
  {
    id: "ast_012",
    name: "Sapphire Necklace",
    type: "finished_product",
    sku: "SN-BLUE-027",
    value: 7500,
    currentLocation: "Back Showcase",
    locationId: "showcase_back",
    status: "available",
    lastActivity: "1 week ago",
    history: [],
  },
  // Additional assets for Secondary Vault
  {
    id: "ast_013",
    name: "1.8ct Round Diamond",
    type: "diamond",
    sku: "RD-F-VS2-1.8",
    value: 12800,
    currentLocation: "Secondary Vault",
    locationId: "vault_secondary",
    status: "available",
    lastActivity: "3 weeks ago",
    history: [],
  },
  {
    id: "ast_014",
    name: "Gold Chain",
    type: "finished_product",
    sku: "GC-18K-045",
    value: 1800,
    currentLocation: "Secondary Vault",
    locationId: "vault_secondary",
    status: "available",
    lastActivity: "2 weeks ago",
    history: [],
  },
  {
    id: "ast_015",
    name: "Ruby Ring",
    type: "finished_product",
    sku: "RR-RED-038",
    value: 5200,
    currentLocation: "Secondary Vault",
    locationId: "vault_secondary",
    status: "reserved",
    lastActivity: "1 week ago",
    history: [],
  },
]

// Mock analytics data
const mockAnalytics = {
  totalAssets: 15,
  totalValue: 125000,
  checkedOutAssets: 4,
  availableAssets: 8,
  missingAssets: 1,
  averageValue: 8333,
  recentActivity: 12,
  locations: 20,
  employees: 6
}

export default function AssetTrackingPage() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets)
  const [qrScanDialogOpen, setQrScanDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [transferForm, setTransferForm] = useState({
    assetId: "",
    fromLocation: "",
    toLocation: "",
    employee: "",
    notes: "",
  })
  const router = useRouter()

  // QR Code Scanning Functionality
  const handleQrCodeScanned = (decodedText: string) => {
    if (!decodedText.trim()) {
      toast.error("QR code is empty")
      return
    }

    const asset = assets.find(a => a.sku === decodedText || a.id === decodedText)
    
    if (asset) {
      toast.success(`Asset found: ${asset.name}`)
      setSelectedAsset(asset)
      setQrScanDialogOpen(false)
      
      // Show asset details or trigger check-in/out
      setTimeout(() => {
        toast.info(`Asset ${asset.name} is currently at ${asset.currentLocation}`)
      }, 1000)
    } else {
      toast.error("Asset not found. Please check the QR code.")
    }
  }

  // Transfer Asset Functionality
  const handleTransferAsset = () => {
    if (!transferForm.assetId || !transferForm.toLocation || !transferForm.employee) {
      toast.error("Please fill in all required fields")
      return
    }

    const asset = assets.find(a => a.sku === transferForm.assetId || a.id === transferForm.assetId)
    if (!asset) {
      toast.error("Asset not found")
      return
    }

    const employee = mockEmployees.find(e => e.id === transferForm.employee)
    const toLocation = assetLocations.find(l => l.id === transferForm.toLocation)

    // Update asset location and status
    const updatedAssets = assets.map(a => {
      if (a.id === asset.id) {
        return {
          ...a,
          currentLocation: toLocation?.name || transferForm.toLocation,
          locationId: transferForm.toLocation,
          checkedOutBy: employee?.name || transferForm.employee,
          checkedOutDate: new Date().toISOString(),
          lastActivity: "Just now",
          history: [
            ...a.history,
            {
              id: `act_${Date.now()}`,
              action: "transfer" as const,
              timestamp: new Date().toISOString(),
              employee: employee?.name || transferForm.employee,
              fromLocation: a.currentLocation,
              toLocation: toLocation?.name || transferForm.toLocation,
              notes: transferForm.notes || "Asset transferred",
            }
          ]
        } as Asset
      }
      return a
    })

    setAssets(updatedAssets)
    toast.success(`Asset ${asset.name} transferred to ${toLocation?.name}`)
    setTransferDialogOpen(false)
    setTransferForm({
      assetId: "",
      fromLocation: "",
      toLocation: "",
      employee: "",
      notes: "",
    })
  }

  // Check In Asset Functionality
  const handleCheckIn = (assetId: string, notes?: string) => {
    const asset = assets.find(a => a.id === assetId)
    if (!asset) {
      toast.error("Asset not found")
      return
    }

    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: "available" as AssetStatus,
          checkedOutBy: undefined,
          checkedOutDate: undefined,
          expectedReturnDate: undefined,
          lastActivity: "Just now",
          history: [
            ...a.history,
            {
              id: `act_${Date.now()}`,
              action: "check_in" as const,
              timestamp: new Date().toISOString(),
              employee: "System",
              fromLocation: a.currentLocation,
              toLocation: a.currentLocation,
              notes: notes || "Asset checked in",
            }
          ]
        } as Asset
      }
      return a
    })

    setAssets(updatedAssets)
    toast.success(`Asset ${asset.name} checked in successfully`)
  }

  // Check Out Asset Functionality
  const handleCheckOut = (assetId: string, employeeId: string, locationId: string, returnDate: string, notes?: string) => {
    const asset = assets.find(a => a.id === assetId)
    const employee = mockEmployees.find(e => e.id === employeeId)
    const location = assetLocations.find(l => l.id === locationId)

    if (!asset || !employee || !location) {
      toast.error("Invalid asset, employee, or location")
      return
    }

    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          currentLocation: location.name,
          locationId: locationId,
          status: "checked_out" as AssetStatus,
          checkedOutBy: employee.name,
          checkedOutDate: new Date().toISOString(),
          expectedReturnDate: returnDate,
          lastActivity: "Just now",
          history: [
            ...a.history,
            {
              id: `act_${Date.now()}`,
              action: "check_out" as const,
              timestamp: new Date().toISOString(),
              employee: employee.name,
              fromLocation: a.currentLocation,
              toLocation: location.name,
              notes: notes || "Asset checked out",
            }
          ]
        } as Asset
      }
      return a
    })

    setAssets(updatedAssets)
    toast.success(`Asset ${asset.name} checked out to ${employee.name}`)
  }

  // Report Missing Asset Functionality
  const handleReportMissing = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    if (!asset) {
      toast.error("Asset not found")
      return
    }

    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: "missing" as AssetStatus,
          lastActivity: "Just now",
          history: [
            ...a.history,
            {
              id: `act_${Date.now()}`,
              action: "report_missing" as const,
              timestamp: new Date().toISOString(),
              employee: "System",
              fromLocation: a.currentLocation,
              toLocation: "Unknown",
              notes: "Asset reported as missing",
            }
          ]
        } as Asset
      }
      return a
    })

    setAssets(updatedAssets)
    toast.error(`Asset ${asset.name} reported as missing`)
  }

  // Bulk Operations
  const handleBulkCheckOut = (assetIds: string[], employeeId: string, locationId: string) => {
    assetIds.forEach(assetId => {
      handleCheckOut(assetId, employeeId, locationId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    })
    toast.success(`Bulk check-out completed for ${assetIds.length} assets`)
  }

  const handleBulkCheckIn = (assetIds: string[]) => {
    assetIds.forEach(assetId => {
      handleCheckIn(assetId)
    })
    toast.success(`Bulk check-in completed for ${assetIds.length} assets`)
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
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Asset Tracking
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Real-time visibility of all jewelry assets with check-in/check-out functionality</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Premium Security Features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Real-time Tracking</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                      aria-label="Filters"
                      title="Filters"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-slate-800">Asset Filters</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Asset Type</label>
                        <Select>
                          <SelectTrigger className="bg-white/50 border-slate-200">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Assets</SelectItem>
                            <SelectItem value="finished_product">Finished Products</SelectItem>
                            <SelectItem value="diamond">Diamonds</SelectItem>
                            <SelectItem value="gemstone">Gemstones</SelectItem>
                            <SelectItem value="metal">Metals</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Status</label>
                        <Select>
                          <SelectTrigger className="bg-white/50 border-slate-200">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="checked_out">Checked Out</SelectItem>
                            <SelectItem value="missing">Missing</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Location</label>
                        <Select>
                          <SelectTrigger className="bg-white/50 border-slate-200">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            <SelectItem value="vault_main">Main Vault</SelectItem>
                            <SelectItem value="vault_secondary">Secondary Vault</SelectItem>
                            <SelectItem value="showcase_front">Front Showcase</SelectItem>
                            <SelectItem value="showcase_back">Back Showcase</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="border-slate-200">Clear Filters</Button>
                      <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">Apply Filters</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Export"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard/inventory/asset-tracking/assign')}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Assign Inventory
                </Button>
                
                <Dialog open={qrScanDialogOpen} onOpenChange={setQrScanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                      <QrCode className="h-4 w-4" />
                      Scan QR Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-slate-800">Scan QR Code</DialogTitle>
                      <DialogDescription className="text-slate-600">
                        Place the QR code within the frame to scan it.
                      </DialogDescription>
                    </DialogHeader>
                    <QrScanner onScanSuccess={handleQrCodeScanned} />
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" onClick={() => setQrScanDialogOpen(false)} className="border-slate-200">
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                {/* Total Assets */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Assets</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Inventory
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {mockAnalytics.totalAssets}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+2 this week</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total assets in tracking system
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
                        ${(mockAnalytics.totalValue / 1000).toFixed(0)}K
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+$12.5K this month</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total value of tracked assets
                    </p>
                  </CardContent>
                </Card>
                
                {/* Checked Out */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Checked Out</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Operations
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {mockAnalytics.checkedOutAssets}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>-1 from yesterday</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Assets currently checked out
                    </p>
                  </CardContent>
                </Card>

                {/* Missing Assets */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Missing Assets</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Alert
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {mockAnalytics.missingAssets}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>+1 this week</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Assets reported as missing
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
      <AssetLocationTable 
        assets={assets}
        onTransfer={(assetId) => {
          const asset = assets.find(a => a.id === assetId)
          if (asset) {
            setTransferForm(prev => ({ ...prev, assetId: asset.sku }))
            setTransferDialogOpen(true)
          }
        }}
        onReportMissing={handleReportMissing}
      />

      <AssetOverviewDashboard assets={assets} />
      
      <QuickActionsBar 
        onCheckOut={(assetId) => {
          const asset = assets.find(a => a.id === assetId)
          if (asset) {
            toast.info(`Check-out initiated for ${asset.name}`)
          }
        }}
        onCheckIn={(assetId) => handleCheckIn(assetId)}
        onTransfer={(assetId) => {
          const asset = assets.find(a => a.id === assetId)
          if (asset) {
            setTransferForm(prev => ({ ...prev, assetId: asset.sku }))
            setTransferDialogOpen(true)
          }
        }}
        onReportMissing={(assetId) => handleReportMissing(assetId)}
        onBulkCheckOut={handleBulkCheckOut}
        onBulkCheckIn={handleBulkCheckIn}
        onBulkTransfer={(assetIds) => {
          toast.info(`Bulk transfer initiated for ${assetIds.length} assets`)
        }}
      />

            <LocationMap assets={assets} locations={assetLocations} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <RecentActivityFeed assets={assets} />
            </div>
          </div>
        </div>

        {/* Enhanced Transfer Dialog */}
        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800">Transfer Asset</DialogTitle>
              <DialogDescription className="text-slate-600">
                Transfer an asset to a different location or employee.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="transfer-asset" className="text-sm font-medium text-slate-700">Asset ID or SKU</Label>
                <Input
                  id="transfer-asset"
                  placeholder="Enter asset ID or SKU..."
                  value={transferForm.assetId}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, assetId: e.target.value }))}
                  className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="transfer-employee" className="text-sm font-medium text-slate-700">Employee / Partner</Label>
                <Select value={transferForm.employee} onValueChange={(value) => setTransferForm(prev => ({ ...prev, employee: value }))}>
                  <SelectTrigger id="transfer-employee" className="bg-white/50 border-slate-200">
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transfer-location" className="text-sm font-medium text-slate-700">Destination Location</Label>
                <Select value={transferForm.toLocation} onValueChange={(value) => setTransferForm(prev => ({ ...prev, toLocation: value }))}>
                  <SelectTrigger id="transfer-location" className="bg-white/50 border-slate-200">
                    <SelectValue placeholder="Select destination..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assetLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transfer-notes" className="text-sm font-medium text-slate-700">Notes (Optional)</Label>
                <Textarea
                  id="transfer-notes"
                  placeholder="Reason for transfer..."
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleTransferAsset} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                  Transfer Asset
                </Button>
                <Button variant="outline" onClick={() => setTransferDialogOpen(false)} className="border-slate-200">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
 