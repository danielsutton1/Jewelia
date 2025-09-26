"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Filter, AlertTriangle, CheckCircle, Clock, Search } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Mock data for compliance status
const complianceOverview = {
  compliant: 75,
  pending: 15,
  nonCompliant: 10,
  totalSuppliers: 40,
}

const complianceByCategory = [
  { category: "Quality Certification", compliant: 85, pending: 10, nonCompliant: 5 },
  { category: "Ethical Sourcing", compliant: 80, pending: 15, nonCompliant: 5 },
  { category: "Environmental Standards", compliant: 70, pending: 20, nonCompliant: 10 },
  { category: "Labor Practices", compliant: 75, pending: 15, nonCompliant: 10 },
  { category: "Information Security", compliant: 65, pending: 20, nonCompliant: 15 },
  { category: "Financial Stability", compliant: 80, pending: 10, nonCompliant: 10 },
]

const supplierComplianceData = [
  {
    id: 1,
    name: "GoldCraft Suppliers",
    category: "Metal Suppliers",
    status: "compliant",
    lastAudit: "2023-10-15",
    nextAudit: "2024-10-15",
    score: 95,
    issues: 0,
  },
  {
    id: 2,
    name: "Diamond District Gems",
    category: "Stone Suppliers",
    status: "compliant",
    lastAudit: "2023-09-20",
    nextAudit: "2024-09-20",
    score: 92,
    issues: 0,
  },
  {
    id: 3,
    name: "Precision Casting Co.",
    category: "Casting Services",
    status: "pending",
    lastAudit: "2023-11-05",
    nextAudit: "2024-11-05",
    score: 85,
    issues: 1,
  },
  {
    id: 4,
    name: "Master Engravers Guild",
    category: "Engraving Services",
    status: "non-compliant",
    lastAudit: "2023-08-10",
    nextAudit: "2024-02-10",
    score: 65,
    issues: 3,
  },
  {
    id: 5,
    name: "Shine Plating Services",
    category: "Plating Services",
    status: "compliant",
    lastAudit: "2023-07-25",
    nextAudit: "2024-07-25",
    score: 90,
    issues: 0,
  },
  {
    id: 6,
    name: "Elite Craftspeople",
    category: "Contractors",
    status: "pending",
    lastAudit: "2023-12-01",
    nextAudit: "2024-12-01",
    score: 88,
    issues: 1,
  },
  {
    id: 7,
    name: "Swift Shipping Partners",
    category: "Shipping Partners",
    status: "compliant",
    lastAudit: "2023-10-30",
    nextAudit: "2024-10-30",
    score: 94,
    issues: 0,
  },
  {
    id: 8,
    name: "Pearl Perfection",
    category: "Stone Suppliers",
    status: "non-compliant",
    lastAudit: "2023-09-15",
    nextAudit: "2024-03-15",
    score: 70,
    issues: 2,
  },
]

interface SupplierComplianceStatusProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function SupplierComplianceStatus({ timeRange, selectedSuppliers, selectedCategories }: SupplierComplianceStatusProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter suppliers based on search term and status filter
  const filteredSuppliers = supplierComplianceData.filter((supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Compliant</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
      case "non-compliant":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Non-Compliant</Badge>
      default:
        return null
    }
  }

  // Helper function to render status icon
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "non-compliant":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Compliance Status</CardTitle>
        <CardDescription>Compliance and certification tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search suppliers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="metals">Metal Suppliers</SelectItem>
                        <SelectItem value="stones">Stone Suppliers</SelectItem>
                        <SelectItem value="findings">Findings Suppliers</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Compliance Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="quality">Quality Certification</SelectItem>
                        <SelectItem value="ethical">Ethical Sourcing</SelectItem>
                        <SelectItem value="environmental">Environmental Standards</SelectItem>
                        <SelectItem value="labor">Labor Practices</SelectItem>
                        <SelectItem value="security">Information Security</SelectItem>
                        <SelectItem value="financial">Financial Stability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Audit Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="last30">Last 30 Days</SelectItem>
                        <SelectItem value="last90">Last 90 Days</SelectItem>
                        <SelectItem value="last180">Last 180 Days</SelectItem>
                        <SelectItem value="next30">Next 30 Days</SelectItem>
                        <SelectItem value="next90">Next 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Current compliance status of all suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compliant</span>
                      <span className="font-medium">{complianceOverview.compliant}%</span>
                    </div>
                    <Progress value={complianceOverview.compliant} className="h-2 bg-muted [&>div]:bg-green-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pending</span>
                      <span className="font-medium">{complianceOverview.pending}%</span>
                    </div>
                    <Progress value={complianceOverview.pending} className="h-2 bg-muted [&>div]:bg-amber-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Non-Compliant</span>
                      <span className="font-medium">{complianceOverview.nonCompliant}%</span>
                    </div>
                    <Progress value={complianceOverview.nonCompliant} className="h-2 bg-muted [&>div]:bg-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SupplierComplianceStatus;
