'use client'

import { CheckCircle, Clock, Hourglass, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Link from "next/link"

interface ProductionItem {
  id: string
  name: string
  customer_name?: string
  stage: string
  priority: string
  estimated_completion: string
  status: string
  notes?: string
}

export function ProductionStatus() {
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductionItems = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/production?limit=4')
        if (!response.ok) {
          throw new Error('Failed to fetch production items')
        }
        
        const data = await response.json()
        setProductionItems(data.data || [])
      } catch (error) {
        console.error('Error fetching production items:', error)
        setError('Failed to load production status')
      } finally {
        setLoading(false)
      }
    }

    fetchProductionItems()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
      case "pending":
        return <Hourglass className="h-4 w-4 text-muted-foreground" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-amber-500">In Progress</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "completed":
        return <Badge className="bg-emerald-500">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getProgressValue = (stage: string) => {
    const stages = ['Design', 'Casting', 'Setting', 'Polishing', 'QC', 'Completed']
    const currentIndex = stages.indexOf(stage)
    return currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-600">Loading production status...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (productionItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No production items found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {productionItems.map((item) => (
        <div key={item.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{item.name}</h4>
                {getStatusIcon(item.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {item.customer_name && `${item.customer_name} • `}
                Stage: {item.stage}
              </p>
            </div>
            {getStatusBadge(item.status)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {Math.round(getProgressValue(item.stage))}%</span>
              <span className={getPriorityColor(item.priority)}>
                Priority: {item.priority}
              </span>
            </div>
            <Progress value={getProgressValue(item.stage)} className="h-2" />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Due: {new Date(item.estimated_completion).toLocaleDateString()}</span>
          </div>
          {item.notes && (
            <p className="text-xs text-muted-foreground italic">
              Note: {item.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
