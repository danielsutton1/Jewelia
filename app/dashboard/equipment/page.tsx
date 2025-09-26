"use client"

import { EquipmentDashboard } from "@/components/equipment/equipment-dashboard"
import { Crown, Sparkles, Gem, RefreshCw, ArrowLeft, TrendingUp, CheckCircle, AlertCircle, Users, Calendar, DollarSign, Download, Wrench, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface EquipmentStats {
  totalEquipment: number
  operationalEquipment: number
  maintenanceDue: number
  bookedEquipment: number
  totalValue: number
  monthlyMaintenanceCost: number
  suppliers: number
  criticalIssues: number
}

export default function EquipmentPage() {
  const router = useRouter()
  const [equipmentStats, setEquipmentStats] = useState<EquipmentStats>({
    totalEquipment: 0,
    operationalEquipment: 0,
    maintenanceDue: 0,
    bookedEquipment: 0,
    totalValue: 0,
    monthlyMaintenanceCost: 0,
    suppliers: 0,
    criticalIssues: 0
  })

  useEffect(() => {
    // Simulate loading equipment statistics
    setEquipmentStats({
      totalEquipment: 89,
      operationalEquipment: 76,
      maintenanceDue: 8,
      bookedEquipment: 12,
      totalValue: 450000,
      monthlyMaintenanceCost: 8500,
      suppliers: 8,
      criticalIssues: 2
    })
  }, [])

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
          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Wrench className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight equipment-heading">
                      Equipment Management
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium equipment-subtext">Track, maintain, and book equipment for jewelry production</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>Advanced Maintenance Tracking</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Real-time Equipment Status</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3 items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                  aria-label="Export"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards - Matching Dashboard Style */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4">
            <div className="w-full overflow-x-auto md:overflow-visible">
              <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
                {/* Total Equipment */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Wrench className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Equipment</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Equipment
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {equipmentStats.totalEquipment}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>{equipmentStats.operationalEquipment} operational</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total equipment in inventory
                    </p>
                  </CardContent>
                </Card>
                
                {/* Maintenance Due */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Maintenance Due</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Maintenance
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {equipmentStats.maintenanceDue}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>{equipmentStats.criticalIssues} critical issues</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Equipment requiring maintenance
                    </p>
                  </CardContent>
                </Card>
                
                {/* Equipment Value */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Equipment Value</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Financial
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        ${(equipmentStats.totalValue / 1000).toFixed(0)}k
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>${equipmentStats.monthlyMaintenanceCost.toLocaleString()} monthly maintenance</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total value of all equipment
                    </p>
                  </CardContent>
                </Card>
                
                {/* Booked Equipment */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Booked Equipment</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Operations
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {equipmentStats.bookedEquipment}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Users className="h-3 w-3" />
                        <span>{equipmentStats.suppliers} service providers</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Equipment currently booked
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 md:p-8">
            <EquipmentDashboard />
          </div>
        </div>
      </div>
    </div>
  )
}
