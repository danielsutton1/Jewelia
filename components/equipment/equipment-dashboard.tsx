"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EquipmentList } from "./equipment-list"
import { MaintenanceSchedule } from "./maintenance-schedule"
import { EquipmentBooking } from "./equipment-booking"
import { MaintenanceHistory } from "./maintenance-history"
import { PartsInventory } from "./parts-inventory"
import { EquipmentAnalytics } from "./equipment-analytics"
import { Wrench, Calendar, Clock, History, Package, BarChart3 } from "lucide-react"

export function EquipmentDashboard() {
  const [activeTab, setActiveTab] = useState("equipment")

  return (
    <Tabs defaultValue="equipment" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
        <TabsTrigger 
          value="equipment" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          Equipment
        </TabsTrigger>
        <TabsTrigger 
          value="maintenance" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Clock className="h-4 w-4 text-white" />
          </div>
          Maintenance
        </TabsTrigger>
        <TabsTrigger 
          value="booking" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          Booking
        </TabsTrigger>
        <TabsTrigger 
          value="history" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <History className="h-4 w-4 text-white" />
          </div>
          History
        </TabsTrigger>
        <TabsTrigger 
          value="parts" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Package className="h-4 w-4 text-white" />
          </div>
          Parts
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

      <TabsContent value="equipment" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <EquipmentList />
        </div>
      </TabsContent>

      <TabsContent value="maintenance" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <MaintenanceSchedule />
        </div>
      </TabsContent>

      <TabsContent value="booking" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <EquipmentBooking />
        </div>
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <MaintenanceHistory />
        </div>
      </TabsContent>

      <TabsContent value="parts" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <PartsInventory />
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <EquipmentAnalytics />
        </div>
      </TabsContent>
    </Tabs>
  )
}
