"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  QrCode,
  Download,
  Printer,
  Users,
  Building,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Filter,
  Calendar,
  Crown,
  Sparkles,
  Gem,
  Shield,
  Target,
  Settings,
  RefreshCw,
  Zap,
  Award,
  Globe,
  Briefcase,
  Database,
  Warehouse,
  Diamond,
  Circle,
  Square,
  Hexagon,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { QRCodeSVG } from "qrcode.react"
import { Asset, AssetStatus, Employee, Assignment } from "@/types/inventory"

// Mock Data
const mockAssets: Asset[] = [
  {
    id: "ast_001",
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
    id: "ast_002",
    name: "Platinum Engagement Ring Setting",
    type: "semi_mount",
    sku: "PERS-PLAT-001",
    value: 2800,
    currentLocation: "Main Vault",
    locationId: "vault_main",
    status: "available",
    lastActivity: "3 days ago",
    history: [],
  },
  {
    id: "ast_003",
    name: "Emerald Tennis Bracelet",
    type: "finished_product",
    sku: "ETB-2024-008",
    value: 12000,
    currentLocation: "Main Vault",
    locationId: "vault_main",
    status: "available",
    lastActivity: "2 days ago",
    history: [],
  },
  {
    id: "ast_004",
    name: "Gold Chain Necklace",
    type: "finished_product",
    sku: "GCN-18K-045",
    value: 3200,
    currentLocation: "Front Showcase",
    locationId: "showcase_front",
    status: "available",
    lastActivity: "1 day ago",
    history: [],
  },
  {
    id: "ast_005",
    name: "Sapphire Stone",
    type: "raw_material",
    sku: "SS-BLUE-5.2",
    value: 8500,
    currentLocation: "Main Vault",
    locationId: "vault_main",
    status: "available",
    lastActivity: "1 week ago",
    history: [],
  },
]

const mockEmployees: Employee[] = [
  // Internal Employees
  { id: "emp_01", name: "Sarah Johnson", type: "internal", role: "Jewelry Designer", department: "Design" },
  { id: "emp_02", name: "Michael Chen", type: "internal", role: "Gem Setter", department: "Production" },
  { id: "emp_03", name: "Lisa Wong", type: "internal", role: "Polisher", department: "Production" },
  { id: "emp_04", name: "David Kim", type: "internal", role: "Quality Control", department: "QC" },
  
  // External Service Providers
  { id: "ext_01", name: "Mike Rodriguez", type: "external", role: "Gem Setter", company: "Rodriguez Jewelry Services", contact: "mike@rodriguezjewelry.com" },
  { id: "ext_02", name: "Lisa Chen", type: "external", role: "Polisher", company: "Chen Polishing Co.", contact: "lisa@chenpolishing.com" },
  { id: "ext_03", name: "David Kim", type: "external", role: "Engraver", company: "Kim Engraving Services", contact: "david@kimengraving.com" },
  { id: "ext_04", name: "Sarah Wong", type: "external", role: "Plater", company: "Wong Plating Co.", contact: "sarah@wongplating.com" },
]

const mockAssignments: Assignment[] = [
  {
    id: "assign_001",
    assignmentNumber: "ASN-2024-001",
    assignedTo: mockEmployees[4], // Mike Rodriguez
    assets: [mockAssets[0], mockAssets[1]], // Diamond + Ring Setting
    assignmentType: "external",
    purpose: "Set diamond in engagement ring",
    notes: "Customer requested expedited completion",
    assignedDate: new Date(2024, 5, 20),
    expectedReturnDate: new Date(2024, 5, 24),
    status: "in_progress",
    qrCode: "assign_001_delivery",
    pickupQrCode: "assign_001_pickup",
  },
]

