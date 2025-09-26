"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, RefreshCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

const metalPrices = [
  {
    name: "Gold",
    price: 2347.8,
    change: 12.5,
    changePercent: 0.53,
    trend: "up",
    unit: "oz",
    symbol: "XAU",
  },
  {
    name: "Silver",
    price: 27.65,
    change: 0.32,
    changePercent: 1.17,
    trend: "up",
    unit: "oz",
    symbol: "XAG",
  },
  {
    name: "Platinum",
    price: 938.2,
    change: -4.75,
    changePercent: -0.5,
    trend: "down",
    unit: "oz",
    symbol: "XPT",
  },
  {
    name: "Palladium",
    price: 1012.4,
    change: -8.3,
    changePercent: -0.81,
    trend: "down",
    unit: "oz",
    symbol: "XPD",
  },
  {
    name: "Rhodium",
    price: 5250.0,
    change: 125.0,
    changePercent: 2.44,
    trend: "up",
    unit: "oz",
    symbol: "XRH",
  },
]

export function MetalPrices() {
  const [lastUpdated, setLastUpdated] = useState("2 minutes ago")
  const [activeTab, setActiveTab] = useState("live")

  const handleRefresh = () => {
    setLastUpdated("Just now")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Precious Metal Prices</CardTitle>
          <CardDescription>Live market prices for precious metals</CardDescription>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[180px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metalPrices.map((metal) => (
            <div key={metal.name} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    metal.name === "Gold"
                      ? "bg-amber-100 text-amber-600"
                      : metal.name === "Silver"
                        ? "bg-slate-100 text-slate-600"
                        : metal.name === "Platinum"
                          ? "bg-blue-100 text-blue-600"
                          : metal.name === "Palladium"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-red-100 text-red-600"
                  }`}
                >
                  {metal.symbol}
                </div>
                <div>
                  <p className="font-medium">{metal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {metal.symbol}/{metal.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${metal.price.toFixed(2)}</p>
                <div
                  className={`flex items-center justify-end text-xs ${
                    metal.trend === "up" ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {metal.trend === "up" ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                  <span>
                    ${Math.abs(metal.change).toFixed(2)} ({Math.abs(metal.changePercent).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1">
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    </Card>
  )
}
