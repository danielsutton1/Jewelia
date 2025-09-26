"use client"

import { OrderCreationHeader } from "@/components/orders/order-creation-header"
import { ItemAdditionInterface } from "@/components/orders/item-addition-interface"
import { OrderItemsTable, OrderItem } from "@/components/orders/order-items-table"
import { DiscountApplication } from "@/components/orders/discount-application"
import { PaymentInterface } from "@/components/orders/payment-interface"
import { DeliveryMethodSelection } from "@/components/orders/delivery-method-selection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Clock, 
  Plus, 
  Settings, 
  RefreshCw,
  Sparkles,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  Truck,
  CreditCard
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateOrderPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const router = useRouter()

  // Mock analytics data for the order creation process
  const orderAnalytics = {
    totalItems: orderItems.length,
    totalValue: orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
    averageValue: orderItems.length > 0 ? orderItems.reduce((sum, item) => sum + item.unitPrice, 0) / orderItems.length : 0,
    pendingItems: orderItems.length // All items are considered pending during creation
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
              <div className="space-y-3 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 min-h-[44px] min-w-[44px]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl shadow-lg">
                    <ShoppingCart className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight order-heading">
                      Create New Order
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg font-medium order-subtext">Build and manage customer orders with precision</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span>Real-time Pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Secure Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Quality Assurance</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {/* Removed Refresh and Settings buttons */}
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            {/* Order Creation Header */}
            <div className="mb-6">
              <OrderCreationHeader />
            </div>

            {/* Enhanced Tabbed Interface */}
            <Tabs defaultValue="add-items" className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
                <TabsTrigger 
                  value="add-items" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  Add Items
                </TabsTrigger>
                <TabsTrigger 
                  value="manage-items" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  Manage Items
                </TabsTrigger>
                <TabsTrigger 
                  value="discounts" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  Discounts
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  Delivery
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  Payment
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="add-items" className="pt-4">
                  <ItemAdditionInterface />
                </TabsContent>
                <TabsContent value="manage-items" className="pt-4">
                  <OrderItemsTable items={orderItems} onItemsChange={setOrderItems} />
                </TabsContent>
                <TabsContent value="discounts" className="pt-4">
                  <DiscountApplication />
                </TabsContent>
                <TabsContent value="delivery" className="pt-4">
                  <DeliveryMethodSelection />
                </TabsContent>
                <TabsContent value="payment" className="pt-4">
                  <PaymentInterface />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
