import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BillingOverview } from "@/components/billing/billing-overview"
import { InvoiceHistory } from "@/components/billing/invoice-history"
import { PaymentMethods } from "@/components/billing/payment-methods"
import { SubscriptionPlans } from "@/components/billing/subscription-plans"
import { CreditCard, Sparkles, Gem } from "lucide-react"

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-1 p-1 w-full">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-green-700 to-emerald-800 bg-clip-text text-transparent tracking-tight billing-heading">
                      Billing & Payments
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium billing-subtext">Manage your subscription, payment methods, and billing history</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>Premium Features Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Secure Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Billing Overview */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 lg:p-8">
            <BillingOverview />
          </div>
        </div>

        {/* Enhanced Main Content with Tabs */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 lg:p-8">
            <Tabs defaultValue="subscription" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20 overflow-x-auto">
                <TabsTrigger 
                  value="subscription" 
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]"
                >
                  Subscription
                </TabsTrigger>
                <TabsTrigger 
                  value="payment-methods" 
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]"
                >
                  Payment Methods
                </TabsTrigger>
                <TabsTrigger 
                  value="billing-history" 
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]"
                >
                  Billing History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subscription" className="space-y-4 sm:space-y-6 pt-4">
                <SubscriptionPlans />
              </TabsContent>

              <TabsContent value="payment-methods" className="space-y-4 sm:space-y-6 pt-4">
                <PaymentMethods />
              </TabsContent>

              <TabsContent value="billing-history" className="space-y-4 sm:space-y-6 pt-4">
                <InvoiceHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
