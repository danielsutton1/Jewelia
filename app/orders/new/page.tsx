"use client"
import { useApi } from '@/lib/api-service'
import { DiamondSpecificationsForm } from '@/components/diamond/diamond-specifications-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { DiamondSpecifications } from '@/components/diamond/diamond-specifications-card'

export default function NewOrderPage() {
  const api = useApi()
  const [items, setItems] = useState<Array<{
    productId: string;
    quantity: number;
    price: number;
    diamondSpecifications?: DiamondSpecifications;
  }>>([{
    productId: '',
    quantity: 1,
    price: 0,
  }])

  const handleAddItem = () => {
    setItems([...items, {
      productId: '',
      quantity: 1,
      price: 0,
    }])
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleDiamondSpecsChange = (index: number, specs: DiamondSpecifications) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], diamondSpecifications: specs }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement order creation
    console.log('Creating order with items:', items)
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6 lg:px-0">
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">New Order</h1>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {items.map((item, index) => (
            <Card key={index} className="p-4 sm:p-6">
              <CardHeader className="p-0 pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">Item {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid gap-4 sm:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor={`productId-${index}`} className="text-sm sm:text-base font-medium">Product ID</Label>
                      <Input
                        id={`productId-${index}`}
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${index}`} className="text-sm sm:text-base font-medium">Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${index}`} className="text-sm sm:text-base font-medium">Price</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                      className="min-h-[44px] text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Diamond Specifications</Label>
                    <DiamondSpecificationsForm
                      specs={item.diamondSpecifications || {
                        clarity: '',
                        color: '',
                        cut: '',
                        caratWeight: 0,
                      }}
                      onChange={(specs) => handleDiamondSpecsChange(index, specs)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddItem}
              className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
            >
              Add Item
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
            >
              Create Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 
 
 