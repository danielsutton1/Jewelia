"use client"

import { useState } from "react"
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns"
import {
  ShieldCheck,
  Eye,
  Hammer,
  Users,
  Truck,
  Building,
  LucideIcon,
  X,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Gem,
  Settings,
  Zap,
  Palette,
  Microscope,
  Package,
  Factory,
  UserCheck,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Asset, Location, AssetStatus } from "@/types/inventory"

interface LocationMapProps {
  assets: Asset[];
  locations: Location[];
}

const locationTypeIcons: Record<Location['type'], LucideIcon> = {
  // Internal Production Pipeline
  vault: ShieldCheck,
  showroom: Eye,
  design: Palette,
  casting: Factory,
  setting: Gem,
  polishing: Zap,
  quality_control: Microscope,
  finishing: Settings,
  packaging: Package,
  shipping: Truck,
  
  // External Service Providers
  gem_setter: Users,
  engraver: Users,
  plater: Users,
  stone_supplier: Building,
  repair_shop: Hammer,
  
  // Other
  consignment: Building,
  customer_location: UserCheck,
};

const locationTypeColors = {
  // Internal Production Pipeline
  vault: "bg-blue-100 text-blue-800",
  showroom: "bg-purple-100 text-purple-800",
  design: "bg-pink-100 text-pink-800",
  casting: "bg-orange-100 text-orange-800",
  setting: "bg-amber-100 text-amber-800",
  polishing: "bg-yellow-100 text-yellow-800",
  quality_control: "bg-indigo-100 text-indigo-800",
  finishing: "bg-teal-100 text-teal-800",
  packaging: "bg-cyan-100 text-cyan-800",
  shipping: "bg-green-100 text-green-800",
  
  // External Service Providers
  gem_setter: "bg-red-100 text-red-800",
  engraver: "bg-rose-100 text-rose-800",
  plater: "bg-fuchsia-100 text-fuchsia-800",
  stone_supplier: "bg-violet-100 text-violet-800",
  repair_shop: "bg-slate-100 text-slate-800",
  
  // Other
  consignment: "bg-orange-100 text-orange-800",
  customer_location: "bg-emerald-100 text-emerald-800",
};

const locationCategoryLabels = {
  internal: "Internal",
  external: "External",
  storage: "Storage",
  display: "Display"
};

const statusColors: { [key: string]: string } = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-blue-100 text-blue-800",
  in_production: "bg-purple-100 text-purple-800",
  with_partner: "bg-amber-100 text-amber-800",
  quality_control: "bg-indigo-100 text-indigo-800",
  awaiting_shipment: "bg-pink-100 text-pink-800",
  shipped: "bg-gray-500 text-white",
  consignment: "bg-orange-100 text-orange-800",
  repair: "bg-teal-100 text-teal-800",
  missing: "bg-red-100 text-red-800",
  delayed: "bg-yellow-100 text-yellow-800",
  urgent: "bg-red-100 text-red-800",
};

