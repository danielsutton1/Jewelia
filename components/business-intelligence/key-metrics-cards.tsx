"use client"

import { cn } from "@/lib/utils"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, DollarSign, Package, Users, Percent } from "lucide-react"

interface KeyMetricsCardsProps {
  dateRange: DateRange
  showComparison: boolean
}

export function KeyMetricsCards({ dateRange, showComparison }: KeyMetricsCardsProps) {
  // In a real app, this data would come from an API call
  const metrics = [
    {
      title: "Revenue",
      value: "$128,430",
      change: 12.5,
      icon: DollarSign,
    },
    {
      title: "Units Sold",
      value: "1,842",
      change: 8.2,
      icon: Package,
    },
    {
      title: "Profit Margin",
      value: "42.8%",
      change: -2.1,
      icon: Percent,
    },
    {
      title: "New Customers",
      value: "385",
      change: 15.3,
      icon: Users,
    },
  ]

  return (
    <div className="w-full overflow-x-auto md:overflow-visible">
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-[800px] md:min-w-0 flex-nowrap">
        {metrics.map((metric) => (
          <Card key={metric.title} className="flex-shrink-0 w-80 md:w-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium business-metrics-title">{metric.title}</CardTitle>
              <metric.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold business-metrics-number">{metric.value}</div>
              {showComparison && (
                <p className="text-xs text-muted-foreground">
                  <span className={cn("flex items-center", metric.change > 0 ? "text-emerald-500" : "text-destructive")}>
                    {metric.change > 0 ? <ArrowUp className="mr-1 h-2 w-2 sm:h-3 sm:w-3" /> : <ArrowDown className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />}
                    {Math.abs(metric.change)}%
                  </span>{" "}
                  from previous period
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
