'use client'

import { useApi } from "@/lib/api-service"
import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"

export function InventoryAlerts() {
  const api = useApi()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const inventory = await api.inventory.list()
        const lowStockItems = inventory.filter(item => item.quantity < 10)
        setAlerts(lowStockItems)
      } catch (error) {
        console.error('Error fetching inventory alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [api])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <p className="text-sm text-gray-500">No inventory alerts</p>
      ) : (
        alerts.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                Low stock: {item.quantity} {item.unit}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
