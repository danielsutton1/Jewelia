"use client"

import { useApi } from '@/lib/api-service'
import { useParams } from 'next/navigation'
import { DiamondSpecificationsCard } from '@/components/diamond/diamond-specifications-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Order as ApiOrder } from '@/lib/api-service'
import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'
import { OrderItem as UIOrderItem } from "@/components/orders/order-items-table"
import { OrderItemsTable } from "@/components/orders/order-items-table"
import { AddOrderItemDialog, InventoryItem } from "@/components/orders/add-order-item-dialog"

// Define the mock API response type
interface MockOrderItem {
  id: string
  productId: string
  quantity: number
  price: number
}

interface MockOrder {
  id: string
  customerId: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  total: number
  items: MockOrderItem[]
  createdAt: Date
  updatedAt: Date
}

export default function OrderDetailsPage() {
  const api = useApi()
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<MockOrder | null>(null)
  const [items, setItems] = useState<UIOrderItem[]>([
    {
      id: "item-1",
      image: "/sparkling-diamond-ring.png",
      sku: "DR-0123",
      name: "Diamond Solitaire Ring",
      description: "1.0ct round brilliant diamond in 18k white gold setting",
      quantity: 1,
      unitPrice: 3499.99,
      discount: { type: "percentage", value: 0, reason: "" },
      taxExempt: false,
      notes: "",
      diamondSpecs: {
        clarity: "VS2",
        color: "G",
        cut: "Ideal",
        caratWeight: 1.0,
        fluorescence: "None",
        polish: "Excellent",
        symmetry: "Excellent",
        gradingLab: "GIA",
        reportNumber: "123456789",
        depthPercentage: 61.5,
        tablePercentage: 57,
        measurements: { length: 5.5, width: 5.5, depth: 3.25 },
      },
    },
  ])
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await api.orders.get(id) as MockOrder
        if (orderData) {
          // Map API order items to our UI OrderItem format
          const mappedItems: UIOrderItem[] = orderData.items.map(item => ({
            id: item.id,
            image: "/placeholder.svg", // TODO: Get actual image from product
            sku: item.productId, // TODO: Get actual SKU from product
            name: `Product ${item.productId}`, // TODO: Get actual name from product
            description: "", // TODO: Get actual description from product
            quantity: item.quantity,
            unitPrice: item.price,
            discount: { type: "percentage", value: 0, reason: "" },
            taxExempt: false,
            notes: "",
          }))
          setItems(mappedItems)
          setOrder(orderData)
        } else {
          toast({
            title: "Error",
            description: "Order not found.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        toast({
          title: "Error",
          description: "Failed to load order details.",
          variant: "destructive",
        })
      }
    }

    fetchOrder()
  }, [api, params.id])

  const handleAddItem = () => {
    setAddDialogOpen(true)
  }

  // Convert InventoryItem to UIOrderItem
  const handleAddInventoryItem = (item: InventoryItem) => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        image: item.image,
        sku: item.sku,
        name: item.name,
        description: item.description || "",
        quantity: 1,
        unitPrice: item.unitPrice,
        discount: { type: "percentage", value: 0, reason: "" },
        taxExempt: false,
        notes: "",
      },
    ])
  }

  if (!order) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
          {order.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderItemsTable
            items={items}
            onItemsChange={setItems}
            onAddItem={handleAddItem}
          />
        </CardContent>
      </Card>

      <AddOrderItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddInventoryItem}
      />

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 
 