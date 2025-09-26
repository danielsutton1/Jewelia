import { Plus, ShoppingCart, Package, DollarSign, Users, Crown, TrendingUp, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface CombinedHeaderProps {
  analytics?: {
    totalCustomers: number
    newThisMonth: number
    averageOrderValue: number
    retentionRate: number
  }
}

export function CombinedHeader({ analytics }: CombinedHeaderProps) {
  const mockAnalytics = analytics || {
    totalCustomers: 1247,
    newThisMonth: 89,
    averageOrderValue: 2450,
    retentionRate: 87.3
  }

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                Customer Management
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Analytics Cards - Matching Dashboard Style */}
      <CardContent className="pb-6">
        <div className="w-full overflow-x-auto md:overflow-visible">
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
            {/* Total Customers */}
            <Link href="/dashboard/customers/analytics">
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">Total Customers</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Customer
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                    {mockAnalytics.totalCustomers.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{mockAnalytics.newThisMonth} this month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  Total number of customers in the system
                </p>
                </CardContent>
              </Card>
            </Link>
            
            {/* Average Order Value */}
            <Link href="/dashboard/analytics/revenue">
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">Avg Order Value</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Financial
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                    ${mockAnalytics.averageOrderValue.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12.5% from last month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  Average value per customer order
                </p>
                </CardContent>
              </Card>
            </Link>
            
            {/* Retention Rate */}
            <Link href="/dashboard/customers/segments">
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">Retention Rate</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Customer
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                    {mockAnalytics.retentionRate}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+5.2% from last month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  Percentage of customers who return
                </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 