export function LocationMap({ assets, locations }: LocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const getAssetCount = (locationId: string) => {
    return assets.filter((asset) => asset.locationId === locationId).length
  }

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location)
    setIsModalOpen(true)
  }

  const getLocationAssets = (locationId: string) => {
    return assets.filter((asset) => asset.locationId === locationId)
  }

  const parseLastActivity = (lastActivity: string): Date => {
    // Convert relative time strings to actual dates
    const now = new Date()
    if (lastActivity.includes("ago")) {
      const timeValue = parseInt(lastActivity.split(" ")[0])
      const timeUnit = lastActivity.split(" ")[1]
      
      switch (timeUnit) {
        case "hour":
        case "hours":
          return subDays(now, timeValue / 24)
        case "day":
        case "days":
          return subDays(now, timeValue)
        case "week":
        case "weeks":
          return subDays(now, timeValue * 7)
        case "month":
        case "months":
          return subDays(now, timeValue * 30)
        default:
          return now
      }
    }
    return now
  }

  const filteredAssets = selectedLocation 
    ? getLocationAssets(selectedLocation.id).filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             asset.sku.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || asset.status === statusFilter
        const matchesType = typeFilter === "all" || asset.type === typeFilter
        
        // Date filtering
        let matchesDate = true
        if (dateFilter !== "all" && (startDate || endDate)) {
          const assetDate = parseLastActivity(asset.lastActivity)
          
          if (startDate && endDate) {
            matchesDate = isAfter(assetDate, startDate) && isBefore(assetDate, endDate)
          } else if (startDate) {
            matchesDate = isAfter(assetDate, startDate)
          } else if (endDate) {
            matchesDate = isBefore(assetDate, endDate)
          }
        } else if (dateFilter !== "all") {
          const assetDate = parseLastActivity(asset.lastActivity)
          const now = new Date()
          
          switch (dateFilter) {
            case "today":
              matchesDate = format(assetDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
              break
            case "week":
              matchesDate = isAfter(assetDate, subDays(now, 7))
              break
            case "month":
              matchesDate = isAfter(assetDate, subDays(now, 30))
              break
            case "quarter":
              matchesDate = isAfter(assetDate, subDays(now, 90))
              break
          }
        }
        
        return matchesSearch && matchesStatus && matchesType && matchesDate
      })
    : []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setDateFilter("all")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Production Pipeline Location Map</CardTitle>
          <CardDescription>
            Track assets through internal production stages and external service providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Category Sections */}
          <div className="space-y-6">
            {/* Internal Production Pipeline */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Factory className="h-5 w-5 text-blue-600" />
                Internal Production Pipeline
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {locations
                  .filter(location => location.category === 'internal')
                  .sort((a, b) => {
                    // Sort by production pipeline order
                    const order = ['design', 'casting', 'setting', 'polishing', 'quality_control', 'finishing', 'packaging', 'shipping'];
                    return order.indexOf(a.type) - order.indexOf(b.type);
                  })
                  .map((location) => {
                    const Icon = locationTypeIcons[location.type]
                    const assetCount = getAssetCount(location.id)
                    const colorClass = locationTypeColors[location.type]
                    const hasUrgentItems = getLocationAssets(location.id).some(asset => 
                      asset.status === 'urgent' || asset.status === 'delayed'
                    )
                    
                    return (
                      <div
                        key={location.id}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${colorClass}`}
                        onClick={() => handleLocationClick(location)}
                      >
                        {location.priority === 'high' && (
                          <div className="absolute -top-1 -right-1">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                        {hasUrgentItems && (
                          <div className="absolute -top-1 -left-1">
                            <Clock className="h-4 w-4 text-yellow-500" />
                          </div>
                        )}
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full mb-2">
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className="font-bold text-center text-sm">{location.name}</p>
                        <Badge variant="secondary" className="mt-1">
                          {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
                        </Badge>
                        {location.priority && (
                          <Badge 
                            variant={location.priority === 'high' ? 'destructive' : location.priority === 'medium' ? 'default' : 'secondary'}
                            className="mt-1 text-xs"
                          >
                            {location.priority}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Storage & Display */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Storage & Display
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {locations
                  .filter(location => location.category === 'storage' || location.category === 'display')
                  .map((location) => {
                    const Icon = locationTypeIcons[location.type]
                    const assetCount = getAssetCount(location.id)
                    const colorClass = locationTypeColors[location.type]
                    
                    return (
                      <div
                        key={location.id}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${colorClass}`}
                        onClick={() => handleLocationClick(location)}
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full mb-2">
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className="font-bold text-center text-sm">{location.name}</p>
                        <Badge variant="secondary" className="mt-1">
                          {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
                        </Badge>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {locationCategoryLabels[location.category]}
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* External Service Providers */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                External Service Providers
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {locations
                  .filter(location => location.category === 'external')
                  .map((location) => {
                    const Icon = locationTypeIcons[location.type]
                    const assetCount = getAssetCount(location.id)
                    const colorClass = locationTypeColors[location.type]
                    const hasOverdueItems = getLocationAssets(location.id).some(asset => {
                      if (asset.expectedReturnDate) {
                        return new Date(asset.expectedReturnDate) < new Date()
                      }
                      return false
                    })
                    
                    return (
                      <div
                        key={location.id}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${colorClass}`}
                        onClick={() => handleLocationClick(location)}
                      >
                        {hasOverdueItems && (
                          <div className="absolute -top-1 -right-1">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full mb-2">
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className="font-bold text-center text-sm">{location.name}</p>
                        <Badge variant="secondary" className="mt-1">
                          {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
                        </Badge>
                        <Badge variant="outline" className="mt-1 text-xs">
                          External
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {selectedLocation?.name} - Inventory Details
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="in_production">In Production</SelectItem>
                      <SelectItem value="with_partner">With Partner</SelectItem>
                      <SelectItem value="quality_control">Quality Control</SelectItem>
                      <SelectItem value="awaiting_shipment">Awaiting Shipment</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="missing">Missing</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="diamond">Diamonds</SelectItem>
                      <SelectItem value="finished_product">Finished Products</SelectItem>
                      <SelectItem value="semi_mount">Semi Mounts</SelectItem>
                      <SelectItem value="raw_material">Raw Materials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="quarter">Last 90 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>

                  {dateFilter === "custom" && (
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full sm:w-[140px] justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "MMM dd") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full sm:w-[140px] justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "MMM dd") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Asset Count Summary */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{filteredAssets.length}</div>
                    <p className="text-xs text-muted-foreground">Total Assets</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredAssets.filter(a => a.status === 'available').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredAssets.filter(a => a.status === 'reserved').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Reserved</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {filteredAssets.filter(a => a.status === 'in_production').length}
                    </div>
                    <p className="text-xs text-muted-foreground">In Production</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredAssets.filter(a => a.status === 'urgent').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Urgent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {filteredAssets.filter(a => a.status === 'delayed').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Delayed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Total Value Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">
                      {formatCurrency(filteredAssets.reduce((sum, asset) => sum + asset.value, 0))}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Asset Value</p>
                  </div>
                </CardContent>
              </Card>

              {/* Assets Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Assets in {selectedLocation.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredAssets.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Last Activity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAssets.map((asset) => (
                            <TableRow key={asset.id}>
                              <TableCell className="font-mono text-xs">{asset.sku}</TableCell>
                              <TableCell className="font-medium">{asset.name}</TableCell>
                              <TableCell className="capitalize">{asset.type.replace(/_/g, " ")}</TableCell>
                              <TableCell>{formatCurrency(asset.value)}</TableCell>
                              <TableCell>
                                <Badge className={statusColors[asset.status] || "bg-gray-100 text-gray-800"}>
                                  {asset.status.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {asset.assignedTo || asset.checkedOutBy || "—"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {asset.lastActivity}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No assets found matching your filters.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 
 