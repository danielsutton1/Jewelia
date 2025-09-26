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
  Users, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Edit,
  Eye,
  MessageSquare,
  FileText,
  Download,
  Upload,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  Shield
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Supplier {
  id: string
  name: string
  contact: {
    email: string
    phone: string
    website: string
    address: string
  }
  materials: string[]
  rating: number
  totalSpend: number
  orders: number
  averageDeliveryTime: number
  qualityScore: number
  reliabilityScore: number
  status: "active" | "inactive" | "suspended" | "pending"
  certifications: string[]
  paymentTerms: string
  minimumOrder: number
  leadTime: number
  lastOrder: string
  notes: string
}

// Sample suppliers data
const sampleSuppliers: Supplier[] = [
  {
    id: "SUP001",
    name: "GoldCorp Metals",
    contact: {
      email: "orders@goldcorp.com",
      phone: "+1 (555) 123-4567",
      website: "www.goldcorp.com",
      address: "123 Gold Street, New York, NY 10001"
    },
    materials: ["14K Yellow Gold", "18K White Gold", "24K Gold", "Platinum"],
    rating: 4.8,
    totalSpend: 125000,
    orders: 45,
    averageDeliveryTime: 3,
    qualityScore: 95,
    reliabilityScore: 98,
    status: "active",
    certifications: ["LBMA", "ISO 9001", "RJC"],
    paymentTerms: "Net 30",
    minimumOrder: 1000,
    leadTime: 2,
    lastOrder: "2024-01-15",
    notes: "Premium supplier with excellent quality and fast delivery"
  },
  {
    id: "SUP002",
    name: "Diamond Source Inc",
    contact: {
      email: "sales@diamondsource.com",
      phone: "+1 (555) 234-5678",
      website: "www.diamondsource.com",
      address: "456 Diamond Ave, Los Angeles, CA 90210"
    },
    materials: ["Diamond", "Sapphire", "Ruby", "Emerald"],
    rating: 4.9,
    totalSpend: 85000,
    orders: 12,
    averageDeliveryTime: 7,
    qualityScore: 98,
    reliabilityScore: 95,
    status: "active",
    certifications: ["GIA", "IGI", "GRS"],
    paymentTerms: "Net 45",
    minimumOrder: 5000,
    leadTime: 5,
    lastOrder: "2024-01-14",
    notes: "High-end gemstone supplier with certified stones"
  },
  {
    id: "SUP003",
    name: "Silver Solutions",
    contact: {
      email: "info@silversolutions.com",
      phone: "+1 (555) 345-6789",
      website: "www.silversolutions.com",
      address: "789 Silver Blvd, Chicago, IL 60601"
    },
    materials: ["Sterling Silver", "Fine Silver", "Silver Findings"],
    rating: 4.5,
    totalSpend: 42000,
    orders: 28,
    averageDeliveryTime: 2,
    qualityScore: 92,
    reliabilityScore: 90,
    status: "active",
    certifications: ["ISO 9001"],
    paymentTerms: "Net 15",
    minimumOrder: 500,
    leadTime: 1,
    lastOrder: "2024-01-13",
    notes: "Reliable silver supplier with competitive pricing"
  },
  {
    id: "SUP004",
    name: "Gemstone World",
    contact: {
      email: "contact@gemstoneworld.com",
      phone: "+1 (555) 456-7890",
      website: "www.gemstoneworld.com",
      address: "321 Gem Road, Miami, FL 33101"
    },
    materials: ["Sapphire", "Ruby", "Emerald", "Opal"],
    rating: 4.6,
    totalSpend: 38000,
    orders: 15,
    averageDeliveryTime: 5,
    qualityScore: 94,
    reliabilityScore: 92,
    status: "active",
    certifications: ["GRS", "SSEF"],
    paymentTerms: "Net 30",
    minimumOrder: 2000,
    leadTime: 3,
    lastOrder: "2024-01-12",
    notes: "Specialized colored gemstone supplier"
  },
  {
    id: "SUP005",
    name: "Findings Factory",
    contact: {
      email: "sales@findingsfactory.com",
      phone: "+1 (555) 567-8901",
      website: "www.findingsfactory.com",
      address: "654 Findings Lane, Dallas, TX 75201"
    },
    materials: ["Clasps", "Jump Rings", "Earring Posts", "Chains"],
    rating: 4.3,
    totalSpend: 32000,
    orders: 35,
    averageDeliveryTime: 1,
    qualityScore: 89,
    reliabilityScore: 88,
    status: "active",
    certifications: ["ISO 9001"],
    paymentTerms: "Net 30",
    minimumOrder: 200,
    leadTime: 1,
    lastOrder: "2024-01-10",
    notes: "Bulk findings supplier with fast turnaround"
  }
]

