"use client"
import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
} from "recharts"
import { Lightbulb, TrendingUp, GraduationCap, AlertTriangle, Plus, Edit, Trash2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { PreventionStrategy, TrainingNeed } from "@/types/rework-tracking"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { NewStrategyForm } from "./new-strategy-form"
import { NewTrainingNeedForm } from "./new-training-need-form"

// Mock data for demonstration
const mockPreventionStrategiesData: PreventionStrategy[] = [
  {
    id: "ps1",
    title: "Improved Quality Control Checkpoints",
    description:
      "Implement additional quality control checkpoints at critical stages of production to catch issues earlier.",
    targetRootCauses: ["Material Defects", "Production Errors"],
    implementationSteps: [
      "Identify critical production stages",
      "Develop QC checklists for each stage",
      "Train staff on new procedures",
      "Implement digital sign-off system",
    ],
    estimatedEffectiveness: 75,
    resourcesRequired: "QC staff, digital tools, training materials",
    estimatedCost: 2500,
    implementationTimeframe: "1-2 months",
    status: "in-progress",
  },
  {
    id: "ps2",
    title: "Enhanced Material Inspection Process",
    description: "Develop more rigorous material inspection procedures before materials enter production.",
    targetRootCauses: ["Material Defects"],
    implementationSteps: [
      "Create detailed inspection criteria",
      "Source inspection equipment",
      "Develop supplier quality standards",
      "Implement tracking system",
    ],
    estimatedEffectiveness: 85,
    resourcesRequired: "Inspection equipment, staff training, documentation",
    estimatedCost: 3800,
    implementationTimeframe: "2-3 months",
    status: "approved",
  },
  {
    id: "ps3",
    title: "Design Review Workflow Improvement",
    description: "Implement structured design review process with client sign-off at multiple stages.",
    targetRootCauses: ["Design Errors", "Communication Errors"],
    implementationSteps: [
      "Define review stages",
      "Create design review checklist",
      "Develop client approval workflow",
      "Train design team",
    ],
    estimatedEffectiveness: 80,
    resourcesRequired: "Project management software, documentation templates",
    estimatedCost: 1200,
    implementationTimeframe: "1 month",
    status: "implemented",
  },
]

const mockTrainingNeedsData: TrainingNeed[] = [
  {
    id: "tn1",
    skillArea: "Stone Setting Techniques",
    description: "Advanced training on secure stone setting for complex designs",
    affectedEmployees: ["John Smith", "Maria Garcia", "Alex Johnson"],
    priority: "high",
    suggestedTraining: "Advanced Stone Setting Masterclass with Tom Wilson",
    estimatedCost: 1800,
    estimatedTimeRequired: 16,
  },
  {
    id: "tn2",
    skillArea: "CAD Design Optimization",
    description: "Training on optimizing CAD designs for production efficiency",
    affectedEmployees: ["Sarah Lee", "David Chen"],
    priority: "medium",
    suggestedTraining: "CAD Optimization for Jewelry Production (Online Course)",
    estimatedCost: 600,
    estimatedTimeRequired: 12,
  },
  {
    id: "tn3",
    skillArea: "Quality Control Procedures",
    description: "Training on updated quality control procedures and documentation",
    affectedEmployees: ["All production staff"],
    priority: "high",
    suggestedTraining: "In-house QC training program",
    estimatedCost: 1200,
    estimatedTimeRequired: 8,
  },
]

const qualityMetricsData = [
  { metric: "First Time Quality", value: 82 },
  { metric: "Defect Rate", value: 3.2 },
  { metric: "Customer Returns", value: 1.8 },
  { metric: "Rework Percentage", value: 4.5 },
  { metric: "On-Time Delivery", value: 94 },
]

const radarData = [
  { subject: "Design", A: 85, fullMark: 100 },
  { subject: "Materials", A: 78, fullMark: 100 },
  { subject: "Production", A: 72, fullMark: 100 },
  { subject: "QC", A: 88, fullMark: 100 },
  { subject: "Finishing", A: 82, fullMark: 100 },
  { subject: "Packaging", A: 95, fullMark: 100 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function ProcessImprovement() {
  const [preventionStrategies, setPreventionStrategies] = useState<PreventionStrategy[]>(mockPreventionStrategiesData)
  const [trainingNeeds, setTrainingNeeds] = useState<TrainingNeed[]>(mockTrainingNeedsData)

  const handleStrategyCreate = (newStrategy: Omit<PreventionStrategy, 'id' | 'status' | 'implementationSteps' | 'resourcesRequired' | 'targetRootCauses'> & {targetRootCauses: string}) => {
    const strategyToAdd: PreventionStrategy = {
      ...newStrategy,
      id: `ps${preventionStrategies.length + 1}`,
      status: "proposed",
      implementationSteps: ["Define implementation plan"], // Default steps
      resourcesRequired: "To be determined", // Default value
      targetRootCauses: newStrategy.targetRootCauses.split(',').map(s => s.trim()),
    };
    setPreventionStrategies(prev => [...prev, strategyToAdd]);
  };

  const handleDeleteStrategy = (id: string) => {
    setPreventionStrategies(prev => prev.filter(s => s.id !== id));
  };

  const handleTrainingNeedCreate = (newTrainingNeed: Omit<TrainingNeed, 'id' | 'affectedEmployees'> & {affectedEmployees: string}) => {
    const trainingNeedToAdd: TrainingNeed = {
      ...newTrainingNeed,
      id: `tn${trainingNeeds.length + 1}`,
      affectedEmployees: newTrainingNeed.affectedEmployees.split(',').map(s => s.trim()),
    };
    setTrainingNeeds(prev => [...prev, trainingNeedToAdd]);
  }

  const handleDeleteTrainingNeed = (id: string) => {
    setTrainingNeeds(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Process Improvement</h2>
          <p className="text-muted-foreground">
            Analyze patterns, develop prevention strategies, and identify training needs.
          </p>
        </div>
        <NewStrategyForm onStrategyCreate={handleStrategyCreate}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Strategy
          </Button>
        </NewStrategyForm>
      </div>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">Issue Patterns</TabsTrigger>
          <TabsTrigger value="strategies">Prevention Strategies</TabsTrigger>
          <TabsTrigger value="training">Training Needs</TabsTrigger>
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Issue Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Stone Setting Issues</div>
                <p className="text-xs text-muted-foreground">27% of all rework cases</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Costly Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Design Revisions</div>
                <p className="text-xs text-muted-foreground">$4,250 impact in last quarter</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fastest Growing Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Material Defects</div>
                <p className="text-xs text-muted-foreground">+32% increase in last 3 months</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Issue Pattern Analysis</CardTitle>
              <CardDescription>Correlation between production stages and issue types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    design: {
                      label: "Design Issues",
                      color: "hsl(var(--chart-1))",
                    },
                    material: {
                      label: "Material Issues",
                      color: "hsl(var(--chart-2))",
                    },
                    production: {
                      label: "Production Issues",
                      color: "hsl(var(--chart-3))",
                    },
                    finishing: {
                      label: "Finishing Issues",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { stage: "Custom Rings", design: 12, material: 8, production: 15, finishing: 5 },
                        { stage: "Necklaces", design: 8, material: 10, production: 6, finishing: 4 },
                        { stage: "Earrings", design: 5, material: 7, production: 4, finishing: 2 },
                        { stage: "Bracelets", design: 7, material: 4, production: 6, finishing: 3 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="design" stackId="a" fill="var(--color-design)" />
                      <Bar dataKey="material" stackId="a" fill="var(--color-material)" />
                      <Bar dataKey="production" stackId="a" fill="var(--color-production)" />
                      <Bar dataKey="finishing" stackId="a" fill="var(--color-finishing)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process Weak Points</CardTitle>
              <CardDescription>Areas in the production process with highest issue rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={150} data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Process Quality" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{preventionStrategies.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Implementation Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Effectiveness</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72%</div>
              </CardContent>
            </Card>
          </div>

          {preventionStrategies.map((strategy) => (
            <Card key={strategy.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{strategy.title}</span>
                  <Badge variant={
                    strategy.status === 'implemented' ? 'default' :
                    strategy.status === 'in-progress' ? 'secondary' :
                    'outline'
                  } className="capitalize text-xs">
                    {strategy.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Targets: {Array.isArray(strategy.targetRootCauses) ? strategy.targetRootCauses.join(", ") : strategy.targetRootCauses}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                <div className="text-xs">
                  <p><strong>Timeframe:</strong> {strategy.implementationTimeframe}</p>
                  <p><strong>Cost:</strong> ${strategy.estimatedCost.toLocaleString()}</p>
                </div>
                <Progress value={strategy.estimatedEffectiveness} className="mt-3 h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{strategy.estimatedEffectiveness}% Estimated Effectiveness</p>
              </CardContent>
              <div className="p-4 pt-0 mt-auto">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteStrategy(strategy.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="flex justify-end">
            <NewTrainingNeedForm onTrainingNeedCreate={handleTrainingNeedCreate}>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Training Need
              </Button>
            </NewTrainingNeedForm>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trainingNeeds.map((need) => (
              <Card key={need.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{need.skillArea}</span>
                    <Badge variant={need.priority === 'high' ? 'destructive' : need.priority === 'medium' ? 'secondary' : 'outline'} className="capitalize">
                      {need.priority}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{need.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">Affected Employees:</p>
                  <p className="text-sm text-muted-foreground mb-4">{need.affectedEmployees.join(", ")}</p>
                  <p className="text-sm font-medium">Suggested Training:</p>
                  <p className="text-sm text-muted-foreground mb-4">{need.suggestedTraining}</p>
                  <div className="flex justify-between text-sm">
                    <span><strong>Cost:</strong> ${need.estimatedCost.toLocaleString()}</span>
                    <span><strong>Time:</strong> {need.estimatedTimeRequired} hrs</span>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteTrainingNeed(need.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {qualityMetricsData.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value}
                    {metric.metric === "Defect Rate" ||
                    metric.metric === "Rework Percentage" ||
                    metric.metric === "Customer Returns"
                      ? "%"
                      : ""}
                  </div>
                  <Progress
                    value={
                      metric.metric === "Defect Rate" ||
                      metric.metric === "Rework Percentage" ||
                      metric.metric === "Customer Returns"
                        ? 100 - metric.value * 10
                        : metric.value
                    }
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics Trends</CardTitle>
              <CardDescription>Tracking key quality indicators over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  ftq: {
                    label: "First Time Quality (%)",
                    color: "hsl(var(--chart-1))",
                  },
                  defect: {
                    label: "Defect Rate (%)",
                    color: "hsl(var(--chart-2))",
                  },
                  rework: {
                    label: "Rework Rate (%)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", ftq: 78, defect: 4.2, rework: 5.8 },
                      { month: "Feb", ftq: 79, defect: 4.0, rework: 5.5 },
                      { month: "Mar", ftq: 80, defect: 3.8, rework: 5.2 },
                      { month: "Apr", ftq: 79, defect: 3.9, rework: 5.4 },
                      { month: "May", ftq: 81, defect: 3.5, rework: 4.9 },
                      { month: "Jun", ftq: 82, defect: 3.3, rework: 4.7 },
                      { month: "Jul", ftq: 82, defect: 3.2, rework: 4.5 },
                      { month: "Aug", ftq: 83, defect: 3.0, rework: 4.3 },
                      { month: "Sep", ftq: 84, defect: 2.8, rework: 4.0 },
                      { month: "Oct", ftq: 85, defect: 2.6, rework: 3.8 },
                      { month: "Nov", ftq: 86, defect: 2.4, rework: 3.5 },
                      { month: "Dec", ftq: 87, defect: 2.2, rework: 3.2 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="ftq" fill="var(--color-ftq)" />
                    <Bar dataKey="defect" fill="var(--color-defect)" />
                    <Bar dataKey="rework" fill="var(--color-rework)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
