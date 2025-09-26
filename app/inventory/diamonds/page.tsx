"use client"
import { useApi } from '@/lib/api-service'
import { DiamondSpecificationsCard } from '@/components/diamond/diamond-specifications-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import type { Diamond } from '@/lib/api-service'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DiamondInventoryPage() {
  const api = useApi() as any // fallback for demo mode
  const router = useRouter()
  const [filters, setFilters] = useState({
    clarity: '',
    color: '',
    cut: '',
    minCarat: '',
    maxCarat: '',
    gradingLab: '',
  })
  const [diamonds, setDiamonds] = useState<Diamond[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDiamonds = async () => {
      try {
        const data = await api.diamonds.list()
        setDiamonds(data)
      } catch (error) {
        console.error('Error loading diamonds:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDiamonds()
  }, [])

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value })
  }

  // Filtering logic
  const filteredDiamonds: Diamond[] = diamonds.filter((d) => {
    if (filters.clarity && d.clarity !== filters.clarity) return false
    if (filters.color && d.color !== filters.color) return false
    if (filters.cut && d.cut !== filters.cut) return false
    if (filters.gradingLab && d.grading_lab !== filters.gradingLab) return false
    if (filters.minCarat && d.carat_weight < parseFloat(filters.minCarat)) return false
    if (filters.maxCarat && d.carat_weight > parseFloat(filters.maxCarat)) return false
    return true
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Diamond Inventory</h1>
        <Link href="/inventory/diamonds/new">
          <Button>Add Diamond</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Clarity</Label>
              <Select
                value={filters.clarity}
                onValueChange={(value) => handleFilterChange('clarity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FL">FL</SelectItem>
                  <SelectItem value="IF">IF</SelectItem>
                  <SelectItem value="VVS1">VVS1</SelectItem>
                  <SelectItem value="VVS2">VVS2</SelectItem>
                  <SelectItem value="VS1">VS1</SelectItem>
                  <SelectItem value="VS2">VS2</SelectItem>
                  <SelectItem value="SI1">SI1</SelectItem>
                  <SelectItem value="SI2">SI2</SelectItem>
                  <SelectItem value="I1">I1</SelectItem>
                  <SelectItem value="I2">I2</SelectItem>
                  <SelectItem value="I3">I3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Select
                value={filters.color}
                onValueChange={(value) => handleFilterChange('color', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="H">H</SelectItem>
                  <SelectItem value="I">I</SelectItem>
                  <SelectItem value="J">J</SelectItem>
                  <SelectItem value="K">K</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cut</Label>
              <Select
                value={filters.cut}
                onValueChange={(value) => handleFilterChange('cut', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Very Good">Very Good</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Carat</Label>
              <Input
                type="number"
                step="0.01"
                value={filters.minCarat}
                onChange={(e) => handleFilterChange('minCarat', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Carat</Label>
              <Input
                type="number"
                step="0.01"
                value={filters.maxCarat}
                onChange={(e) => handleFilterChange('maxCarat', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Grading Lab</Label>
              <Select
                value={filters.gradingLab}
                onValueChange={(value) => handleFilterChange('gradingLab', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GIA">GIA</SelectItem>
                  <SelectItem value="AGS">AGS</SelectItem>
                  <SelectItem value="IGI">IGI</SelectItem>
                  <SelectItem value="GCAL">GCAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDiamonds.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{item.report_number || 'Diamond'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.clarity} / {item.color} / {item.cut} / {item.carat_weight}ct</p>
                </div>
                <Badge variant={item.stock && item.stock > 0 ? 'default' : 'destructive'}>
                  {item.stock ?? 1} pcs
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
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
                  <Button variant="outline" size="sm" onClick={() => router.push(`/inventory/diamonds/${item.id}/edit`)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={async () => {
                    if (confirm('Are you sure you want to delete this diamond?')) {
                      try {
                        await api.diamonds.delete(item.id)
                        // Remove from local state
                        setDiamonds((prev: any[]) => prev.filter((d) => d.id !== item.id))
                      } catch (error) {
                        alert('Error deleting diamond')
                      }
                    }
                  }}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
 
 