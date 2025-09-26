"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, LabelList, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for batch analytics
const batchEfficiencyData = [
  { month: "Jan", setupTime: 4.2, processingTime: 12.5, totalTime: 16.7 },
  { month: "Feb", setupTime: 4.0, processingTime: 12.2, totalTime: 16.2 },
  { month: "Mar", setupTime: 3.8, processingTime: 12.0, totalTime: 15.8 },
  { month: "Apr", setupTime: 3.5, processingTime: 11.8, totalTime: 15.3 },
  { month: "May", setupTime: 3.2, processingTime: 11.5, totalTime: 14.7 },
  { month: "Jun", setupTime: 2.8, processingTime: 11.2, totalTime: 14.0 },
  { month: "Jul", setupTime: 2.5, processingTime: 11.0, totalTime: 13.5 },
]

const batchSizeData = [
  { size: "1-5", setupTimePerItem: 1.8, qualityPass: 88 },
  { size: "6-10", setupTimePerItem: 1.2, qualityPass: 92 },
  { size: "11-15", setupTimePerItem: 0.9, qualityPass: 94 },
  { size: "16-20", setupTimePerItem: 0.7, qualityPass: 95 },
  { size: "21+", setupTimePerItem: 0.6, qualityPass: 96 },
]

const materialUsageData = [
  { month: "Jan", individual: 100, batch: 82 },
  { month: "Feb", individual: 100, batch: 84 },
  { month: "Mar", individual: 100, batch: 83 },
  { month: "Apr", individual: 100, batch: 81 },
  { month: "May", individual: 100, batch: 80 },
  { month: "Jun", individual: 100, batch: 79 },
  { month: "Jul", individual: 100, batch: 78 },
]

const qualityComparisonData = [
  { stage: "Design", individual: 92, batch: 94 },
  { stage: "Casting", individual: 88, batch: 92 },
  { stage: "Stone Setting", individual: 85, batch: 91 },
  { stage: "Polishing", individual: 90, batch: 94 },
  { stage: "QC", individual: 95, batch: 97 },
]

