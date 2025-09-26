"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Sample data sources
const dataSources = [
  {
    id: "sales",
    name: "Sales",
    description: "Sales transactions and order data",
    tables: ["orders", "order_items", "payments"],
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Product inventory and stock levels",
    tables: ["products", "categories", "stock_levels"],
  },
  {
    id: "customers",
    name: "Customers",
    description: "Customer information and profiles",
    tables: ["customers", "segments", "addresses"],
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Marketing campaigns and performance",
    tables: ["campaigns", "channel_performance", "promotions"],
  },
  {
    id: "finance",
    name: "Finance",
    description: "Financial transactions and accounting",
    tables: ["transactions", "accounts", "expenses"],
  },
]

interface DataSourceSelectorProps {
  selectedDataSource: string | null
  onSelectDataSource: (dataSource: string) => void
}

export function DataSourceSelector({ selectedDataSource, onSelectDataSource }: DataSourceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDataSources = dataSources.filter((source) =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search data sources..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        {filteredDataSources.map((source) => (
          <Card
            key={source.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedDataSource === source.id ? "border-primary bg-muted/50" : ""
            }`}
            onClick={() => onSelectDataSource(source.id)}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{source.name}</CardTitle>
              <CardDescription>{source.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-1">
                {source.tables.map((table) => (
                  <span key={table} className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                    {table}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
