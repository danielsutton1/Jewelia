"use client"

import { BatchProductionDashboard } from "@/components/production/batches/batch-production-dashboard"
import { Suspense } from "react"
import { Crown, Sparkles, Gem, Factory, Package, Settings, RefreshCw, ArrowLeft, TrendingUp, Clock, CheckCircle, AlertCircle, Target, BarChart3, Plus, Users, Calendar, Star, Heart, DollarSign, ShoppingBag, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function BatchProductionPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
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
          <div className="relative p-4 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
              <div className="space-y-3 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Factory className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight batches-heading">
                      Batch Production
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg font-medium batches-subtext">Group similar items for efficient production</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Advanced Production Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Real-time Batch Tracking</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-center w-full md:w-auto justify-end">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-8">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <div className="text-slate-600 text-lg">Loading batches...</div>
              </div>
            }>
              <BatchProductionDashboard />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
