import { ArrowDown, ArrowUp, DollarSign, ShoppingBag, Users, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AnalyticsSummary() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
      <div className="relative p-4">
        <div className="w-full overflow-x-auto md:overflow-visible">
          <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">Total Revenue</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Financial
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                    $45,231.89
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    <span>+20.1% from last month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  Total revenue generated this period
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <ShoppingBag className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">Sales</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Performance
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                    +2,350
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    <span>+12.2% from last month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  Sales transactions this period
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">Active Customers</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Growth
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                    +573
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    <span>+8.4% from last month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  New active customers this period
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">Average Order Value</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Metrics
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                    $249.80
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <ArrowDown className="h-3 w-3" />
                    <span>-3.1% from last month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  Average value per order transaction
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
