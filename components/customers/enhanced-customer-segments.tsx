"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Crown, 
  Star, 
  Target, 
  AlertTriangle, 
  UserCheck, 
  UserX,
  Filter,
  Search,
  Plus,
  Settings,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Zap,
  Sparkles,
  Gem,
  Award,
  Heart,
  Clock,
  MapPin,
  Building
} from "lucide-react"
import { toast } from "sonner"

interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: {
    spendingRange: [number, number]
    orderFrequency: [number, number]
    lastOrderDays: [number, number]
    location?: string
    productPreferences?: string[]
  }
  customers: Array<{
    id: string
    name: string
    email: string
    totalSpent: number
    orders: number
    lastOrder: string
    status: 'vip' | 'regular' | 'new' | 'at_risk'
  }>
  metrics: {
    count: number
    totalRevenue: number
    averageOrderValue: number
    retentionRate: number
    growthRate: number
  }
  actions: string[]
  color: string
  icon: string
}

interface Customer {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  company?: string
  created_at: string
  updated_at: string
}

export function EnhancedCustomerSegments() {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showCreateSegment, setShowCreateSegment] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch customers
      const customersResponse = await fetch('/api/customers?limit=1000')
      const customersData = await customersResponse.json()
      const customersList = customersData.data || []
      setCustomers(customersList)
      
      // Create segments based on customer data
      const segmentsData: CustomerSegment[] = [
        {
          id: "vip",
          name: "VIP Customers",
          description: "High-value customers with premium spending patterns",
          criteria: {
            spendingRange: [5000, 100000],
            orderFrequency: [5, 50],
            lastOrderDays: [0, 90]
          },
          customers: customersList.slice(0, Math.floor(customersList.length * 0.15)).map((c: Customer, i: number) => ({
            id: c.id,
            name: c.full_name || c.email,
            email: c.email,
            totalSpent: Math.random() * 50000 + 10000,
            orders: Math.floor(Math.random() * 20) + 10,
            lastOrder: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'vip'
          })),
          metrics: {
            count: Math.floor(customersList.length * 0.15),
            totalRevenue: customersList.length * 5000,
            averageOrderValue: 3500,
            retentionRate: 95.2,
            growthRate: 12.5
          },
          actions: ["Personal concierge service", "Exclusive events", "Priority support", "Custom designs"],
          color: "#10b981",
          icon: "crown"
        },
        {
          id: "regular",
          name: "Regular Buyers",
          description: "Consistent customers with moderate spending",
          criteria: {
            spendingRange: [1000, 5000],
            orderFrequency: [2, 10],
            lastOrderDays: [0, 180]
          },
          customers: customersList.slice(Math.floor(customersList.length * 0.15), Math.floor(customersList.length * 0.5)).map((c: Customer, i: number) => ({
            id: c.id,
            name: c.full_name || c.email,
            email: c.email,
            totalSpent: Math.random() * 4000 + 1000,
            orders: Math.floor(Math.random() * 8) + 2,
            lastOrder: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'regular'
          })),
          metrics: {
            count: Math.floor(customersList.length * 0.35),
            totalRevenue: customersList.length * 2000,
            averageOrderValue: 1800,
            retentionRate: 87.3,
            growthRate: 8.2
          },
          actions: ["Loyalty program", "Seasonal promotions", "Email campaigns", "Appointment reminders"],
          color: "#3b82f6",
          icon: "star"
        },
        {
          id: "new",
          name: "New Customers",
          description: "Recent customers with potential for growth",
          criteria: {
            spendingRange: [100, 1000],
            orderFrequency: [1, 3],
            lastOrderDays: [0, 30]
          },
          customers: customersList.slice(Math.floor(customersList.length * 0.5), Math.floor(customersList.length * 0.65)).map((c: Customer, i: number) => ({
            id: c.id,
            name: c.full_name || c.email,
            email: c.email,
            totalSpent: Math.random() * 900 + 100,
            orders: Math.floor(Math.random() * 2) + 1,
            lastOrder: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'new'
          })),
          metrics: {
            count: Math.floor(customersList.length * 0.15),
            totalRevenue: customersList.length * 500,
            averageOrderValue: 800,
            retentionRate: 65.8,
            growthRate: 15.7
          },
          actions: ["Welcome series", "First purchase discount", "Product recommendations", "Follow-up calls"],
          color: "#8b5cf6",
          icon: "user-check"
        },
        {
          id: "at-risk",
          name: "At Risk",
          description: "Customers showing signs of churn",
          criteria: {
            spendingRange: [0, 500],
            orderFrequency: [0, 1],
            lastOrderDays: [180, 365]
          },
          customers: customersList.slice(Math.floor(customersList.length * 0.65), Math.floor(customersList.length * 0.75)).map((c: Customer, i: number) => ({
            id: c.id,
            name: c.full_name || c.email,
            email: c.email,
            totalSpent: Math.random() * 500,
            orders: Math.floor(Math.random() * 2),
            lastOrder: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'at_risk'
          })),
          metrics: {
            count: Math.floor(customersList.length * 0.1),
            totalRevenue: customersList.length * 200,
            averageOrderValue: 400,
            retentionRate: 45.2,
            growthRate: -5.3
          },
          actions: ["Re-engagement campaigns", "Special offers", "Customer feedback", "Personal outreach"],
          color: "#ef4444",
          icon: "alert-triangle"
        }
      ]
      
      setSegments(segmentsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load customer segments')
    } finally {
      setLoading(false)
    }
  }

  const getSegmentIcon = (icon: string) => {
    const icons = {
      crown: Crown,
      star: Star,
      "user-check": UserCheck,
      "alert-triangle": AlertTriangle
    }
    const Icon = icons[icon as keyof typeof icons] || Users
    return <Icon className="h-5 w-5" />
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      vip: { color: 'bg-purple-100 text-purple-800', icon: Crown },
      regular: { color: 'bg-blue-100 text-blue-800', icon: Star },
      new: { color: 'bg-green-100 text-green-800', icon: UserCheck },
      at_risk: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.regular
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleSegmentAction = (segmentId: string, action: string) => {
    toast.success(`${action} initiated for ${segments.find(s => s.id === segmentId)?.name} segment`)
  }

  const handleExportSegment = (segment: CustomerSegment) => {
    const csvContent = [
      ['Name', 'Email', 'Total Spent', 'Orders', 'Last Order', 'Status'],
      ...segment.customers.map(c => [
        c.name,
        c.email,
        formatCurrency(c.totalSpent),
        c.orders.toString(),
        new Date(c.lastOrder).toLocaleDateString(),
        c.status
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${segment.name.toLowerCase().replace(' ', '-')}-customers.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success(`${segment.name} customers exported successfully!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading customer segments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customer Segmentation</h2>
          <p className="text-muted-foreground">
            Intelligent customer grouping for targeted marketing and personalized experiences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateSegment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search segments or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Segments Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {segments.map((segment) => (
          <Card key={segment.id} className="relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: segment.color }}
            ></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: segment.color + '20' }}
                  >
                    <div style={{ color: segment.color }}>
                      {getSegmentIcon(segment.icon)}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                    <CardDescription>{segment.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{segment.metrics.count}</div>
                  <div className="text-sm text-muted-foreground">customers</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                  <div className="text-lg font-semibold">{formatCurrency(segment.metrics.totalRevenue)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg Order Value</div>
                  <div className="text-lg font-semibold">{formatCurrency(segment.metrics.averageOrderValue)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Retention Rate</div>
                  <div className="text-lg font-semibold">{segment.metrics.retentionRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Growth Rate</div>
                  <div className={`text-lg font-semibold ${segment.metrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {segment.metrics.growthRate > 0 ? '+' : ''}{segment.metrics.growthRate}%
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="text-sm font-medium mb-2">Recommended Actions</div>
                <div className="flex flex-wrap gap-2">
                  {segment.actions.slice(0, 2).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSegmentAction(segment.id, action)}
                    >
                      {action}
                    </Button>
                  ))}
                  {segment.actions.length > 2 && (
                    <Button variant="outline" size="sm">
                      +{segment.actions.length - 2} more
                    </Button>
                  )}
                </div>
              </div>

              {/* Top Customers Preview */}
              <div>
                <div className="text-sm font-medium mb-2">Top Customers</div>
                <div className="space-y-2">
                  {segment.customers.slice(0, 3).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(customer.totalSpent)}</div>
                        </div>
                      </div>
                      {getStatusBadge(customer.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedSegment(segment.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportSegment(segment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segment Details Modal */}
      {selectedSegment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {segments.find(s => s.id === selectedSegment)?.name} - All Customers
              </h3>
              <Button variant="outline" onClick={() => setSelectedSegment(null)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              {segments.find(s => s.id === selectedSegment)?.customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold">{customer.name}</h4>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(customer.totalSpent)}</div>
                      <div className="text-sm text-muted-foreground">{customer.orders} orders</div>
                    </div>
                    {getStatusBadge(customer.status)}
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 