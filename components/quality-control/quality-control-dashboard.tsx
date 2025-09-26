"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export function QualityControlDashboard() {
  return (
    <div className="flex overflow-x-auto gap-4 pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-x-visible">
      <Card className="flex-shrink-0 w-80 md:w-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium quality-card-title">Pending Inspections</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold quality-card-number">24</div>
              <p className="text-xs text-muted-foreground">+3 since yesterday</p>
            </div>
            <div className="h-12 w-12">
              <CircularProgress value={65} max={100} size={48} strokeWidth={10} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-shrink-0 w-80 md:w-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium quality-card-title">Pass Rate (30d)</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold quality-card-number">92.4%</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+2.1%</span> from last month
              </p>
            </div>
            <div className="h-12 w-12">
              <CircularProgress value={92.4} max={100} size={48} strokeWidth={10} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-shrink-0 w-80 md:w-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium quality-card-title">Rejection Rate (30d)</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold quality-card-number">7.6%</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-red-500">-2.1%</span> from last month
              </p>
            </div>
            <div className="h-12 w-12">
              <CircularProgress value={7.6} max={100} size={48} strokeWidth={10} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-shrink-0 w-80 md:w-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium quality-card-title">Open Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold quality-card-number">12</div>
              <p className="text-xs text-muted-foreground">5 high priority</p>
            </div>
            <div className="h-12 w-12">
              <CircularProgress value={40} max={100} size={48} strokeWidth={10} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
