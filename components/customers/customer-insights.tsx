"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  Plus
} from "lucide-react"
import { toast } from "sonner"

// Mock data for insights
const insights = [
  {
    id: 1,
    type: "opportunity",
    title: "VIP Customer Upselling Opportunity",
    description: "15 VIP customers haven't made a purchase in 45 days. Consider personalized outreach.",
    impact: "high",
    customers: 15,
    potentialRevenue: 75000,
    action: "Send personalized offers",
    icon: Target,
    color: "#10b981"
  },
  {
    id: 2,
    type: "trend",
    title: "Growing Interest in Diamond Rings",
    description: "Searches for diamond rings increased by 23% this month compared to last month.",
    impact: "medium",
    customers: 89,
    potentialRevenue: 45000,
    action: "Increase diamond ring inventory",
    icon: TrendingUp,
    color: "#3b82f6"
  },
  {
    id: 3,
    type: "risk",
    title: "Customer Churn Risk",
    description: "23 customers show signs of churn based on declining engagement patterns.",
    impact: "high",
    customers: 23,
    potentialRevenue: -35000,
    action: "Implement retention campaign",
    icon: AlertTriangle,
    color: "#ef4444"
  },
  {
    id: 4,
    type: "opportunity",
    title: "Cross-selling Opportunity",
    description: "67 customers bought rings but haven't purchased matching earrings.",
    impact: "medium",
    customers: 67,
    potentialRevenue: 28000,
    action: "Send earring recommendations",
    icon: ShoppingBag,
    color: "#f59e0b"
  },
  {
    id: 5,
    type: "trend",
    title: "Seasonal Demand Increase",
    description: "Engagement ring searches typically peak in December. Prepare inventory.",
    impact: "medium",
    customers: 0,
    potentialRevenue: 120000,
    action: "Stock up on engagement rings",
    icon: Calendar,
    color: "#8b5cf6"
  },
  {
    id: 6,
    type: "opportunity",
    title: "Customer Feedback Opportunity",
    description: "45 customers haven't left reviews after recent purchases.",
    impact: "low",
    customers: 45,
    potentialRevenue: 0,
    action: "Request reviews",
    icon: Star,
    color: "#06b6d4"
  }
]

const recommendations = [
  {
    id: 1,
    title: "Implement VIP Customer Program",
    description: "Create exclusive benefits for high-value customers to increase retention",
    impact: "High",
    effort: "Medium",
    status: "pending",
    priority: "high"
  },
  {
    id: 2,
    title: "Launch Email Automation Campaign",
    description: "Set up automated follow-up emails for abandoned carts and post-purchase",
    impact: "Medium",
    effort: "Low",
    status: "in-progress",
    priority: "medium"
  },
  {
    id: 3,
    title: "Enhance Customer Support",
    description: "Add live chat support to improve customer satisfaction and conversion",
    impact: "High",
    effort: "High",
    status: "pending",
    priority: "medium"
  },
  {
    id: 4,
    title: "Create Loyalty Program",
    description: "Implement points-based loyalty system to encourage repeat purchases",
    impact: "Medium",
    effort: "Medium",
    status: "pending",
    priority: "low"
  }
]

export function CustomerInsights() {
  const [selectedInsight, setSelectedInsight] = useState<any>(null)
  const [filterType, setFilterType] = useState("all")
  const [filterImpact, setFilterImpact] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  const handleActionClick = (insight: any) => {
    toast.success(`Action "${insight.action}" initiated for ${insight.customers} customers`)
  }

  const handleExportInsights = () => {
    setIsLoading(true)
    setTimeout(() => {
      toast.success("Insights exported successfully!")
      setIsLoading(false)
    }, 1500)
  }

  const handleRefreshInsights = () => {
    setIsLoading(true)
    setTimeout(() => {
      toast.success("Insights refreshed!")
      setIsLoading(false)
    }, 1000)
  }

  const filteredInsights = insights.filter(insight => {
    const matchesType = filterType === "all" || insight.type === filterType
    const matchesImpact = filterImpact === "all" || insight.impact === filterImpact
    return matchesType && matchesImpact
  })

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-500"
      case "medium": return "text-yellow-500"
      case "low": return "text-green-500"
      default: return "text-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Insights</h2>
          <p className="text-muted-foreground">
            AI-powered insights and recommendations to optimize customer relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshInsights} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportInsights} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="opportunity">Opportunities</SelectItem>
            <SelectItem value="trend">Trends</SelectItem>
            <SelectItem value="risk">Risks</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterImpact} onValueChange={setFilterImpact}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Impact Levels</SelectItem>
            <SelectItem value="high">High Impact</SelectItem>
            <SelectItem value="medium">Medium Impact</SelectItem>
            <SelectItem value="low">Low Impact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInsights.map((insight) => {
          const IconComponent = insight.icon
          return (
            <Card key={insight.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg" 
                      style={{ backgroundColor: insight.color + '20' }}
                    >
                      <IconComponent className="h-4 w-4" style={{ color: insight.color }} />
                    </div>
                    <Badge 
                      variant={insight.type === 'opportunity' ? 'default' : 
                              insight.type === 'risk' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {insight.type}
                    </Badge>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getImpactColor(insight.impact)}`}
                  >
                    {insight.impact} impact
                  </Badge>
                </div>
                <CardTitle className="text-base">{insight.title}</CardTitle>
                <CardDescription className="text-sm">
                  {insight.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customers</p>
                    <p className="font-semibold">{insight.customers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Potential</p>
                    <p className={`font-semibold ${insight.potentialRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(insight.potentialRevenue).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleActionClick(insight)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {insight.action}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Strategic Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated recommendations to improve customer experience and business performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                    <Badge variant="outline">
                      {rec.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Impact: {rec.impact}</span>
                    <span>Effort: {rec.effort}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm">
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Implement
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions to improve customer relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Mail className="h-6 w-6" />
              <span>Send Follow-ups</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Phone className="h-6 w-6" />
              <span>Call Customers</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Target className="h-6 w-6" />
              <span>Create Campaign</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>Add Customer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 