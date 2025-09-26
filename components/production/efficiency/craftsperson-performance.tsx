"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CraftspersonPerformance({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const efficiencyData = [
    {
      name: "Emma J.",
      efficiency: 85,
      qualityScore: 92,
      itemsCompleted: 28,
      avgCycleTime: 3.8,
    },
    {
      name: "Michael C.",
      efficiency: 78,
      qualityScore: 95,
      itemsCompleted: 22,
      avgCycleTime: 4.2,
    },
    {
      name: "Sophia R.",
      efficiency: 92,
      qualityScore: 88,
      itemsCompleted: 32,
      avgCycleTime: 3.5,
    },
    {
      name: "David K.",
      efficiency: 75,
      qualityScore: 90,
      itemsCompleted: 18,
      avgCycleTime: 4.5,
    },
    {
      name: "Olivia W.",
      efficiency: 82,
      qualityScore: 94,
      itemsCompleted: 25,
      avgCycleTime: 4.0,
    },
  ]

  const stageData = [
    {
      name: "Emma J.",
      design: 90,
      casting: 75,
      stoneSetting: 85,
      polishing: 88,
    },
    {
      name: "Michael C.",
      design: 82,
      casting: 90,
      stoneSetting: 70,
      polishing: 78,
    },
    {
      name: "Sophia R.",
      design: 95,
      casting: 88,
      stoneSetting: 92,
      polishing: 90,
    },
    {
      name: "David K.",
      design: 80,
      casting: 85,
      stoneSetting: 65,
      polishing: 75,
    },
    {
      name: "Olivia W.",
      design: 85,
      casting: 80,
      stoneSetting: 90,
      polishing: 85,
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Craftsperson Performance</CardTitle>
        <CardDescription>Efficiency and quality scores by craftsperson</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="efficiency" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="efficiency">Efficiency Metrics</TabsTrigger>
            <TabsTrigger value="stages">Stage Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="efficiency" className="h-[250px] pt-4">
            <ChartContainer
              config={{
                efficiency: {
                  label: "Efficiency",
                  color: "hsl(var(--primary))",
                },
                qualityScore: {
                  label: "Quality Score",
                  color: "hsl(var(--gold-primary))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="efficiency" fill="var(--color-efficiency)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="qualityScore" fill="var(--color-qualityScore)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="stages" className="h-[250px] pt-4">
            <ChartContainer
              config={{
                design: {
                  label: "Design",
                  color: "hsl(var(--primary))",
                },
                casting: {
                  label: "Casting",
                  color: "hsl(var(--gold-primary))",
                },
                stoneSetting: {
                  label: "Stone Setting",
                  color: "hsl(var(--chart-2))",
                },
                polishing: {
                  label: "Polishing",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="design" fill="var(--color-design)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="casting" fill="var(--color-casting)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="stoneSetting" fill="var(--color-stoneSetting)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="polishing" fill="var(--color-polishing)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
