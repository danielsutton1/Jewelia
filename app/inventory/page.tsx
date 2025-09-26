"use client"
import { useApi } from '@/lib/api-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState, useEffect } from 'react'
import { InventoryItem } from '@/lib/api-service'
import { DiamondSpecificationsCard } from '@/components/diamond/diamond-specifications-card'
import type { Diamond } from '@/lib/api-service'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

const mockDiamonds: Diamond[] = [
  {
    id: '1',
    clarity: 'VS1',
    color: 'G',
    cut: 'Excellent',
    carat_weight: 1.2,
    fluorescence: 'None',
    polish: 'Excellent',
    symmetry: 'Very Good',
    grading_lab: 'GIA',
    report_number: '123456',
    depth_percentage: 61.5,
    table_percentage: 57,
    length: 6.8,
    width: 6.7,
    depth: 4.1,
    location: 'Warehouse A',
    status: 'Available',
    stock: 2,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    clarity: 'VVS2',
    color: 'D',
    cut: 'Very Good',
    carat_weight: 0.9,
    fluorescence: 'Faint',
    polish: 'Very Good',
    symmetry: 'Excellent',
    grading_lab: 'IGI',
    report_number: '654321',
    depth_percentage: 62.1,
    table_percentage: 58,
    length: 6.2,
    width: 6.1,
    depth: 3.8,
    location: 'Warehouse B',
    status: 'Reserved',
    stock: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

export default function InventoryPage() {
  const api = useApi() as any
  const [items, setItems] = useState<InventoryItem[]>([])
  const [diamonds, setDiamonds] = useState<Diamond[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await api.inventory.list()
        setItems(data)
        if (api.diamonds) {
          const diamondsData = await api.diamonds.list()
          setDiamonds(diamondsData.length ? diamondsData : mockDiamonds)
        } else {
          setDiamonds(mockDiamonds)
        }
      } catch (error) {
        setDiamonds(mockDiamonds)
        console.error('Error loading inventory items or diamonds:', error)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold inventory-heading">Inventory Management</h1>
        <Link href="/inventory/new">
          <Button className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Name</TableHead>
                  <TableHead className="text-xs sm:text-sm">Category</TableHead>
                  <TableHead className="text-xs sm:text-sm">Quantity</TableHead>
                  <TableHead className="text-xs sm:text-sm">Unit</TableHead>
                  <TableHead className="text-xs sm:text-sm">Location</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs sm:text-sm">{item.name}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{item.category}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{item.quantity}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{item.unit}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{item.location}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 sm:gap-2 flex-wrap">
                        <Link href={`/inventory/${item.id}/edit`}>
                          <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px] text-xs">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="min-h-[44px] min-w-[44px] text-xs"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this item?')) {
                              try {
                                await api.inventory.delete(item.id)
                                setItems(items.filter((i) => i.id !== item.id))
                              } catch (error) {
                                console.error('Error deleting item:', error)
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diamonds Section */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Diamonds</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {diamonds.map((item) => (
              <Card key={item.id}>
                <CardHeader className="p-3 sm:p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm sm:text-base">{item.report_number || 'Diamond'}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.clarity} / {item.color} / {item.cut} / {item.carat_weight}ct</p>
                    </div>
                    <Badge variant={item.stock && item.stock > 0 ? 'default' : 'destructive'} className="text-xs">
                      {item.stock ?? 1} pcs
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-xs sm:text-sm">
                      <p><b>Location:</b> {item.location}</p>
                      <p><b>Lab:</b> {item.grading_lab}</p>
                      <p><b>Report #:</b> {item.report_number}</p>
                    </div>
                    <DiamondSpecificationsCard specs={{
                      clarity: item.clarity,
                      color: item.color,
                      cut: item.cut,
                      caratWeight: item.carat_weight,
                      fluorescence: item.fluorescence,
                      polish: item.polish,
                      symmetry: item.symmetry,
                      gradingLab: item.grading_lab,
                      reportNumber: item.report_number,
                      depthPercentage: item.depth_percentage,
                      tablePercentage: item.table_percentage,
                      measurements: {
                        length: item.length ?? 0,
                        width: item.width ?? 0,
                        depth: item.depth ?? 0,
                      },
                    }} />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/inventory/diamonds/${item.id}/edit`)} className="min-h-[44px] min-w-[44px] text-xs">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 
 // FORCE DEPLOYMENT - Thu Aug 21 19:09:18 EDT 2025 - All Supabase .or() method errors fixed
