"use client"

import { useState } from "react"
import { CheckInOutInterface } from "@/components/inventory/asset-tracking/check-in-out-interface"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Location, Employee, Asset } from "@/types/inventory"
import { ArrowLeft, Crown, Sparkles, Gem, Shield, Target, Settings, RefreshCw, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon, Clock, CheckCircle, AlertCircle, Package, Users, Building, QrCode, Search, Filter, Download, Upload, Plus, Edit, Trash2, Eye, MoreHorizontal, Calendar, Phone, Mail, MapPin, Star, Heart, TrendingUp, DollarSign, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// --- Mock Data (copy from asset-tracking page) ---
const assetLocations: Location[] = [
  { id: "design_studio", name: "Design Studio", type: "design", category: "internal", priority: "medium" },
  { id: "casting_room", name: "Casting Room", type: "casting", category: "internal", priority: "high" },
  { id: "setting_bench", name: "Setting Bench", type: "setting", category: "internal", priority: "high" },
  { id: "polishing_station", name: "Polishing Station", type: "polishing", category: "internal", priority: "medium" },
  { id: "qc_station", name: "Quality Control", type: "quality_control", category: "internal", priority: "high" },
  { id: "finishing_room", name: "Finishing Room", type: "finishing", category: "internal", priority: "medium" },
  { id: "packaging_area", name: "Packaging Area", type: "packaging", category: "internal", priority: "low" },
  { id: "shipping_dock", name: "Shipping Dock", type: "shipping", category: "internal", priority: "medium" },
  { id: "vault_main", name: "Main Vault", type: "vault", category: "storage" },
  { id: "vault_secondary", name: "Secondary Vault", type: "vault", category: "storage" },
  { id: "showcase_front", name: "Front Showcase", type: "showroom", category: "display" },
  { id: "showcase_back", name: "Back Showcase", type: "showroom", category: "display" },
  { id: "partner_mike", name: "Mike Rodriguez (Gem Setter)", type: "gem_setter", category: "external", priority: "high" },
  { id: "partner_lisa", name: "Lisa Chen (Polisher)", type: "polishing", category: "external", priority: "medium" },
  { id: "partner_david", name: "David Kim (Engraver)", type: "engraver", category: "external", priority: "medium" },
  { id: "partner_sarah", name: "Sarah Wong (Plater)", type: "plater", category: "external", priority: "low" },
  { id: "stone_supplier_abc", name: "ABC Stone Supply", type: "stone_supplier", category: "external", priority: "medium" },
  { id: "repair_shop_xyz", name: "XYZ Repair Shop", type: "repair_shop", category: "external", priority: "high" },
  { id: "consign_luxury", name: "Luxury Consignment Shop", type: "consignment", category: "external" },
  { id: "customer_location", name: "Customer Location", type: "customer_location", category: "external" },
]

const mockEmployees: Employee[] = [
  { id: "emp_01", name: "Sarah Johnson", type: "internal", role: "Jewelry Designer", department: "Design" },
  { id: "emp_02", name: "Michael Chen", type: "internal", role: "Gem Setter", department: "Production" },
  { id: "emp_03", name: "Lisa Wong", type: "internal", role: "Polisher", department: "Production" },
  { id: "emp_04", name: "David Kim", type: "internal", role: "Quality Control", department: "QC" },
  { id: "ext_01", name: "Mike Rodriguez", type: "external", role: "Gem Setter", company: "Rodriguez Jewelry Services", contact: "mike@rodriguezjewelry.com" },
  { id: "ext_02", name: "Lisa Chen", type: "external", role: "Polisher", company: "Chen Polishing Co.", contact: "lisa@chenpolishing.com" },
]

export default function CheckInOutPage() {
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
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Check-In / Check-Out
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Manage asset check-in and check-out for all jewelry inventory in real time</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Secure Asset Management</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="QR Scanner"
                  title="QR Scanner"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            <CheckInOutInterface 
              locations={assetLocations} 
              employees={mockEmployees}
              onCheckIn={() => {}}
              onCheckOut={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 