export default function InventoryAssignmentPage() {
  const router = useRouter()
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [assignmentType, setAssignmentType] = useState<"internal" | "external">("internal")
  const [purpose, setPurpose] = useState("")
  const [notes, setNotes] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null)
  const [qrType, setQrType] = useState<"delivery" | "pickup">("delivery")

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || asset.type === typeFilter
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const filteredEmployees = mockEmployees.filter(emp => emp.type === assignmentType)

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([])
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset.id))
    }
  }

  const generateAssignmentNumber = () => {
    const year = new Date().getFullYear()
    const count = assignments.length + 1
    return `ASN-${year}-${count.toString().padStart(3, '0')}`
  }

  const createAssignment = () => {
    if (!selectedEmployee || selectedAssets.length === 0 || !purpose || !expectedReturnDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one asset.",
        variant: "destructive",
      })
      return
    }

    const employee = mockEmployees.find(emp => emp.id === selectedEmployee)
    const selectedAssetObjects = mockAssets.filter(asset => selectedAssets.includes(asset.id))

    const newAssignment: Assignment = {
      id: `assign_${Date.now()}`,
      assignmentNumber: generateAssignmentNumber(),
      assignedTo: employee!,
      assets: selectedAssetObjects,
      assignmentType,
      purpose,
      notes,
      assignedDate: new Date(),
      expectedReturnDate: new Date(expectedReturnDate),
      status: "assigned",
      qrCode: `assign_${Date.now()}_delivery`,
      pickupQrCode: `assign_${Date.now()}_pickup`,
    }

    setAssignments(prev => [...prev, newAssignment])
    
    // Reset form
    setSelectedAssets([])
    setSelectedEmployee("")
    setPurpose("")
    setNotes("")
    setExpectedReturnDate("")

    toast({
      title: "Assignment Created",
      description: `Assignment ${newAssignment.assignmentNumber} has been created successfully.`,
    })
  }

  const showQrCode = (assignment: Assignment, type: "delivery" | "pickup") => {
    setCurrentAssignment(assignment)
    setQrType(type)
    setShowQrDialog(true)
  }

  const printQrCode = () => {
    window.print()
  }

  const getStatusColor = (status: Assignment["status"]) => {
    switch (status) {
      case "assigned": return "bg-yellow-100 text-yellow-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTotalValue = (assets: Asset[]) => {
    return assets.reduce((sum, asset) => sum + asset.value, 0)
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
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Inventory Assignment
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Assign inventory items to internal employees or external service providers</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Premium Assignment System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>QR Code Tracking</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            <Tabs defaultValue="assign" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
                <TabsTrigger 
                  value="assign" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  Create Assignment
                </TabsTrigger>
                <TabsTrigger 
                  value="tracking" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  Track Assignments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assign" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Asset Selection */}
                  <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-xl font-semibold text-slate-800">Select Assets</CardTitle>
                      <CardDescription className="text-slate-600">
                        Choose inventory items to assign
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      {/* Filters */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            placeholder="Search assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                          />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-slate-200">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="diamond">Diamonds</SelectItem>
                            <SelectItem value="finished_product">Finished Products</SelectItem>
                            <SelectItem value="semi_mount">Semi Mounts</SelectItem>
                            <SelectItem value="raw_material">Raw Materials</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-slate-200">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Asset List */}
                      <div className="border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm">
                        <div className="p-3 border-b border-slate-200 bg-slate-50/50">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {selectedAssets.length} of {filteredAssets.length} selected
                            </span>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {filteredAssets.map((asset) => (
                            <div
                              key={asset.id}
                              className="flex items-center gap-3 p-3 border-b border-slate-200 hover:bg-slate-50/50 transition-colors duration-200"
                            >
                              <Checkbox
                                checked={selectedAssets.includes(asset.id)}
                                onCheckedChange={() => handleAssetToggle(asset.id)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-slate-800">{asset.name}</p>
                                    <p className="text-sm text-slate-600">{asset.sku}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-slate-800">${asset.value.toLocaleString()}</p>
                                    <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                                      {asset.type.replace(/_/g, " ")}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assignment Details */}
                  <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-xl font-semibold text-slate-800">Assignment Details</CardTitle>
                      <CardDescription className="text-slate-600">
                        Configure the assignment parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      {/* Assignment Type */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Assignment Type</Label>
                        <Select value={assignmentType} onValueChange={(value: "internal" | "external") => setAssignmentType(value)}>
                          <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Internal Employee
                              </div>
                            </SelectItem>
                            <SelectItem value="external">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                External Service Provider
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Employee/Provider Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Assign To</Label>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                          <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300">
                            <SelectValue placeholder="Select employee or service provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredEmployees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                <div>
                                  <p className="font-medium">{employee.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {employee.role} {employee.company && `• ${employee.company}`}
                                  </p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Purpose */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Purpose</Label>
                        <Input
                          placeholder="e.g., Set diamond in engagement ring"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                      </div>

                      {/* Expected Return Date */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Expected Return Date</Label>
                        <Input
                          type="date"
                          value={expectedReturnDate}
                          onChange={(e) => setExpectedReturnDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Notes (Optional)</Label>
                        <Textarea
                          placeholder="Additional notes or instructions..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                      </div>

                      {/* Summary */}
                      {selectedAssets.length > 0 && (
                        <div className="p-4 border border-slate-200 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 backdrop-blur-sm">
                          <h4 className="font-medium mb-2 text-slate-800">Assignment Summary</h4>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p>Items: {selectedAssets.length}</p>
                            <p>Total Value: ${getTotalValue(mockAssets.filter(asset => selectedAssets.includes(asset.id))).toLocaleString()}</p>
                            {selectedEmployee && (
                              <p>Assigned To: {mockEmployees.find(emp => emp.id === selectedEmployee)?.name}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Create Assignment Button */}
                      <Button 
                        onClick={createAssignment}
                        disabled={!selectedEmployee || selectedAssets.length === 0 || !purpose || !expectedReturnDate}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Assignment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tracking" className="space-y-6">
                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-xl font-semibold text-slate-800">Assignment Tracking</CardTitle>
                    <CardDescription className="text-slate-600">
                      Monitor all current assignments and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="text-slate-700 font-semibold">Assignment #</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Assigned To</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Type</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Items</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Purpose</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Expected Return</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignments.map((assignment) => (
                            <TableRow key={assignment.id} className="hover:bg-slate-50/30 transition-colors duration-200">
                              <TableCell className="font-mono text-slate-800">{assignment.assignmentNumber}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-800">{assignment.assignedTo.name}</p>
                                  <p className="text-sm text-slate-600">{assignment.assignedTo.role}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={assignment.assignmentType === "internal" ? "default" : "secondary"} className="border-emerald-200 text-emerald-700">
                                  {assignment.assignmentType === "internal" ? "Internal" : "External"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p className="text-slate-800">{assignment.assets.length} items</p>
                                  <p className="text-slate-600">
                                    ${getTotalValue(assignment.assets).toLocaleString()}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-slate-800">{assignment.purpose}</TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(assignment.status)} border-emerald-200`}>
                                  {assignment.status.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p className="text-slate-800">{format(assignment.expectedReturnDate, "MMM dd, yyyy")}</p>
                                  {assignment.expectedReturnDate < new Date() && assignment.status !== "completed" && (
                                    <p className="text-red-600 text-xs">Overdue</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => showQrCode(assignment, "delivery")}
                                    className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                                    title="View Delivery QR Code"
                                  >
                                    <QrCode className="h-4 w-4" />
                                  </Button>
                                  {assignment.assignmentType === "external" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => showQrCode(assignment, "pickup")}
                                      className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                                      title="View Pickup QR Code"
                                    >
                                      <Package className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Enhanced QR Code Dialog */}
        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                {qrType === "delivery" ? "Delivery QR Code" : "Pickup QR Code"}
              </DialogTitle>
            </DialogHeader>
            {currentAssignment && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
                    <QRCodeSVG
                      value={qrType === "delivery" ? currentAssignment.qrCode : currentAssignment.pickupQrCode || ""}
                      size={200}
                      level="H"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">Assignment:</span>
                    <span className="text-slate-600">{currentAssignment.assignmentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">Assigned To:</span>
                    <span className="text-slate-600">{currentAssignment.assignedTo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">Items:</span>
                    <span className="text-slate-600">{currentAssignment.assets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">Total Value:</span>
                    <span className="text-slate-600">${getTotalValue(currentAssignment.assets).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">Type:</span>
                    <span className="text-slate-600">{qrType === "delivery" ? "Delivery" : "Pickup"}</span>
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-800">Items Included:</h4>
                  <div className="space-y-1">
                    {currentAssignment.assets.map((asset) => (
                      <div key={asset.id} className="flex justify-between text-sm">
                        <span className="text-slate-700">{asset.name}</span>
                        <span className="text-slate-600">${asset.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={printQrCode} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 
 