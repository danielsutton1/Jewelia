"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle } from "lucide-react"

interface SalesForecastProps {
  data: any[]
  onDrillDown: (metric: string, data: any) => void
}

export function SalesForecastChart({ data, onDrillDown }: SalesForecastProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No sales forecast data available</p>
      </div>
    )
  }

  // Transform data for chart
  const chartData = data.map(item => ({
    period: item.period,
    predictedRevenue: item.predictedRevenue,
    lowerBound: item.confidenceInterval.lower,
    upperBound: item.confidenceInterval.upper,
    growthRate: item.growthRate
  }))

  const latestForecast = data[0]
  const totalPredictedRevenue = data.reduce((sum, item) => sum + item.predictedRevenue, 0)
  const avgGrowthRate = data.reduce((sum, item) => sum + item.growthRate, 0) / data.length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Period Forecast</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${latestForecast?.predictedRevenue?.toLocaleString() || '0'}
            </div>
            <div className="flex items-center mt-2">
              {latestForecast?.growthRate > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={`text-xs ${latestForecast?.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {latestForecast?.growthRate || 0}% growth
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecast</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPredictedRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Over {data.length} periods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgGrowthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast with Confidence Intervals</CardTitle>
          <CardDescription>
            Click on any point to see detailed analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  onClick={(data) => setSelectedPeriod(data.value)}
                  style={{ cursor: 'pointer' }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'predictedRevenue' ? `$${value.toLocaleString()}` : 
                    name === 'lowerBound' ? `$${value.toLocaleString()}` :
                    name === 'upperBound' ? `$${value.toLocaleString()}` : value,
                    name === 'predictedRevenue' ? 'Predicted Revenue' :
                    name === 'lowerBound' ? 'Lower Bound' :
                    name === 'upperBound' ? 'Upper Bound' : name
                  ]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                
                {/* Confidence Interval Area */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stackId="1"
                  stroke="transparent"
                  fill="rgba(59, 130, 246, 0.1)"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stackId="1"
                  stroke="transparent"
                  fill="rgba(59, 130, 246, 0.1)"
                />
                
                {/* Predicted Revenue Line */}
                <Line
                  type="monotone"
                  dataKey="predictedRevenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Growth Factors Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Factors Analysis</CardTitle>
          <CardDescription>
            Key factors influencing revenue growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {latestForecast?.factors?.map((factor: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">{factor}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={() => onDrillDown('sales-factors', data)}
              variant="outline"
              size="sm"
            >
              View Detailed Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
          <CardDescription>
            Potential risks and mitigation strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.slice(0, 3).map((forecast, index) => {
              const riskLevel = forecast.growthRate < 0 ? 'high' : 
                               forecast.growthRate < 5 ? 'medium' : 'low'
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{forecast.period}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: ${forecast.confidenceInterval.lower.toLocaleString()} - ${forecast.confidenceInterval.upper.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'secondary' : 'default'}>
                    {riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Period Details */}
      {selectedPeriod && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis: {selectedPeriod}</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const periodData = data.find(item => item.period === selectedPeriod)
              if (!periodData) return null
              
              return (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Revenue Prediction</h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${periodData.predictedRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Confidence Interval: ${periodData.confidenceInterval.lower.toLocaleString()} - ${periodData.confidenceInterval.upper.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Growth Analysis</h4>
                    <div className="flex items-center">
                      {periodData.growthRate > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                      )}
                      <span className={`font-medium ${periodData.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {periodData.growthRate}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Compared to previous period
                    </p>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper component for check icon
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )
} 