import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesOverview } from "@/components/analytics/sales-overview"
import { CustomerAnalytics } from "@/components/analytics/customer-analytics"
import { ProductPerformance } from "@/components/analytics/product-performance"
import { ChannelAnalytics } from "@/components/analytics/channel-analytics"
import { AnalyticsSummary } from "@/components/analytics/analytics-summary"
import { BarChart3, Sparkles, Gem, Users, ShoppingBag } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-1 p-1 w-full">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-400 to-emerald-500 rounded-xl shadow-lg">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-emerald-800 bg-clip-text text-transparent tracking-tight analytics-heading">
                      Analytics Dashboard
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium analytics-subtext">Premium insights and performance metrics for your business</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    <span>Premium Features Enabled</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Advanced Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Summary Boxes */}
        <AnalyticsSummary />

        {/* Enhanced Tabs Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 md:p-8">
            <Tabs defaultValue="sales" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 sm:p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20 overflow-x-auto">
                <TabsTrigger 
                  value="sales" 
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-blue-500 data-[state=active]:to-emerald-500">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline">Sales</span>
                  <span className="sm:hidden">Sales</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-blue-500 data-[state=active]:to-emerald-500">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline">Customers</span>
                  <span className="sm:hidden">Cust</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="products" 
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-blue-500 data-[state=active]:to-emerald-500">
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline">Products</span>
                  <span className="sm:hidden">Prod</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="channels" 
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-blue-500 data-[state=active]:to-emerald-500">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline">Channels</span>
                  <span className="sm:hidden">Chan</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                <SalesOverview />
              </TabsContent>

              <TabsContent value="customers" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                <CustomerAnalytics />
              </TabsContent>

              <TabsContent value="products" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                <ProductPerformance />
              </TabsContent>

              <TabsContent value="channels" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                <ChannelAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
