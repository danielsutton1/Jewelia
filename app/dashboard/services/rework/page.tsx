"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReworkLogging } from "@/components/rework/rework-logging"
import { TrackingDashboard } from "@/components/rework/tracking-dashboard"
import { ProcessImprovement } from "@/components/rework/process-improvement"
import { CustomerNotification } from "@/components/rework/customer-notification"
import { Crown, Sparkles, Gem, RefreshCw, ArrowLeft, TrendingUp, Clock, CheckCircle, AlertCircle, Target, BarChart3, Plus, Users, Calendar, Star, Heart, DollarSign, ShoppingBag, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon, Download, Upload, Eye, Edit, Trash2, Folder, File, Search, Filter, Wrench, Cog, Activity, Shield, AlertTriangle, Package, Truck, Scale, Factory, Building, Hammer, Drill, Compass, Ruler, Microscope, Thermometer, Gauge, Battery, Power, Lightbulb, Monitor, Printer, Camera, Phone, Tablet, Laptop, Server, Router, Cable, Plug, Keyboard, Mouse, Headphones, Speaker, Webcam, Projector, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface ReworkStats {
  totalReworks: number
  openReworks: number
  resolvedReworks: number
  inProgressReworks: number
  totalCost: number
  averageResolutionTime: number
  qualityScore: number
  improvementRate: number
}

export default function ReworkTrackingPage() {
  const router = useRouter()
  const [reworkStats, setReworkStats] = useState<ReworkStats>({
    totalReworks: 0,
    openReworks: 0,
    resolvedReworks: 0,
    inProgressReworks: 0,
    totalCost: 0,
    averageResolutionTime: 0,
    qualityScore: 0,
    improvementRate: 0
  })

  useEffect(() => {
    // Simulate loading rework statistics
    setReworkStats({
      totalReworks: 156,
      openReworks: 23,
      resolvedReworks: 98,
      inProgressReworks: 35,
      totalCost: 45200,
      averageResolutionTime: 2.8,
      qualityScore: 94.2,
      improvementRate: 12.5
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
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <RefreshCw className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Rework Tracking & Management
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Log, track, and analyze rework issues to improve production quality and efficiency</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Quality Improvement Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Process Optimization</span>
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
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Wrench className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Reworks</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Quality Control
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {reworkStats.totalReworks}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>{reworkStats.resolvedReworks} resolved</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total rework orders in system
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Open Reworks</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            In Progress
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {reworkStats.openReworks}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="h-3 w-3" />
                        <span>{reworkStats.inProgressReworks} in progress</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Currently open rework orders
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Quality Score</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Performance
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {reworkStats.qualityScore}%
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{reworkStats.improvementRate}% improvement</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Overall quality performance score
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Cost</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Financial
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        ${(reworkStats.totalCost / 1000).toFixed(1)}k
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <Clock className="h-3 w-3" />
                        <span>{reworkStats.averageResolutionTime} days avg resolution</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total cost of rework operations
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
          <div className="relative p-8">
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="logging" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  Rework Logging
                </TabsTrigger>
                <TabsTrigger 
                  value="improvement" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  Process Improvement
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  Customer Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-4">
                <TrackingDashboard />
              </TabsContent>

              <TabsContent value="logging" className="space-y-4">
                <ReworkLogging />
              </TabsContent>

              <TabsContent value="improvement" className="space-y-4">
                <ProcessImprovement />
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <CustomerNotification />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 
 