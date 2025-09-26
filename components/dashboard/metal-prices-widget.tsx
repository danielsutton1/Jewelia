"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkline } from "@/components/ui/sparkline"
import { cn } from "@/lib/utils"

// Sample data for the sparklines (would be fetched from an API in a real app)
const generateSparklineData = (baseValue: number, volatility: number, length = 24) => {
  const data = []
  let value = baseValue
  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.5) * volatility
    data.push(value)
  }
  return data
}

// Sample metal data
const initialMetalData = [
  {
    id: "gold",
    name: "Gold",
    price: 2347.8,
    previousPrice: 2335.3,
    symbol: "XAU",
    color: "#FFD700",
    sparklineData: generateSparklineData(2335, 10),
  },
  {
    id: "silver",
    name: "Silver",
    price: 27.65,
    previousPrice: 27.33,
    symbol: "XAG",
    color: "#C0C0C0",
    sparklineData: generateSparklineData(27.3, 0.3),
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 938.2,
    previousPrice: 942.95,
    symbol: "XPT",
    color: "#E5E4E2",
    sparklineData: generateSparklineData(943, 5),
  },
]

export function MetalPricesWidget() {
  const [metalData, setMetalData] = useState(initialMetalData)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Function to simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const updatedData = metalData.map((metal) => {
        const priceChange = metal.price * (Math.random() * 0.01 - 0.005)
        const newPrice = metal.price + priceChange
        const newSparklineData = [...metal.sparklineData.slice(1), newPrice]
        return {
          ...metal,
          previousPrice: metal.price,
          price: newPrice,
          sparklineData: newSparklineData,
        }
      })
      setMetalData(updatedData)
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1200)
  }

  useEffect(() => {
    if (!autoRefresh) return
    const intervalId = setInterval(() => {
      refreshData()
    }, 60000)
    return () => clearInterval(intervalId)
  }, [autoRefresh, metalData])

  const formatLastUpdated = () => {
    const now = new Date()
    const diffMs = now.getTime() - lastUpdated.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins === 1) return "1 minute ago"
    if (diffMins < 60) return `${diffMins} minutes ago`
    const hours = lastUpdated.getHours().toString().padStart(2, "0")
    const minutes = lastUpdated.getMinutes().toString().padStart(2, "0")
    return `Today at ${hours}:${minutes}`
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="flex flex-row gap-2 w-full items-center py-1 px-2 bg-transparent overflow-x-auto whitespace-nowrap">
      {metalData.map((metal) => {
        const change = calculateChange(metal.price, metal.previousPrice)
        const isPositive = change >= 0
        return (
          <div
            key={metal.id}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1 bg-white/80 text-xs font-medium shadow-sm mr-2 min-w-[170px] max-w-[220px]"
            style={{}}
          >
            <span className="font-semibold mr-1" style={{ color: metal.color === "#C0C0C0" || metal.color === "#E5E4E2" ? "#757575" : metal.color }}>{metal.name}</span>
            <span className="mr-1">${formatPrice(metal.price)}</span>
            <span className={cn("flex items-center font-semibold px-2 py-0.5 rounded-full", isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}
              style={{ minWidth: 56, justifyContent: 'center' }}>
              {isPositive ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
              {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        )
      })}
      <button
        onClick={refreshData}
        disabled={isRefreshing}
        className="group rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ml-2"
        aria-label="Refresh prices"
        style={{ alignSelf: 'center' }}
      >
        <RefreshCw className={cn("h-4 w-4 transition-transform", isRefreshing && "animate-spin")} />
      </button>
      <span className="ml-2 text-xs text-muted-foreground min-w-[90px]">{formatLastUpdated()}</span>
    </div>
  )
}
