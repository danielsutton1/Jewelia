"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PassFailRates } from "./pass-fail-rates"
import { DefectCategories } from "./defect-categories"
import { TrendAnalysis } from "./trend-analysis"
import { PartnerRankings } from "./partner-rankings"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

export function QualityMetricsDashboard() {
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight quality-metrics-heading">Quality Metrics</h2>
          <p className="text-muted-foreground quality-metrics-subtext">Monitor quality performance and identify improvement opportunities</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DateRangePicker />
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-1 min-h-[44px]">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-x-visible">
        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="pb-2">
            <CardDescription>Overall Pass Rate</CardDescription>
            <CardTitle className="text-3xl quality-metrics-number">87.4%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>
        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="pb-2">
            <CardDescription>Total Inspections</CardDescription>
            <CardTitle className="text-3xl quality-metrics-number">1,284</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+156 from last month</p>
          </CardContent>
        </Card>
        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="pb-2">
            <CardDescription>Open Issues</CardDescription>
            <CardTitle className="text-3xl quality-metrics-number">42</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">-8 from last month</p>
          </CardContent>
        </Card>
        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="pb-2">
            <CardDescription>Avg. Resolution Time</CardDescription>
            <CardTitle className="text-3xl quality-metrics-number">3.2 days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">-0.5 days from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pass-fail">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto">
          <TabsTrigger value="pass-fail">Pass/Fail Rates</TabsTrigger>
          <TabsTrigger value="defects">Defect Categories</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="partners">Partner Rankings</TabsTrigger>
        </TabsList>
        <TabsContent value="pass-fail" className="mt-6">
          <PassFailRates />
        </TabsContent>
        <TabsContent value="defects" className="mt-6">
          <DefectCategories />
        </TabsContent>
        <TabsContent value="trends" className="mt-6">
          <TrendAnalysis />
        </TabsContent>
        <TabsContent value="partners" className="mt-6">
          <PartnerRankings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
