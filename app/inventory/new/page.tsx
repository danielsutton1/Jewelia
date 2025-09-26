"use client"
import { useApi } from '@/lib/api-service'
import { DiamondSpecificationsForm } from '@/components/diamond/diamond-specifications-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { DiamondSpecifications } from '@/components/diamond/diamond-specifications-card'
import { useRouter } from 'next/navigation'

export default function NewInventoryItemPage() {
  const api = useApi()
  const router = useRouter()
  const [item, setItem] = useState({
    name: '',
    category: 'Raw Materials' as const,
    quantity: 0,
    unit: 'grams' as const,
    location: 'Warehouse A' as const,
    diamondSpecifications: {
      clarity: '',
      color: '',
      cut: '',
      caratWeight: 0,
    } as DiamondSpecifications,
  })

  const handleChange = (field: string, value: any) => {
    setItem({ ...item, [field]: value })
  }

  const handleDiamondSpecsChange = (specs: DiamondSpecifications) => {
    setItem({ ...item, diamondSpecifications: specs })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.inventory.create(item)
      router.push('/inventory')
    } catch (error) {
      console.error('Error creating inventory item:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6 lg:px-0">
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">New Inventory Item</h1>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <CardHeader className="p-0 pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base font-medium">Name</Label>
                  <Input
                    id="name"
                    value={item.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    className="min-h-[44px] text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm sm:text-base font-medium">Category</Label>
                  <Select
                    value={item.category}
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                      <SelectItem value="Components">Components</SelectItem>
                      <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm sm:text-base font-medium">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                      required
                      className="min-h-[44px] text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-sm sm:text-base font-medium">Unit</Label>
                    <Select
                      value={item.unit}
                      onValueChange={(value) => handleChange('unit', value)}
                    >
                      <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grams">Grams</SelectItem>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="meters">Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm sm:text-base font-medium">Location</Label>
                  <Select
                    value={item.location}
                    onValueChange={(value) => handleChange('location', value)}
                  >
                    <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                      <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                      <SelectItem value="Storage Room">Storage Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Diamond Specifications</Label>
                  <DiamondSpecificationsForm
                    specs={item.diamondSpecifications}
                    onChange={handleDiamondSpecsChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
            >
              Create Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 
 
 