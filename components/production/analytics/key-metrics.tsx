"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"
import { ArrowUpRight, ArrowDownRight, Clock, Target, CheckCircle, TrendingUp, Loader2 } from "lucide-react"

interface ProductionMetrics {
  efficiency: { value: number; change: number; trend: string }
  cycleTime: { value: number; change: number; trend: string }
  qualityPass: { value: number; change: number; trend: string }
  onTimeDelivery: { value: number; change: number; trend: string }
}

export function KeyMetrics({ filters }: { filters: any }) {
  const [data, setData] = useState<ProductionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProductionMetrics()
  }, [filters])

  const fetchProductionMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=production')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch production metrics')
      }
      
      setData(result.data.metrics)
    } catch (err: any) {
      console.error('Error fetching production metrics:', err)
      setError(err.message || 'Failed to load production metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-24 w-24 bg-muted animate-pulse rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl md:col-span-4">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchProductionMetrics}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl md:col-span-4">
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">No production metrics available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metrics = data

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">Overall Efficiency</CardTitle>
          <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg shadow-lg">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-2">{metrics.efficiency.value}%</div>
              <div className="flex items-center gap-2">
                <span className={metrics.efficiency.trend === "up" ? "text-emerald-600 flex items-center text-sm" : "text-red-600 flex items-center text-sm"}>
                  {metrics.efficiency.trend === "up" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {metrics.efficiency.change}%
                </span>
                <span className="text-slate-600 text-sm">from last period</span>
              </div>
            </div>
            <CircularProgress value={metrics.efficiency.value} max={100} size={120} showValue={true} valueSuffix="%" color="#10b981" />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">Avg. Cycle Time</CardTitle>
          <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg shadow-lg">
            <Clock className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-2">{metrics.cycleTime.value} days</div>
              <div className="flex items-center gap-2">
                <span className={metrics.cycleTime.trend === "down" ? "text-emerald-600 flex items-center text-sm" : "text-red-600 flex items-center text-sm"}>
                  {metrics.cycleTime.trend === "down" ? (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(metrics.cycleTime.change)} days
                </span>
                <span className="text-slate-600 text-sm">from last period</span>
              </div>
            </div>
            <CircularProgress value={metrics.cycleTime.value} max={10} size={120} showValue={true} valueSuffix=" days" color="#10b981" />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">Quality Pass Rate</CardTitle>
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg shadow-lg">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-2">{metrics.qualityPass.value}%</div>
              <div className="flex items-center gap-2">
                <span className={metrics.qualityPass.trend === "up" ? "text-emerald-600 flex items-center text-sm" : "text-red-600 flex items-center text-sm"}>
                  {metrics.qualityPass.trend === "up" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {metrics.qualityPass.change}%
                </span>
                <span className="text-slate-600 text-sm">from last period</span>
              </div>
            </div>
            <CircularProgress value={metrics.qualityPass.value} max={100} size={120} showValue={true} valueSuffix="%" color="#10b981" />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">On-Time Delivery</CardTitle>
          <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg shadow-lg">
            <Target className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-2">{metrics.onTimeDelivery.value}%</div>
              <div className="flex items-center gap-2">
                <span className={metrics.onTimeDelivery.trend === "up" ? "text-emerald-600 flex items-center text-sm" : "text-red-600 flex items-center text-sm"}>
                  {metrics.onTimeDelivery.trend === "up" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(metrics.onTimeDelivery.change)}%
                </span>
                <span className="text-slate-600 text-sm">from last period</span>
              </div>
            </div>
            <CircularProgress value={metrics.onTimeDelivery.value} max={100} size={120} showValue={true} valueSuffix="%" color="#10b981" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
