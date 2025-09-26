'use client'

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  customer?: {
    full_name: string
  }
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/orders?limit=5')
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        
        const data = await response.json()
        setOrders(data.data || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent orders found.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0">
          <div>
            <p className="font-medium text-gray-900">
              Order #{order.id.slice(0, 8)}
            </p>
            <p className="text-sm text-gray-600">
              {order.customer?.full_name || 'Unknown Customer'}
            </p>
            <p className="text-sm text-emerald-600 font-medium">
              ${order.total_amount?.toFixed(2) || '0.00'}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
          </Badge>
        </div>
      ))}
    </div>
  )
} 
 
 