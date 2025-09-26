"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ProductionFlowData {
  stages: Array<{
    stage: string
    count: number
    percentage: number
  }>
  totalItems: number
}

export function ProductionFlow({ filters }: { filters: any }) {
  const [data, setData] = useState<ProductionFlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProductionFlow()
  }, [filters])

  const fetchProductionFlow = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=production')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch production flow')
      }
      
      setData(result.data.flow)
    } catch (err: any) {
      console.error('Error fetching production flow:', err)
      setError(err.message || 'Failed to load production flow')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Production Flow</CardTitle>
          <CardDescription>Visualization of work orders moving through production stages</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Production Flow</CardTitle>
          <CardDescription>Visualization of work orders moving through production stages</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchProductionFlow}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.stages || data.stages.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Production Flow</CardTitle>
          <CardDescription>Visualization of work orders moving through production stages</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No production flow data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stages = data.stages
  const totalItems = data.totalItems

  // Define stage colors
  const stageColors: Record<string, { bg: string; text: string; border: string }> = {
    'Design': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'bg-blue-300' },
    'Casting': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'bg-indigo-300' },
    'Stone Setting': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'bg-purple-300' },
    'Polishing': { bg: 'bg-green-100', text: 'text-green-800', border: 'bg-green-300' },
    'QC': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'bg-amber-300' },
    'Completed': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'bg-teal-300' },
    'Rework': { bg: 'bg-red-100', text: 'text-red-800', border: 'bg-red-300' },
    'Unknown': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'bg-gray-300' }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Production Flow</CardTitle>
        <CardDescription>
          Visualization of {totalItems} work orders moving through production stages
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col space-y-2">
            {stages.map((stage, index) => {
              const colors = stageColors[stage.stage] || stageColors['Unknown']
              const nextStage = stages[index + 1]
              const flowCount = nextStage ? Math.min(stage.count, nextStage.count) : stage.count
              
              return (
                <div key={stage.stage} className="flex w-full justify-between items-center">
                  <div className={`rounded p-2 text-center text-sm font-medium ${colors.bg} ${colors.text}`}>
                    {stage.stage}
                    <div className="text-xs font-normal">{stage.count} orders</div>
                  </div>
                  
                  {nextStage && (
                    <>
                      <div className="flex items-center">
                        <div className={`h-0.5 w-16 ${colors.border}`}></div>
                        <div className="text-xs text-muted-foreground ml-1">{flowCount}</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`h-8 w-0.5 ${colors.border}`}></div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="text-xs text-muted-foreground mr-1">{flowCount}</div>
                        <div className={`h-0.5 w-16 ${colors.border}`}></div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
