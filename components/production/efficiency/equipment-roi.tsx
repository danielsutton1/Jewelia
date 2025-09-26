"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function EquipmentROI({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const equipmentROIData = [
    {
      equipment: "Laser Welder",
      initialCost: 25000,
      annualSavings: 12000,
      paybackPeriod: 2.1,
      roi: 48,
      status: "Excellent",
    },
    {
      equipment: "CAD Workstation",
      initialCost: 8000,
      annualSavings: 3500,
      paybackPeriod: 2.3,
      roi: 44,
      status: "Excellent",
    },
    {
      equipment: "Stone Setting Microscope",
      initialCost: 12000,
      annualSavings: 4800,
      paybackPeriod: 2.5,
      roi: 40,
      status: "Good",
    },
    {
      equipment: "Casting Machine",
      initialCost: 35000,
      annualSavings: 11000,
      paybackPeriod: 3.2,
      roi: 31,
      status: "Good",
    },
    {
      equipment: "Polishing System",
      initialCost: 15000,
      annualSavings: 4000,
      paybackPeriod: 3.8,
      roi: 27,
      status: "Fair",
    },
  ]

  const proposedEquipmentData = [
    {
      equipment: "3D Printer (Resin)",
      initialCost: 18000,
      projectedSavings: 7500,
      paybackPeriod: 2.4,
      projectedROI: 42,
      recommendation: "Recommended",
    },
    {
      equipment: "Automated Stone Setter",
      initialCost: 45000,
      projectedSavings: 22000,
      paybackPeriod: 2.0,
      projectedROI: 49,
      recommendation: "Highly Recommended",
    },
    {
      equipment: "Ultrasonic Cleaner (Industrial)",
      initialCost: 9000,
      projectedSavings: 3000,
      paybackPeriod: 3.0,
      projectedROI: 33,
      recommendation: "Consider",
    },
  ]

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800"
      case "Good":
        return "bg-blue-100 text-blue-800"
      case "Fair":
        return "bg-amber-100 text-amber-800"
      case "Poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRecommendationColor = (recommendation: any) => {
    switch (recommendation) {
      case "Highly Recommended":
        return "bg-green-100 text-green-800"
      case "Recommended":
        return "bg-blue-100 text-blue-800"
      case "Consider":
        return "bg-amber-100 text-amber-800"
      case "Not Recommended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Equipment ROI</CardTitle>
        <CardDescription>Return on investment analysis for current and proposed equipment</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Equipment</TabsTrigger>
            <TabsTrigger value="proposed">Proposed Equipment</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="pt-4">
            <div className="mb-4 h-[200px]">
              <ChartContainer
                config={{
                  roi: {
                    label: "ROI (%)",
                    color: "hsl(var(--chart-1))",
                  },
                  paybackPeriod: {
                    label: "Payback Period (Years)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={equipmentROIData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="equipment" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="roi" fill="var(--color-roi)" radius={[4, 4, 0, 0]} />
                    <Bar
                      yAxisId="right"
                      dataKey="paybackPeriod"
                      fill="var(--color-paybackPeriod)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead className="text-right">Initial Cost</TableHead>
                  <TableHead className="text-right">Annual Savings</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentROIData.map((item) => (
                  <TableRow key={item.equipment}>
                    <TableCell className="font-medium">{item.equipment}</TableCell>
                    <TableCell className="text-right">${item.initialCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${item.annualSavings.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.roi}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="proposed" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead className="text-right">Initial Cost</TableHead>
                  <TableHead className="text-right">Projected Savings</TableHead>
                  <TableHead className="text-right">Payback (Years)</TableHead>
                  <TableHead className="text-right">Projected ROI</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposedEquipmentData.map((item) => (
                  <TableRow key={item.equipment}>
                    <TableCell className="font-medium">{item.equipment}</TableCell>
                    <TableCell className="text-right">${item.initialCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${item.projectedSavings.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.paybackPeriod}</TableCell>
                    <TableCell className="text-right">{item.projectedROI}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRecommendationColor(item.recommendation)}>
                        {item.recommendation}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