export function MaterialSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers)
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>(sampleSuppliers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  // Calculate supplier statistics
  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === "active").length,
    totalSpend: suppliers.reduce((sum, s) => sum + s.totalSpend, 0),
    averageRating: Math.round(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length * 10) / 10,
    averageDeliveryTime: Math.round(suppliers.reduce((sum, s) => sum + s.averageDeliveryTime, 0) / suppliers.length),
    averageQualityScore: Math.round(suppliers.reduce((sum, s) => sum + s.qualityScore, 0) / suppliers.length)
  }

  useEffect(() => {
    let filtered = suppliers

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.materials.some(material => material.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(supplier => supplier.status === statusFilter)
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      const minRating = parseFloat(ratingFilter)
      filtered = filtered.filter(supplier => supplier.rating >= minRating)
    }

    setFilteredSuppliers(filtered)
  }, [suppliers, searchTerm, statusFilter, ratingFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    )
  }

  const handleAddSupplier = () => {
    toast({ title: "Add Supplier", description: "Navigate to add new supplier form." })
  }

  const handleEditSupplier = (id: string) => {
    toast({ title: "Edit Supplier", description: `Edit supplier ${id}` })
  }

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
  }

  const handleContactSupplier = (supplier: Supplier) => {
    toast({ title: "Contact Supplier", description: `Opening contact form for ${supplier.name}` })
  }

  const handleViewDocuments = (supplier: Supplier) => {
    toast({ title: "View Documents", description: `Viewing documents for ${supplier.name}` })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-muted-foreground">Manage supplier relationships, track performance, and maintain quality standards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddSupplier}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSuppliers} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Average: ${Math.round(stats.totalSpend / stats.totalSuppliers).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageQualityScore}% quality score
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDeliveryTime} days</div>
            <p className="text-xs text-muted-foreground">
              Lead time average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Filter and search through your suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers ({filteredSuppliers.length})</CardTitle>
          <CardDescription>Manage your supplier relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Spend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-muted-foreground">{supplier.contact.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {supplier.materials.slice(0, 2).map((material) => (
                        <Badge key={material} variant="outline" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                      {supplier.materials.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.materials.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRatingStars(supplier.rating)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Quality: {supplier.qualityScore}%</span>
                        <Progress value={supplier.qualityScore} className="h-2 w-16" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Reliability: {supplier.reliabilityScore}%</span>
                        <Progress value={supplier.reliabilityScore} className="h-2 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${supplier.totalSpend.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {supplier.orders} orders
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{supplier.lastOrder}</div>
                    <div className="text-xs text-muted-foreground">
                      {supplier.averageDeliveryTime} days avg
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewSupplier(supplier)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(supplier.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleContactSupplier(supplier)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDocuments(supplier)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier Details - {selectedSupplier.name}</CardTitle>
            <CardDescription>Comprehensive supplier information and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedSupplier.contact.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedSupplier.contact.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {selectedSupplier.contact.website}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedSupplier.contact.address}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedSupplier.certifications.map((cert) => (
                      <Badge key={cert} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Performance Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Quality Score</span>
                      <span className="text-sm font-medium">{selectedSupplier.qualityScore}%</span>
                    </div>
                    <Progress value={selectedSupplier.qualityScore} className="h-2" />
                    <div className="flex justify-between">
                      <span className="text-sm">Reliability Score</span>
                      <span className="text-sm font-medium">{selectedSupplier.reliabilityScore}%</span>
                    </div>
                    <Progress value={selectedSupplier.reliabilityScore} className="h-2" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Business Terms</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Terms:</span>
                      <span className="font-medium">{selectedSupplier.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum Order:</span>
                      <span className="font-medium">${selectedSupplier.minimumOrder.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lead Time:</span>
                      <span className="font-medium">{selectedSupplier.leadTime} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{selectedSupplier.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
 