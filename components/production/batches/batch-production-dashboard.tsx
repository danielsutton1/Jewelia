"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BatchCreation } from "./batch-creation"
import { BatchTracking } from "./batch-tracking"
import { BatchAnalytics } from "./batch-analytics"
import { useSearchParams, useRouter } from "next/navigation"
import { Package, Plus, BarChart3, Target, Clock, CheckCircle, AlertCircle, TrendingUp, Factory, Settings, RefreshCw, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon, Users, Calendar, Star, Heart, DollarSign, ShoppingBag } from "lucide-react"

export function BatchProductionDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "active-batches");

  // Keep tab in sync with URL param if it changes
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/production/batches?tab=${tab}`);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} defaultValue="active-batches" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
          <TabsTrigger 
            value="active-batches" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
              <Package className="h-4 w-4 text-white" />
            </div>
            Active Batches
          </TabsTrigger>
          <TabsTrigger 
            value="create-batch" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Create Batch
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active-batches" className="mt-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
            <BatchTracking />
          </div>
        </TabsContent>
        <TabsContent value="create-batch" className="mt-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
            <BatchCreation />
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
            <BatchAnalytics />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
