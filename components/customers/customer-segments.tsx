"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Filter,
  Download,
  Mail,
  Target,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Eye
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Mock data for segments
const segments = [
  {
    id: "vip",
    name: "VIP Customers",
    description: "High-value customers with premium service",
    criteria: "Order value > $10,000 OR 10+ orders",
    customerCount: 156,
    totalRevenue: 1250000,
    avgOrderValue: 8012,
    growth: 12.5,
    color: "#10b981",
    status: "active"
  },
  {
    id: "regular",
    name: "Regular Buyers",
    description: "Consistent customers with moderate spending",
    criteria: "3-9 orders OR $1,000-$10,000 total",
    customerCount: 423,
    totalRevenue: 890000,
    avgOrderValue: 2104,
    growth: 8.2,
    color: "#3b82f6",
    status: "active"
  },
  {
    id: "occasional",
    name: "Occasional Buyers",
    description: "Infrequent customers with low engagement",
    criteria: "1-2 orders OR $100-$1,000 total",
    customerCount: 298,
    totalRevenue: 340000,
    avgOrderValue: 1141,
    growth: 2.1,
    color: "#f59e0b",
    status: "active"
  },
  {
    id: "new",
    name: "New Customers",
    description: "Recently acquired customers",
    criteria: "First order within 30 days",
    customerCount: 89,
    totalRevenue: 156000,
    avgOrderValue: 1753,
    growth: 15.7,
    color: "#8b5cf6",
    status: "active"
  },
  {
    id: "at-risk",
    name: "At Risk",
    description: "Customers showing signs of churn",
    criteria: "No activity for 90+ days",
    customerCount: 67,
    totalRevenue: 45000,
    avgOrderValue: 672,
    growth: -5.3,
    color: "#ef4444",
    status: "warning"
  }
]

export function CustomerSegments() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const handleCreateSegment = () => {
    toast.success("New segment created successfully!")
    setIsCreateDialogOpen(false)
  }

  const handleEditSegment = (segment: any) => {
    setSelectedSegment(segment)
    setIsEditDialogOpen(true)
  }

  const handleDeleteSegment = (segment: any) => {
    toast.success(`Segment "${segment.name}" deleted successfully!`)
  }

  const handleExportSegments = () => {
    toast.success("Segments data exported successfully!")
  }

  const handleSendCampaign = (segment: any) => {
    toast.success(`Campaign sent to ${segment.customerCount} customers in ${segment.name}`)
  }

  const filteredSegments = segments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || segment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Segments</h2>
          <p className="text-muted-foreground">
            Organize and manage customer groups for targeted marketing and analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSegments}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Segment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Segment Name</label>
                  <Input placeholder="Enter segment name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Enter description" />
                </div>
                <div>
                  <label className="text-sm font-medium">Criteria</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select criteria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order-value">Order Value</SelectItem>
                      <SelectItem value="order-count">Order Count</SelectItem>
                      <SelectItem value="last-activity">Last Activity</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSegment}>Create Segment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="warning">At Risk</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Segment Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSegments.map((segment) => (
          <Card key={segment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold" style={{ color: segment.color }}>{segment.name}</CardTitle>
                <CardDescription>{segment.description}</CardDescription>
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong>Criteria:</strong> {segment.criteria}
                </div>
              </div>
              <Badge style={{ backgroundColor: segment.color, color: '#fff' }}>{segment.customerCount} customers</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Total Revenue</div>
                  <div className="font-semibold">${segment.totalRevenue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Avg Order Value</div>
                  <div className="font-semibold">${segment.avgOrderValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Growth</div>
                  <div className={`font-semibold ${segment.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{segment.growth}%</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  {segment.id === "vip" ? (
                    <a href="/dashboard/customers/VIP-002/orders">
                      <Users className="h-3 w-3 mr-1" />
                      View
                    </a>
                  ) : (
                    <a href={`/dashboard/customers?segment=${segment.id}`}>
                      <Users className="h-3 w-3 mr-1" />
                      View
                    </a>
                  )}
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`/dashboard/campaigns/create?segment=${segment.id}`}>
                    <Mail className="h-3 w-3 mr-1" />
                    Campaign
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Details</CardTitle>
          <CardDescription>
            Detailed view of all customer segments with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Avg Order</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSegments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <div>
                        <p className="font-medium">{segment.name}</p>
                        <p className="text-sm text-muted-foreground">{segment.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{segment.customerCount.toLocaleString()}</TableCell>
                  <TableCell>${segment.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>${segment.avgOrderValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {segment.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1 text-red-500 rotate-180" />
                      )}
                      <span className={segment.growth > 0 ? 'text-green-500' : 'text-red-500'}>
                        {segment.growth > 0 ? '+' : ''}{segment.growth}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={segment.status === 'active' ? 'default' : 'destructive'}
                    >
                      {segment.status === 'active' ? 'Active' : 'At Risk'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Segment</DialogTitle>
          </DialogHeader>
          {selectedSegment && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Segment Name</label>
                <Input defaultValue={selectedSegment.name} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input defaultValue={selectedSegment.description} />
              </div>
              <div>
                <label className="text-sm font-medium">Criteria</label>
                <Input defaultValue={selectedSegment.criteria} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success("Segment updated successfully!")
              setIsEditDialogOpen(false)
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
 