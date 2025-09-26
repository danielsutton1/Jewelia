"use client"

import { use, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useApi } from '@/lib/api-service'
import { DiamondSpecificationsForm } from '@/components/diamond/diamond-specifications-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DiamondSpecifications } from '@/components/diamond/diamond-specifications-card'
import { InventoryItem } from '@/lib/api-service'
import { useRouter } from 'next/navigation'

export default function EditInventoryItemPage() {
  const api = useApi()
  const params = useParams()
  const id = String(params.id)
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await api.inventory.get(id)
        if (data) {
          setItem(data as InventoryItem)
        }
      } catch (error) {
        console.error('Error loading inventory item:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) loadItem()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!item) {
    return <div>Item not found</div>
  }

  const handleChange = (field: string, value: any) => {
    setItem({ ...item, [field]: value })
  }

  const handleDiamondSpecsChange = (specs: DiamondSpecifications) => {
    setItem({ ...item, diamondSpecifications: specs })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.inventory.update(id, item)
      router.push('/inventory')
    } catch (error) {
      console.error('Error updating inventory item:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Inventory Item</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={item.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={item.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                    <SelectItem value="Components">Components</SelectItem>
                    <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={item.unit}
                    onValueChange={(value) => handleChange('unit', value)}
                  >
                    <SelectTrigger>
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
                <Label htmlFor="location">Location</Label>
                <Select
                  value={item.location}
                  onValueChange={(value) => handleChange('location', value)}
                >
                  <SelectTrigger>
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
                <Label>Diamond Specifications</Label>
                <DiamondSpecificationsForm
                  specs={item.diamondSpecifications || {
                    clarity: '',
                    color: '',
                    cut: '',
                    caratWeight: 0,
                  }}
                  onChange={handleDiamondSpecsChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  )
} 
 
 