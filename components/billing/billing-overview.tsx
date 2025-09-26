import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, CheckCircle, Crown, TrendingUp, DollarSign, Shield } from "lucide-react"

export function BillingOverview() {
  return (
    <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto">
      {/* Current Plan */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group min-w-[280px] sm:min-w-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Current Plan</CardTitle>
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Professional</div>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">$49.99/month</p>
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>

      {/* Next Billing Date */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group min-w-[280px] sm:min-w-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Next Billing Date</CardTitle>
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2">June 15, 2023</div>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">Automatic renewal</p>
          <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
            Change Billing Cycle
          </Button>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group min-w-[280px] sm:min-w-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Payment Method</CardTitle>
          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg shadow-lg">
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2">•••• 4242</div>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">Expires 04/2025</p>
          <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
            Update Payment
          </Button>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group min-w-[280px] sm:min-w-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Payment Status</CardTitle>
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Paid</div>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">Last payment: May 15, 2023</p>
          <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
            View Receipt
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
