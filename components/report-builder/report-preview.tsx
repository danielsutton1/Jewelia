"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "lucide-react"

interface ReportPreviewProps {
  dataSource: string | null
  fields: string[]
  filters: any[]
  groupings: string[]
  calculations: any[]
  layoutType: string
}

export function ReportPreview({
  dataSource,
  fields,
  filters,
  groupings,
  calculations,
  layoutType,
}: ReportPreviewProps) {
  const [previewData, setPreviewData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Generate sample data based on the selected options
  useEffect(() => {
    if (!dataSource || fields.length === 0) {
      setPreviewData([])
      return
    }

    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      // Generate sample data
      const data = generateSampleData(dataSource, fields, filters, groupings, calculations)
      setPreviewData(data)
      setLoading(false)
    }, 500)
  }, [dataSource, fields, filters, groupings, calculations, layoutType])

  const generateSampleData = (
    dataSource: string,
    fields: string[],
    filters: any[],
    groupings: string[],
    calculations: any[],
  ) => {
    // This is a simplified function to generate sample data
    // In a real app, this would be replaced with actual data fetching

    const sampleData = []
    const categories = ["Rings", "Necklaces", "Earrings", "Bracelets", "Watches"]
    const statuses = ["Completed", "Processing", "Cancelled", "Refunded"]
    const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Cash"]

    for (let i = 0; i < 10; i++) {
      const row: Record<string, any> = {
        id: `ROW${i + 1}`,
        order_id: `ORD-${1000 + i}`,
        order_date: new Date(2023, 0, 1 + i).toISOString().split("T")[0],
        customer_id: `CUST-${2000 + i}`,
        customer_name: `Customer ${i + 1}`,
        total_amount: Math.round(100 + Math.random() * 900),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        product_id: `PROD-${3000 + i}`,
        product_name: `${categories[Math.floor(Math.random() * categories.length)]} ${i + 1}`,
        quantity: Math.floor(1 + Math.random() * 5),
        unit_price: Math.round(50 + Math.random() * 450),
        discount: Math.round(Math.random() * 50),
      }

      // Add calculated fields
      calculations.forEach((calc) => {
        if (calc.type === "custom") {
          // Simple implementation for demo purposes
          row[calc.name] = Math.round(Math.random() * 1000)
        } else if (calc.type === "sum") {
          row[calc.name] = row[calc.field] * 1.1 // Just for demo
        } else if (calc.type === "average") {
          row[calc.name] = row[calc.field] / 2 // Just for demo
        } else {
          row[calc.name] = row[calc.field] // Fallback
        }
      })

      sampleData.push(row)
    }

    return sampleData
  }

  const renderTablePreview = () => {
    if (previewData.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">
          No data to display. Select fields and run the report.
        </div>
      )
    }

    // Get all column keys from the first row
    const columns = Object.keys(previewData[0]).filter(
      (key) => key !== "id" && fields.some((field) => field.includes(key)),
    )

    // Add calculated fields
    calculations.forEach((calc) => {
      if (!columns.includes(calc.name)) {
        columns.push(calc.name)
      }
    })

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="whitespace-nowrap">
                  {column.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={`${row.id}-${column}`}>
                    {typeof row[column] === "number"
                      ? row[column].toLocaleString("en-US", {
                          style: column.includes("price") || column.includes("amount") ? "currency" : "decimal",
                          currency: "USD",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : row[column]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const renderChartPreview = () => {
    if (previewData.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">
          No data to display. Select fields and run the report.
        </div>
      )
    }

    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed p-8 text-center">
        {layoutType === "bar" && <BarChart className="h-16 w-16 text-muted-foreground" />}
        {layoutType === "line" && <LineChart className="h-16 w-16 text-muted-foreground" />}
        {layoutType === "pie" && <PieChart className="h-16 w-16 text-muted-foreground" />}
        <div className="ml-4 text-left">
          <h3 className="text-lg font-medium">Chart Preview</h3>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for the {layoutType} chart visualization.
            <br />
            In a real application, this would render an actual chart.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Report Preview</h3>
      </div>

      <Card className="overflow-auto p-4">
        <Tabs defaultValue="data">
          <TabsList>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
          </TabsList>
          <TabsContent value="data" className="mt-4">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              renderTablePreview()
            )}
          </TabsContent>
          <TabsContent value="visualization" className="mt-4">
            {renderChartPreview()}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
