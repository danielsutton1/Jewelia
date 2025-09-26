"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, TrendingUp, Repeat, Users } from "lucide-react"

export function EfficiencyMetricsOverview({ filters, isRealTime }: { filters: any, isRealTime: any }) {
  // In a real implementation, these would be calculated based on the filters
  // and potentially updated in real-time if isRealTime is true
  const metrics = {
    throughputRate: {
      value: 24,
      unit: "units/day",
      change: 3,
      trend: "up",
    },
    cycleTime: {
      value: 4.2,
      unit: "days",
      change: -0.8,
      trend: "down",
    },
    resourceUtilization: {
      value: 78,
      unit: "%",
      change: 5,
      trend: "up",
    },
    qualityPassRate: {
      value: 92,
      unit: "%",
      change: 3,
      trend: "up",
    },
    reworkFrequency: {
      value: 8,
      unit: "%",
      change: -2,
      trend: "down",
    },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {/* Throughput Rate */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">Throughput Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {metrics.throughputRate.value} {metrics.throughputRate.unit}
              </div>
              <p className="text-xs text-slate-500">
                <span className={metrics.throughputRate.trend === "up" ? "text-emerald-600" : "text-red-600"}>
                  {metrics.throughputRate.trend === "up" ? (
                    <ArrowUpRight className="mr-1 inline h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 inline h-3 w-3" />
                  )}
                  {metrics.throughputRate.change} {metrics.throughputRate.unit}
                </span>{" "}
                from last period
              </p>
            </div>
            <CircularProgress value={75} max={30} size={60} color="#10b981" />
          </div>
        </CardContent>
      </Card>

      {/* Avg. Cycle Time */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">Avg. Cycle Time</CardTitle>
          <Clock className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {metrics.cycleTime.value} {metrics.cycleTime.unit}
              </div>
              <p className="text-xs text-slate-500">
                <span className={metrics.cycleTime.trend === "down" ? "text-emerald-600" : "text-red-600"}>
                  {metrics.cycleTime.trend === "down" ? (
                    <ArrowDownRight className="mr-1 inline h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="mr-1 inline h-3 w-3" />
                  )}
                  {Math.abs(metrics.cycleTime.change)} {metrics.cycleTime.unit}
                </span>{" "}
                from last period
              </p>
            </div>
            <CircularProgress value={70} max={10} size={60} color="#6366f1" />
          </div>
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">Resource Utilization</CardTitle>
          <Users className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {metrics.resourceUtilization.value}{metrics.resourceUtilization.unit}
              </div>
              <p className="text-xs text-slate-500">
                <span className={metrics.resourceUtilization.trend === "up" ? "text-emerald-600" : "text-red-600"}>
                  {metrics.resourceUtilization.trend === "up" ? (
                    <ArrowUpRight className="mr-1 inline h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 inline h-3 w-3" />
                  )}
                  {metrics.resourceUtilization.change}{metrics.resourceUtilization.unit}
                </span>{" "}
                from last period
              </p>
            </div>
            <CircularProgress value={metrics.resourceUtilization.value} max={100} size={60} color="#10b981" />
          </div>
        </CardContent>
      </Card>

      {/* Quality Pass Rate */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">Quality Pass Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {metrics.qualityPassRate.value}{metrics.qualityPassRate.unit}
              </div>
              <p className="text-xs text-slate-500">
                <span className={metrics.qualityPassRate.trend === "up" ? "text-emerald-600" : "text-red-600"}>
                  {metrics.qualityPassRate.trend === "up" ? (
                    <ArrowUpRight className="mr-1 inline h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 inline h-3 w-3" />
                  )}
                  {metrics.qualityPassRate.change}{metrics.qualityPassRate.unit}
                </span>{" "}
                from last period
              </p>
            </div>
            <CircularProgress value={metrics.qualityPassRate.value} max={100} size={60} color="#10b981" />
          </div>
        </CardContent>
      </Card>

      {/* Rework Frequency */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-700">Rework Frequency</CardTitle>
          <Repeat className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {metrics.reworkFrequency.value}{metrics.reworkFrequency.unit}
              </div>
              <p className="text-xs text-slate-500">
                <span className={metrics.reworkFrequency.trend === "down" ? "text-emerald-600" : "text-red-600"}>
                  {metrics.reworkFrequency.trend === "down" ? (
                    <ArrowDownRight className="mr-1 inline h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="mr-1 inline h-3 w-3" />
                  )}
                  {Math.abs(metrics.reworkFrequency.change)}{metrics.reworkFrequency.unit}
                </span>{" "}
                from last period
              </p>
            </div>
            <CircularProgress value={100 - metrics.reworkFrequency.value} max={100} size={60} color="#ef4444" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
