"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  LineChart
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CostData {
  period: string
  totalBudget: number
  actualSpend: number
  remainingBudget: number
  budgetUtilization: number
  costTrends: Array<{
    month: string
    budget: number
    actual: number
    variance: number
  }>
  categoryCosts: Array<{
    category: string
    budget: number
    actual: number
    variance: number
    percentage: number
  }>
  topExpenses: Array<{
    material: string
    cost: number
    quantity: number
    unitCost: number
    supplier: string
  }>
}

// Sample cost data
const sampleCostData: CostData = {
  period: "Q1 2024",
  totalBudget: 150000,
  actualSpend: 125000,
  remainingBudget: 25000,
  budgetUtilization: 83,
  costTrends: [
    { month: "Jan", budget: 50000, actual: 42000, variance: -8000 },
    { month: "Feb", budget: 50000, actual: 45000, variance: -5000 },
    { month: "Mar", budget: 50000, actual: 38000, variance: -12000 }
  ],
  categoryCosts: [
    { category: "Precious Metals", budget: 75000, actual: 65000, variance: -10000, percentage: 52 },
    { category: "Gemstones", budget: 45000, actual: 38000, variance: -7000, percentage: 30 },
    { category: "Findings", budget: 20000, actual: 18000, variance: -2000, percentage: 14 },
    { category: "Tools & Equipment", budget: 10000, actual: 4000, variance: -6000, percentage: 4 }
  ],
  topExpenses: [
    { material: "14K Yellow Gold", cost: 25000, quantity: 550, unitCost: 45.45, supplier: "GoldCorp Metals" },
    { material: "Diamond 1ct Round", cost: 17000, quantity: 2, unitCost: 8500, supplier: "Diamond Source Inc" },
    { material: "18K White Gold", cost: 15000, quantity: 300, unitCost: 50.00, supplier: "GoldCorp Metals" },
    { material: "Sapphire 2ct Oval", cost: 8400, quantity: 7, unitCost: 1200, supplier: "Gemstone World" },
    { material: "Platinum", cost: 8000, quantity: 250, unitCost: 32.00, supplier: "Platinum Plus" }
  ]
}

export function MaterialCostTracker() {
  const [data, setData] = useState<CostData>(sampleCostData)

  const handleExportCosts = () => {
    toast({ title: "Export Started", description: "Cost data export has been initiated." })
  }

  const handleRefreshData = () => {
    toast({ title: "Data Refreshed", description: "Cost data has been updated." })
  }

  const getVarianceColor = (variance: number) => {
    if (variance < 0) return "text-green-600"
    if (variance > 0) return "text-red-600"
    return "text-gray-600"
  }

  const getVarianceIcon = (variance: number) => {
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-green-600" />
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-600" />
    return <BarChart3 className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cost Tracking</h2>
          <p className="text-muted-foreground">Monitor material costs, budgets, and spending trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefreshData} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportCosts} aria-label="Export">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.period}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Spend</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.actualSpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.budgetUtilization}% utilized
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${data.remainingBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.remainingBudget / data.totalBudget) * 100)}% left
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Variance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-${Math.abs(data.totalBudget - data.actualSpend).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Under budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
          <CardDescription>Track budget usage across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Overall Budget</span>
                <span className="text-sm font-medium">{data.budgetUtilization}%</span>
              </div>
              <Progress value={data.budgetUtilization} className="h-3" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.categoryCosts.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="text-sm">{Math.round((category.actual / category.budget) * 100)}%</span>
                  </div>
                  <Progress value={(category.actual / category.budget) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${category.actual.toLocaleString()} / ${category.budget.toLocaleString()}</span>
                    <span className={getVarianceColor(category.variance)}>
                      {category.variance > 0 ? '+' : ''}${category.variance.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="expenses">Top Expenses</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost Trends</CardTitle>
              <CardDescription>Budget vs actual spending by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.costTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-medium">{trend.month}</div>
                      <div className="flex items-center gap-2">
                        {getVarianceIcon(trend.variance)}
                        <span className={`text-sm font-medium ${getVarianceColor(trend.variance)}`}>
                          {trend.variance > 0 ? '+' : ''}${trend.variance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${trend.actual.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        of ${trend.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Detailed cost analysis by material category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.categoryCosts.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.percentage}% of total budget
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${category.actual.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        Budget: ${category.budget.toLocaleString()}
                      </div>
                      <div className={`text-sm font-medium ${getVarianceColor(category.variance)}`}>
                        {category.variance > 0 ? '+' : ''}${category.variance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Expenses</CardTitle>
              <CardDescription>Highest cost materials and suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topExpenses.map((expense, index) => (
                  <div key={expense.material} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{expense.material}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.quantity} units @ ${expense.unitCost.toLocaleString()}/unit
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {expense.supplier}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${expense.cost.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((expense.cost / data.actualSpend) * 100)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Insights</CardTitle>
                <CardDescription>AI-powered cost analysis and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Budget Performance</h4>
                    <p className="text-sm text-green-700">
                      You're currently 17% under budget. Consider investing in quality improvements or bulk purchases.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Cost Optimization</h4>
                    <p className="text-sm text-blue-700">
                      Tools & Equipment category is 60% under budget. Review if additional tools are needed.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Price Alert</h4>
                    <p className="text-sm text-amber-700">
                      Gold prices have increased 8% this quarter. Consider forward contracts for Q2.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast</CardTitle>
                <CardDescription>Predicted costs and budget requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Q2 2024 Budget</span>
                    <span className="text-sm font-medium">$165,000</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Expected Growth</span>
                    <span className="text-sm font-medium text-green-600">+10%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Savings Potential</span>
                    <span className="text-sm font-medium text-blue-600">$18,500</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Key Recommendations</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Increase bulk purchasing for 14K Gold</li>
                    <li>• Negotiate better terms with Diamond Source Inc</li>
                    <li>• Consider alternative suppliers for findings</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 