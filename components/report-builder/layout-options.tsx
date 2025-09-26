"use client"

import { Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LayoutOptionsProps {
  layoutType: string
  onSelectLayoutType: (type: string) => void
}

export function LayoutOptions({ layoutType, onSelectLayoutType }: LayoutOptionsProps) {
  const tableLayouts = [
    {
      id: "table",
      name: "Standard Table",
      description: "Simple tabular format with rows and columns",
      icon: (
        <div className="flex flex-col space-y-1">
          <div className="h-1 w-full rounded-sm bg-primary/70"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
        </div>
      ),
    },
    {
      id: "pivot",
      name: "Pivot Table",
      description: "Cross-tabulation with row and column dimensions",
      icon: (
        <div className="grid grid-cols-3 gap-1">
          <div className="h-1 w-full rounded-sm bg-primary/70"></div>
          <div className="h-1 w-full rounded-sm bg-primary/70"></div>
          <div className="h-1 w-full rounded-sm bg-primary/70"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
        </div>
      ),
    },
    {
      id: "crosstab",
      name: "Cross Tab",
      description: "Matrix view with summarized data",
      icon: (
        <div className="grid grid-cols-3 gap-1">
          <div className="h-1 w-full rounded-sm bg-primary/70"></div>
          <div className="h-1 w-full rounded-sm bg-primary/50"></div>
          <div className="h-1 w-full rounded-sm bg-primary/50"></div>
          <div className="h-1 w-full rounded-sm bg-primary/50"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-primary/50"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
        </div>
      ),
    },
    {
      id: "summary",
      name: "Summary Table",
      description: "Aggregated data with subtotals and totals",
      icon: (
        <div className="flex flex-col space-y-1">
          <div className="h-1 w-full rounded-sm bg-primary/70"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-muted"></div>
          <div className="h-1 w-full rounded-sm bg-primary/50"></div>
        </div>
      ),
    },
  ]

  const chartLayouts = [
    {
      id: "bar",
      name: "Bar Chart",
      description: "Vertical bars for comparing categories",
      icon: (
        <div className="flex h-6 items-end space-x-1">
          <div className="h-3 w-2 rounded-sm bg-primary"></div>
          <div className="h-5 w-2 rounded-sm bg-primary"></div>
          <div className="h-2 w-2 rounded-sm bg-primary"></div>
          <div className="h-4 w-2 rounded-sm bg-primary"></div>
          <div className="h-6 w-2 rounded-sm bg-primary"></div>
        </div>
      ),
    },
    {
      id: "line",
      name: "Line Chart",
      description: "Connected points showing trends over time",
      icon: (
        <div className="relative h-6 w-full">
          <div className="absolute bottom-0 left-0 h-1 w-full rounded-sm bg-muted"></div>
          <svg viewBox="0 0 100 30" className="h-6 w-full" strokeWidth="3" stroke="hsl(var(--primary))" fill="none">
            <path d="M0,30 L20,15 L40,20 L60,5 L80,10 L100,0" />
          </svg>
        </div>
      ),
    },
    {
      id: "pie",
      name: "Pie Chart",
      description: "Circular chart showing proportions of a whole",
      icon: (
        <div className="relative h-6 w-full">
          <svg viewBox="0 0 32 32" className="h-6 w-6">
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              strokeDasharray="75 25"
              transform="rotate(-90 16 16)"
            />
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeDasharray="25 75"
              transform="rotate(-90 16 16)"
            />
          </svg>
        </div>
      ),
    },
    {
      id: "area",
      name: "Area Chart",
      description: "Filled line chart showing volume over time",
      icon: (
        <div className="relative h-6 w-full">
          <div className="absolute bottom-0 left-0 h-1 w-full rounded-sm bg-muted"></div>
          <svg viewBox="0 0 100 30" className="h-6 w-full">
            <path d="M0,30 L20,15 L40,20 L60,5 L80,10 L100,0 V30 H0 Z" fill="hsl(var(--primary))" opacity="0.2" />
            <path
              d="M0,30 L20,15 L40,20 L60,5 L80,10 L100,0"
              stroke="hsl(var(--primary))"
              fill="none"
              strokeWidth="2"
            />
          </svg>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Layout Options</h3>
      <Tabs defaultValue="table">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Table Formats</TabsTrigger>
          <TabsTrigger value="chart">Chart Types</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {tableLayouts.map((layout) => (
              <Card
                key={layout.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  layoutType === layout.id && "border-primary bg-muted/50",
                )}
                onClick={() => onSelectLayoutType(layout.id)}
              >
                <CardContent className="p-4">
                  <div className="relative flex h-12 items-center justify-center">
                    {layout.icon}
                    {layoutType === layout.id && (
                      <div className="absolute -right-2 -top-2 rounded-full bg-primary p-0.5 text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <h4 className="text-sm font-medium">{layout.name}</h4>
                    <p className="text-xs text-muted-foreground">{layout.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="chart" className="mt-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {chartLayouts.map((layout) => (
              <Card
                key={layout.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  layoutType === layout.id && "border-primary bg-muted/50",
                )}
                onClick={() => onSelectLayoutType(layout.id)}
              >
                <CardContent className="p-4">
                  <div className="relative flex h-12 items-center justify-center">
                    {layout.icon}
                    {layoutType === layout.id && (
                      <div className="absolute -right-2 -top-2 rounded-full bg-primary p-0.5 text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <h4 className="text-sm font-medium">{layout.name}</h4>
                    <p className="text-xs text-muted-foreground">{layout.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
