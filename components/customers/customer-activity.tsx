"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  DollarSign, 
  ShoppingBag, 
  Mail, 
  Phone, 
  MessageSquare, 
  Star, 
  Heart, 
  Eye, 
  Download,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for customer activity
const activities = [
  {
    id: 1,
    customer: "Sarah Johnson",
    customerId: "CUST-001",
    type: "purchase",
    description: "Purchased Diamond Ring",
    amount: 3200,
    timestamp: "2 hours ago",
    status: "completed",
    icon: ShoppingBag,
    color: "green"
  },
  {
    id: 2,
    customer: "Michael Chen",
    customerId: "CUST-002",
    type: "inquiry",
    description: "Inquired about Custom Design",
    timestamp: "4 hours ago",
    status: "pending",
    icon: MessageSquare,
    color: "blue"
  },
  {
    id: 3,
    customer: "Emma Davis",
    customerId: "CUST-003",
    type: "appointment",
    description: "Scheduled Consultation",
    timestamp: "6 hours ago",
    status: "scheduled",
    icon: Calendar,
    color: "purple"
  },
  {
    id: 4,
    customer: "David Wilson",
    customerId: "CUST-004",
    type: "review",
    description: "Left 5-star Review",
    rating: 5,
    timestamp: "1 day ago",
    status: "completed",
    icon: Star,
    color: "yellow"
  },
  {
    id: 5,
    customer: "Lisa Anderson",
    customerId: "CUST-005",
    type: "purchase",
    description: "Purchased Wedding Set",
    amount: 5800,
    timestamp: "2 days ago",
    status: "completed",
    icon: ShoppingBag,
    color: "green"
  },
  {
    id: 6,
    customer: "Sarah Johnson",
    customerId: "CUST-001",
    type: "email",
    description: "Opened Newsletter",
    timestamp: "3 days ago",
    status: "completed",
    icon: Mail,
    color: "blue"
  },
  {
    id: 7,
    customer: "Michael Chen",
    customerId: "CUST-002",
    type: "call",
    description: "Phone Consultation",
    timestamp: "1 week ago",
    status: "completed",
    icon: Phone,
    color: "green"
  },
  {
    id: 8,
    customer: "Emma Davis",
    customerId: "CUST-003",
    type: "wishlist",
    description: "Added to Wishlist",
    timestamp: "1 week ago",
    status: "completed",
    icon: Heart,
    color: "red"
  }
]

const activityStats = {
  totalActivities: 1247,
  todayActivities: 89,
  avgEngagement: 4.2,
  topCustomers: [
    { name: "Sarah Johnson", activities: 23, value: 45000 },
    { name: "Michael Chen", activities: 18, value: 38000 },
    { name: "Emma Davis", activities: 15, value: 32000 },
    { name: "David Wilson", activities: 12, value: 28000 },
    { name: "Lisa Anderson", activities: 10, value: 25000 }
  ],
  activityTypes: [
    { type: "purchase", count: 456, percentage: 36.6 },
    { type: "inquiry", count: 234, percentage: 18.8 },
    { type: "appointment", count: 189, percentage: 15.2 },
    { type: "review", count: 156, percentage: 12.5 },
    { type: "email", count: 123, percentage: 9.9 },
    { type: "call", count: 89, percentage: 7.1 }
  ]
}

export function CustomerActivity() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("7d")

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.customer.toLowerCase().includes(search.toLowerCase()) ||
                         activity.description.toLowerCase().includes(search.toLowerCase())
    
    if (filter === "all") return matchesSearch
    return matchesSearch && activity.type === filter
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "purchase": return ShoppingBag
      case "inquiry": return MessageSquare
      case "appointment": return Calendar
      case "review": return Star
      case "email": return Mail
      case "call": return Phone
      case "wishlist": return Heart
      default: return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "scheduled": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Activity</h2>
          <p className="text-muted-foreground">Track customer interactions and engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.totalActivities.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{activityStats.todayActivities} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.avgEngagement}</div>
            <p className="text-xs text-muted-foreground">
              activities per customer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.4%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-8"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="inquiry">Inquiries</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="review">Reviews</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Timeline</CardTitle>
              <CardDescription>Customer interactions and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${activity.color}-100`}>
                          <IconComponent className={`h-5 w-5 text-${activity.color}-600`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{activity.customer}</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.customerId}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        {activity.amount && (
                          <div className="flex items-center gap-1 mt-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              ${activity.amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {activity.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{activity.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Table</CardTitle>
              <CardDescription>Detailed view of all customer activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/diverse-group-avatars.png" alt={activity.customer} />
                            <AvatarFallback>
                              {activity.customer.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{activity.customer}</div>
                            <div className="text-sm text-muted-foreground">{activity.customerId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {React.createElement(getActivityIcon(activity.type), { className: "h-4 w-4" })}
                          <span>{activity.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity.amount ? `$${activity.amount.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.timestamp}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Follow Up</DropdownMenuItem>
                            <DropdownMenuItem>Add Note</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Types</CardTitle>
                <CardDescription>Distribution of customer activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityStats.activityTypes.map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium capitalize">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{type.count}</div>
                        <div className="text-xs text-muted-foreground">{type.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Customers</CardTitle>
                <CardDescription>Customers with highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityStats.topCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-emerald-600">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.activities} activities
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${customer.value.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total value</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">+15.2%</div>
                  <div className="text-sm text-muted-foreground">Customer engagement increase</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">2.4x</div>
                  <div className="text-sm text-muted-foreground">Higher conversion rate</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Monday</span>
                    <span className="text-sm font-medium">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Wednesday</span>
                    <span className="text-sm font-medium">Peak</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Friday</span>
                    <span className="text-sm font-medium">High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="text-sm">Follow up with customers who haven't purchased in 30+ days</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="text-sm">Send personalized recommendations to VIP customers</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div className="text-sm">Schedule more consultations during peak hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 