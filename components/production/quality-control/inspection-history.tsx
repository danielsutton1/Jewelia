"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileDown, Eye, Download, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// Sample data for demonstration
const sampleInspections = [
  {
    id: "QC-10045",
    workOrderId: "WO-5678",
    itemType: "Ring",
    inspectionDate: "2025-05-15",
    inspector: "Emma Johnson",
    status: "approved",
    issues: 0,
  },
  {
    id: "QC-10044",
    workOrderId: "WO-5677",
    itemType: "Necklace",
    inspectionDate: "2025-05-14",
    inspector: "Michael Chen",
    status: "rejected",
    issues: 3,
  },
  {
    id: "QC-10043",
    workOrderId: "WO-5676",
    itemType: "Bracelet",
    inspectionDate: "2025-05-14",
    inspector: "Emma Johnson",
    status: "review",
    issues: 1,
  },
  {
    id: "QC-10042",
    workOrderId: "WO-5675",
    itemType: "Earrings",
    inspectionDate: "2025-05-13",
    inspector: "David Wilson",
    status: "approved",
    issues: 0,
  },
  {
    id: "QC-10041",
    workOrderId: "WO-5674",
    itemType: "Pendant",
    inspectionDate: "2025-05-12",
    inspector: "Sarah Martinez",
    status: "approved",
    issues: 0,
  },
]

export function InspectionHistory() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredInspections = sampleInspections.filter((inspection) => {
    const matchesSearch =
      inspection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.itemType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || inspection.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewInspection = (inspectionId: string) => {
    toast({
      title: "View Inspection",
      description: `Opening inspection details for ${inspectionId}...`
    })
    // In a real app, this would navigate to inspection details
    router.push(`/dashboard/production/quality-control/inspections/${inspectionId}`)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create CSV content
      const csvContent = [
        "Inspection ID,Work Order,Item Type,Date,Inspector,Status,Issues",
        ...filteredInspections.map(inspection => 
          `${inspection.id},${inspection.workOrderId},${inspection.itemType},${inspection.inspectionDate},${inspection.inspector},${inspection.status},${inspection.issues}`
        )
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `inspection-history-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: `Exported ${filteredInspections.length} inspection records.`
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export inspection history. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Data Refreshed",
        description: "Inspection history has been updated with latest data."
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFilterChange = () => {
    toast({
      title: "Filters Applied",
      description: `Showing ${filteredInspections.length} inspection records.`
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inspections..."
            className="pl-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={isExporting}
          >
            <FileDown className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inspection ID</TableHead>
              <TableHead>Work Order</TableHead>
              <TableHead>Item Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.map((inspection) => (
              <TableRow key={inspection.id}>
                <TableCell className="font-medium">{inspection.id}</TableCell>
                <TableCell>{inspection.workOrderId}</TableCell>
                <TableCell>{inspection.itemType}</TableCell>
                <TableCell>{inspection.inspectionDate}</TableCell>
                <TableCell>{inspection.inspector}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      inspection.status === "approved"
                        ? "default"
                        : inspection.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {inspection.status === "approved"
                      ? "Approved"
                      : inspection.status === "rejected"
                        ? "Rejected"
                        : "Under Review"}
                  </Badge>
                </TableCell>
                <TableCell>{inspection.issues}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewInspection(inspection.id)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredInspections.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No inspection records found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
