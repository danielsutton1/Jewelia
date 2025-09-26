"use client"
import { useApi } from '@/lib/api-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Diamond } from '@/lib/api-service'

export default function EditDiamondPage() {
  const api = useApi() as any
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [diamond, setDiamond] = useState<Diamond | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadDiamond = async () => {
      try {
        const data = await api.diamonds.get(id)
        setDiamond(data)
      } catch (error) {
        alert('Error loading diamond')
      } finally {
        setLoading(false)
      }
    }
    loadDiamond()
  }, [id])

  const handleChange = (field: keyof Diamond, value: any) => {
    if (!diamond) return
    setDiamond({ ...diamond, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!diamond) return
    setSaving(true)
    try {
      await api.diamonds.update(diamond.id, diamond)
      router.push('/inventory/diamonds')
    } catch (error) {
      alert('Error updating diamond')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!diamond) return <div>Diamond not found</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Diamond</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Diamond Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Clarity</Label>
                <Select value={diamond.clarity} onValueChange={v => handleChange('clarity', v)}>
                  <SelectTrigger><SelectValue placeholder="Select clarity" /></SelectTrigger>
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
                <Select value={diamond.color} onValueChange={v => handleChange('color', v)}>
                  <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
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
                <Select value={diamond.cut} onValueChange={v => handleChange('cut', v)}>
                  <SelectTrigger><SelectValue placeholder="Select cut" /></SelectTrigger>
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
                <Label>Carat Weight</Label>
                <Input type="number" step="0.01" value={diamond.carat_weight} onChange={e => handleChange('carat_weight', parseFloat(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Fluorescence</Label>
                <Select value={diamond.fluorescence} onValueChange={v => handleChange('fluorescence', v)}>
                  <SelectTrigger><SelectValue placeholder="Select fluorescence" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Faint">Faint</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Strong">Strong</SelectItem>
                    <SelectItem value="Very Strong">Very Strong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Polish</Label>
                <Select value={diamond.polish} onValueChange={v => handleChange('polish', v)}>
                  <SelectTrigger><SelectValue placeholder="Select polish" /></SelectTrigger>
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
                <Label>Symmetry</Label>
                <Select value={diamond.symmetry} onValueChange={v => handleChange('symmetry', v)}>
                  <SelectTrigger><SelectValue placeholder="Select symmetry" /></SelectTrigger>
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
                <Label>Grading Lab</Label>
                <Select value={diamond.grading_lab} onValueChange={v => handleChange('grading_lab', v)}>
                  <SelectTrigger><SelectValue placeholder="Select grading lab" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GIA">GIA</SelectItem>
                    <SelectItem value="AGS">AGS</SelectItem>
                    <SelectItem value="IGI">IGI</SelectItem>
                    <SelectItem value="GCAL">GCAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Report Number</Label>
                <Input value={diamond.report_number} onChange={e => handleChange('report_number', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Depth %</Label>
                <Input type="number" step="0.1" value={diamond.depth_percentage ?? ''} onChange={e => handleChange('depth_percentage', e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Table %</Label>
                <Input type="number" step="0.1" value={diamond.table_percentage ?? ''} onChange={e => handleChange('table_percentage', e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Length (mm)</Label>
                <Input type="number" step="0.01" value={diamond.length ?? ''} onChange={e => handleChange('length', e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Width (mm)</Label>
                <Input type="number" step="0.01" value={diamond.width ?? ''} onChange={e => handleChange('width', e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Depth (mm)</Label>
                <Input type="number" step="0.01" value={diamond.depth ?? ''} onChange={e => handleChange('depth', e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={diamond.location} onChange={e => handleChange('location', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input value={diamond.status} onChange={e => handleChange('status', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min={1} value={diamond.stock ?? 1} onChange={e => handleChange('stock', parseInt(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  )
} 
 
 