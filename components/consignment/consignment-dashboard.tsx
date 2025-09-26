"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConsignorManagement } from "./consignor-management"
import { ConsignedItems } from "./consigned-items"
import { ConsignmentReports } from "./consignment-reports"
import { AgreementTemplates } from "./agreement-templates"
import { ConsignmentOverview } from "./consignment-overview"
import { Package, Users, FileText, BarChart3, Settings } from "lucide-react"

export function ConsignmentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Package className="h-4 w-4 text-white" />
          </div>
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="consignors" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Users className="h-4 w-4 text-white" />
          </div>
          Consignors
        </TabsTrigger>
        <TabsTrigger 
          value="items" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Package className="h-4 w-4 text-white" />
          </div>
          Items
        </TabsTrigger>
        <TabsTrigger 
          value="reports" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          Reports
        </TabsTrigger>
        <TabsTrigger 
          value="templates" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <FileText className="h-4 w-4 text-white" />
          </div>
          Agreements
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <ConsignmentOverview />
        </div>
      </TabsContent>

      <TabsContent value="consignors" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <ConsignorManagement />
        </div>
      </TabsContent>

      <TabsContent value="items" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <ConsignedItems />
        </div>
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <ConsignmentReports />
        </div>
      </TabsContent>

      <TabsContent value="templates" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <AgreementTemplates />
        </div>
      </TabsContent>
    </Tabs>
  )
}
