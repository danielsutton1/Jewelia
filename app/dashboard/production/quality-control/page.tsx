"use client"

import { QualityControlDashboard } from "@/components/production/quality-control/quality-control-dashboard"
import { Crown, Sparkles, Gem, RefreshCw, ArrowLeft, TrendingUp, Clock, CheckCircle, AlertCircle, Users, Calendar, Download, Shield, AlertTriangle, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface QualityControlStats {
  todayInspections: number
  passedToday: number
  failedToday: number
  pendingInspections: number
  weeklyEfficiency: number
  averageInspectionTime: number
  totalInspectors: number
  criticalIssues: number
}

export default function QualityControlPage() {
  const router = useRouter()
  const [qualityStats, setQualityStats] = useState<QualityControlStats>({
    todayInspections: 0,
    passedToday: 0,
    failedToday: 0,
    pendingInspections: 0,
    weeklyEfficiency: 0,
    averageInspectionTime: 0,
    totalInspectors: 0,
    criticalIssues: 0
  })

  useEffect(() => {
    // Simulate loading quality control statistics
    setQualityStats({
      todayInspections: 24,
      passedToday: 21,
      failedToday: 2,
      pendingInspections: 1,
      weeklyEfficiency: 91.0,
      averageInspectionTime: 14.8,
      totalInspectors: 8,
      criticalIssues: 3
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
          <div className="relative p-4 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
              <div className="space-y-3 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight qc-heading">
                      Quality Control
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg font-medium qc-subtext">Inspect and verify jewelry quality before delivery</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Advanced Quality Standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Real-time Inspection Tracking</span>
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
                {/* Today's Inspections */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Today's Inspections</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Quality
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {qualityStats.todayInspections}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{qualityStats.weeklyEfficiency}% pass rate</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total inspections completed today
                    </p>
                  </CardContent>
                </Card>
                
                {/* Passed Today */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Passed Today</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Quality
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {qualityStats.passedToday}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Clock className="h-3 w-3" />
                        <span>{qualityStats.averageInspectionTime}min avg time</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Inspections that passed quality standards
                    </p>
                  </CardContent>
                </Card>
                
                {/* Pending Inspections */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Pending Inspections</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Operations
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {qualityStats.pendingInspections}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Users className="h-3 w-3" />
                        <span>{qualityStats.totalInspectors} inspectors</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Inspections awaiting review
                    </p>
                  </CardContent>
                </Card>
                
                {/* Failed Today */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Failed Today</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Quality
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {qualityStats.failedToday}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>{qualityStats.criticalIssues} critical issues</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Inspections that failed quality standards
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
          <div className="relative p-4 sm:p-8">
            <QualityControlDashboard />
          </div>
        </div>
      </div>
    </div>
  )
}