export function BatchAnalytics() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="efficiency">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="batch-size">Batch Size</TabsTrigger>
          <TabsTrigger value="material-usage">Material Usage</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency" className="mt-4 space-y-6">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Production Time Efficiency</CardTitle>
              <CardDescription>Setup time vs. processing time over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] bg-gradient-to-br from-white to-slate-100 rounded-xl">
              <ChartContainer
                config={{
                  setupTime: {
                    label: "Setup Time (hours)",
                    color: "#6366f1",
                  },
                  processingTime: {
                    label: "Processing Time (hours)",
                    color: "#06b6d4",
                  },
                  totalTime: {
                    label: "Total Time (hours)",
                    color: "#f59e42",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={batchEfficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="setupTimeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="processingTimeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="totalTimeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e42" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#f59e42" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: '#f3f4f6' }} />
                    <Legend />
                    <Bar dataKey="setupTime" fill="url(#setupTimeGradient)" radius={[8, 8, 0, 0]} barSize={32}>
                      <LabelList dataKey="setupTime" position="top" fill="#6366f1" fontSize={14} />
                    </Bar>
                    <Bar dataKey="processingTime" fill="url(#processingTimeGradient)" radius={[8, 8, 0, 0]} barSize={32}>
                      <LabelList dataKey="processingTime" position="top" fill="#06b6d4" fontSize={14} />
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="totalTime"
                      stroke="url(#totalTimeGradient)"
                      strokeWidth={4}
                      dot={{ r: 8, fill: '#f59e42', stroke: '#fff', strokeWidth: 2 }}
                    >
                      <LabelList dataKey="totalTime" position="top" fill="#f59e42" fontSize={14} />
                    </Line>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Setup Time Reduction</CardTitle>
                <CardDescription>Average setup time reduction per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">40.5%</div>
                <p className="text-sm text-muted-foreground">Reduction in setup time since January</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>January setup time:</span>
                    <span className="font-medium">4.2 hours per batch</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Current setup time:</span>
                    <span className="font-medium">2.5 hours per batch</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Time saved per month:</span>
                    <span className="font-medium">24.5 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency by Process</CardTitle>
                <CardDescription>Time savings by production process</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ChartContainer
                  config={{
                    casting: {
                      label: "Casting",
                      color: "hsl(var(--chart-1))",
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
                    <BarChart
                      data={[
                        { process: "Casting", casting: 42 },
                        { process: "Stone Setting", stoneSetting: 28 },
                        { process: "Polishing", polishing: 35 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="process" />
                      <YAxis label={{ value: "% Time Saved", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="casting" fill="var(--color-casting)" />
                      <Bar dataKey="stoneSetting" fill="var(--color-stoneSetting)" />
                      <Bar dataKey="polishing" fill="var(--color-polishing)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch-size" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Size Analysis</CardTitle>
              <CardDescription>Impact of batch size on setup time and quality</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  setupTimePerItem: {
                    label: "Setup Time Per Item (hours)",
                    color: "#6366f1",
                  },
                  qualityPass: {
                    label: "Quality Pass Rate (%)",
                    color: "#06b6d4",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={batchSizeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="setupTimeGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="size" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="setupTimePerItem"
                      fill="url(#setupTimeGradient2)"
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                    >
                      <LabelList dataKey="setupTimePerItem" position="top" fill="#6366f1" fontSize={14} />
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="qualityPass"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                    >
                      <LabelList dataKey="qualityPass" position="top" fill="#06b6d4" fontSize={14} />
                    </Line>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Optimal Batch Size</CardTitle>
                <CardDescription>Analysis of optimal batch sizes by product type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Rings</div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span>Optimal batch size:</span>
                      <span className="font-medium">12-15 items</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span>Setup time savings:</span>
                      <span className="font-medium">38%</span>
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="font-medium">Earrings</div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span>Optimal batch size:</span>
                      <span className="font-medium">15-20 items</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span>Setup time savings:</span>
                      <span className="font-medium">42%</span>
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="font-medium">Pendants</div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span>Optimal batch size:</span>
                      <span className="font-medium">10-12 items</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span>Setup time savings:</span>
                      <span className="font-medium">35%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Size Trends</CardTitle>
                <CardDescription>Average batch size over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ChartContainer
                  config={{
                    avgBatchSize: {
                      label: "Average Batch Size",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", avgBatchSize: 8.2 },
                        { month: "Feb", avgBatchSize: 9.5 },
                        { month: "Mar", avgBatchSize: 10.8 },
                        { month: "Apr", avgBatchSize: 12.3 },
                        { month: "May", avgBatchSize: 13.5 },
                        { month: "Jun", avgBatchSize: 14.2 },
                        { month: "Jul", avgBatchSize: 15.1 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 20]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="avgBatchSize"
                        stroke="var(--color-avgBatchSize)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="material-usage" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Material Usage Comparison</CardTitle>
              <CardDescription>Batch vs. individual production material usage</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  individual: {
                    label: "Individual Production (baseline)",
                    color: "#6366f1",
                  },
                  batch: {
                    label: "Batch Production (%)",
                    color: "#06b6d4",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="individualGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="batchGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="individual" fill="url(#individualGradient)" radius={[4, 4, 0, 0]} barSize={32}>
                      <LabelList dataKey="individual" position="top" fill="#6366f1" fontSize={14} />
                    </Bar>
                    <Bar dataKey="batch" fill="url(#batchGradient)" radius={[4, 4, 0, 0]} barSize={32}>
                      <LabelList dataKey="batch" position="top" fill="#06b6d4" fontSize={14} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Material Savings by Type</CardTitle>
                <CardDescription>Material savings by material type</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ChartContainer
                  config={{
                    gold: {
                      label: "Gold",
                      color: "hsl(var(--chart-1))",
                    },
                    silver: {
                      label: "Silver",
                      color: "hsl(var(--chart-2))",
                    },
                    platinum: {
                      label: "Platinum",
                      color: "hsl(var(--chart-3))",
                    },
                    casting: {
                      label: "Casting Investment",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { material: "Gold", gold: 18 },
                        { material: "Silver", silver: 15 },
                        { material: "Platinum", platinum: 22 },
                        { material: "Casting", casting: 35 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="material" />
                      <YAxis label={{ value: "% Saved", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="gold" fill="var(--color-gold)" />
                      <Bar dataKey="silver" fill="var(--color-silver)" />
                      <Bar dataKey="platinum" fill="var(--color-platinum)" />
                      <Bar dataKey="casting" fill="var(--color-casting)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Material Cost Savings</CardTitle>
                <CardDescription>Cost savings from batch material usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$12,450</div>
                <p className="text-sm text-muted-foreground">Total material cost savings this year</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Gold savings:</span>
                    <span className="font-medium">$8,200</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Silver savings:</span>
                    <span className="font-medium">$950</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Platinum savings:</span>
                    <span className="font-medium">$2,800</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Casting investment savings:</span>
                    <span className="font-medium">$500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Comparison</CardTitle>
              <CardDescription>Batch vs. individual production quality by stage</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  individual: {
                    label: "Individual Production (%)",
                    color: "#6366f1",
                  },
                  batch: {
                    label: "Batch Production (%)",
                    color: "#06b6d4",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qualityComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="individualGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="batchGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis domain={[80, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="individual" fill="url(#individualGradient2)" radius={[4, 4, 0, 0]} barSize={32}>
                      <LabelList dataKey="individual" position="top" fill="#6366f1" fontSize={14} />
                    </Bar>
                    <Bar dataKey="batch" fill="url(#batchGradient2)" radius={[4, 4, 0, 0]} barSize={32}>
                      <LabelList dataKey="batch" position="top" fill="#06b6d4" fontSize={14} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Improvement Factors</CardTitle>
                <CardDescription>Key factors contributing to quality improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Consistent Setup</div>
                    <div className="mt-1 text-sm">
                      Batch production allows for a single, careful setup process that is applied consistently across
                      all items in the batch, reducing variation.
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="font-medium">Focused Quality Checks</div>
                    <div className="mt-1 text-sm">
                      Quality checks can be more thorough when performed on a batch, with lessons from early items
                      applied to later ones.
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="font-medium">Process Optimization</div>
                    <div className="mt-1 text-sm">
                      Craftspeople can optimize their technique throughout the batch, leading to improved quality for
                      later items.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defect Reduction</CardTitle>
                <CardDescription>Defect rates over time with batch production</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ChartContainer
                  config={{
                    defectRate: {
                      label: "Defect Rate (%)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", defectRate: 12.5 },
                        { month: "Feb", defectRate: 11.8 },
                        { month: "Mar", defectRate: 10.2 },
                        { month: "Apr", defectRate: 9.5 },
                        { month: "May", defectRate: 8.8 },
                        { month: "Jun", defectRate: 7.5 },
                        { month: "Jul", defectRate: 6.2 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 15]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="defectRate"
                        stroke="var(--color-defectRate)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
