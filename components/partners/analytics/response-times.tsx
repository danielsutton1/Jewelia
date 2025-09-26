"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for response times
const responseTimeData = [
  { partner: "GoldCraft Suppliers", inquiryResponse: 2.1, issueResponse: 3.5, orderResponse: 1.8 },
  { partner: "Diamond District Gems", inquiryResponse: 4.2, issueResponse: 6.8, orderResponse: 3.5 },
  { partner: "Precision Casting Co.", inquiryResponse: 3.5, issueResponse: 5.2, orderResponse: 2.9 },
  { partner: "Master Engravers Guild", inquiryResponse: 5.8, issueResponse: 8.4, orderResponse: 4.7 },
  { partner: "Shine Plating Services", inquiryResponse: 3.2, issueResponse: 4.9, orderResponse: 2.6 },
  { partner: "Elite Craftspeople", inquiryResponse: 1.9, issueResponse: 3.2, orderResponse: 1.5 },
  { partner: "Swift Shipping Partners", inquiryResponse: 1.2, issueResponse: 2.8, orderResponse: 0.9 },
  { partner: "Pearl Perfection", inquiryResponse: 4.5, issueResponse: 7.2, orderResponse: 3.8 },
]

const responseTimeByCategory = [
  { category: "Metal Suppliers", inquiryResponse: 2.5, issueResponse: 4.2, orderResponse: 2.1 },
  { category: "Stone Suppliers", inquiryResponse: 4.3, issueResponse: 7.0, orderResponse: 3.6 },
  { category: "Findings Suppliers", inquiryResponse: 3.1, issueResponse: 5.5, orderResponse: 2.7 },
  { category: "Casting Services", inquiryResponse: 3.5, issueResponse: 5.2, orderResponse: 2.9 },
  { category: "Engraving Services", inquiryResponse: 5.8, issueResponse: 8.4, orderResponse: 4.7 },
  { category: "Plating Services", inquiryResponse: 3.2, issueResponse: 4.9, orderResponse: 2.6 },
  { category: "Contractors", inquiryResponse: 1.9, issueResponse: 3.2, orderResponse: 1.5 },
  { category: "Shipping Partners", inquiryResponse: 1.2, issueResponse: 2.8, orderResponse: 0.9 },
]

export function ResponseTimes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Times</CardTitle>
        <CardDescription>Average response times for inquiries, issues, and orders</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="partners">
          <TabsList className="mb-4">
            <TabsTrigger value="partners">By Partner</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  inquiryResponse: {
                    label: "Inquiry Response (hours)",
                    color: "hsl(var(--chart-1))",
                  },
                  issueResponse: {
                    label: "Issue Response (hours)",
                    color: "hsl(var(--chart-2))",
                  },
                  orderResponse: {
                    label: "Order Response (hours)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={responseTimeData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="partner" type="category" width={150} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <ReferenceLine x={4} stroke="#ff0000" label="Target" />
                    <Bar dataKey="inquiryResponse" fill="var(--color-inquiryResponse)" />
                    <Bar dataKey="issueResponse" fill="var(--color-issueResponse)" />
                    <Bar dataKey="orderResponse" fill="var(--color-orderResponse)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  inquiryResponse: {
                    label: "Inquiry Response (hours)",
                    color: "hsl(var(--chart-1))",
                  },
                  issueResponse: {
                    label: "Issue Response (hours)",
                    color: "hsl(var(--chart-2))",
                  },
                  orderResponse: {
                    label: "Order Response (hours)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={responseTimeByCategory}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={150} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <ReferenceLine x={4} stroke="#ff0000" label="Target" />
                    <Bar dataKey="inquiryResponse" fill="var(--color-inquiryResponse)" />
                    <Bar dataKey="issueResponse" fill="var(--color-issueResponse)" />
                    <Bar dataKey="orderResponse" fill="var(--color-orderResponse)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
