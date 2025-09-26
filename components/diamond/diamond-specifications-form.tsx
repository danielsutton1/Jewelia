import { DiamondSpecifications } from './diamond-specifications-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

interface DiamondSpecificationsFormProps {
  specs: DiamondSpecifications
  onChange: (specs: DiamondSpecifications) => void
}

interface ValidationErrors {
  clarity?: string
  color?: string
  cut?: string
  caratWeight?: string
  depthPercentage?: string
  tablePercentage?: string
  measurements?: {
    length?: string
    width?: string
    depth?: string
  }
}

export function DiamondSpecificationsForm({ specs, onChange }: DiamondSpecificationsFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = (field: keyof DiamondSpecifications, value: any): string | undefined => {
    switch (field) {
      case 'clarity':
        if (!value) return 'Clarity is required'
        if (!['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'].includes(value)) {
          return 'Invalid clarity grade'
        }
        break
      case 'color':
        if (!value) return 'Color is required'
        if (!['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].includes(value)) {
          return 'Invalid color grade'
        }
        break
      case 'cut':
        if (!value) return 'Cut is required'
        if (!['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].includes(value)) {
          return 'Invalid cut grade'
        }
        break
      case 'caratWeight':
        if (!value) return 'Carat weight is required'
        if (isNaN(value) || value <= 0) return 'Carat weight must be greater than 0'
        if (value > 100) return 'Carat weight seems unusually high'
        break
      case 'depthPercentage':
        if (value && (isNaN(value) || value < 0 || value > 100)) {
          return 'Depth percentage must be between 0 and 100'
        }
        break
      case 'tablePercentage':
        if (value && (isNaN(value) || value < 0 || value > 100)) {
          return 'Table percentage must be between 0 and 100'
        }
        break
      case 'measurements':
        if (value) {
          const { length, width, depth } = value
          if (length && (isNaN(length) || length <= 0)) {
            return 'Length must be greater than 0'
          }
          if (width && (isNaN(width) || width <= 0)) {
            return 'Width must be greater than 0'
          }
          if (depth && (isNaN(depth) || depth <= 0)) {
            return 'Depth must be greater than 0'
          }
        }
        break
    }
    return undefined
  }

  const handleChange = (field: keyof DiamondSpecifications, value: any) => {
    const error = validateField(field, value)
    setErrors({ ...errors, [field]: error })
    
    if (!error) {
      onChange({ ...specs, [field]: value })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diamond Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clarity">Clarity</Label>
              <Select
                value={specs.clarity}
                onValueChange={(value) => handleChange('clarity', value)}
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
              {errors.clarity && (
                <p className="text-sm text-red-500">{errors.clarity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={specs.color}
                onValueChange={(value) => handleChange('color', value)}
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
              {errors.color && (
                <p className="text-sm text-red-500">{errors.color}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cut">Cut</Label>
              <Select
                value={specs.cut}
                onValueChange={(value) => handleChange('cut', value)}
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
              {errors.cut && (
                <p className="text-sm text-red-500">{errors.cut}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caratWeight">Carat Weight</Label>
              <Input
                id="caratWeight"
                type="number"
                step="0.01"
                value={specs.caratWeight}
                onChange={(e) => handleChange('caratWeight', parseFloat(e.target.value))}
              />
              {errors.caratWeight && (
                <p className="text-sm text-red-500">{errors.caratWeight}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fluorescence">Fluorescence</Label>
              <Select
                value={specs.fluorescence}
                onValueChange={(value) => handleChange('fluorescence', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fluorescence" />
                </SelectTrigger>
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
              <Label htmlFor="polish">Polish</Label>
              <Select
                value={specs.polish}
                onValueChange={(value) => handleChange('polish', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select polish" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symmetry">Symmetry</Label>
              <Select
                value={specs.symmetry}
                onValueChange={(value) => handleChange('symmetry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select symmetry" />
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
              <Label htmlFor="gradingLab">Grading Lab</Label>
              <Select
                value={specs.gradingLab}
                onValueChange={(value) => handleChange('gradingLab', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grading lab" />
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

          <div className="space-y-2">
            <Label htmlFor="reportNumber">Report Number</Label>
            <Input
              id="reportNumber"
              value={specs.reportNumber}
              onChange={(e) => handleChange('reportNumber', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="depthPercentage">Depth %</Label>
              <Input
                id="depthPercentage"
                type="number"
                step="0.1"
                value={specs.depthPercentage}
                onChange={(e) => handleChange('depthPercentage', parseFloat(e.target.value))}
              />
              {errors.depthPercentage && (
                <p className="text-sm text-red-500">{errors.depthPercentage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tablePercentage">Table %</Label>
              <Input
                id="tablePercentage"
                type="number"
                step="0.1"
                value={specs.tablePercentage}
                onChange={(e) => handleChange('tablePercentage', parseFloat(e.target.value))}
              />
              {errors.tablePercentage && (
                <p className="text-sm text-red-500">{errors.tablePercentage}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (mm)</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                value={specs.measurements?.length}
                onChange={(e) => handleChange('measurements', {
                  ...specs.measurements,
                  length: parseFloat(e.target.value)
                })}
              />
              {errors.measurements?.length && (
                <p className="text-sm text-red-500">{errors.measurements.length}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width (mm)</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                value={specs.measurements?.width}
                onChange={(e) => handleChange('measurements', {
                  ...specs.measurements,
                  width: parseFloat(e.target.value)
                })}
              />
              {errors.measurements?.width && (
                <p className="text-sm text-red-500">{errors.measurements.width}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="depth">Depth (mm)</Label>
              <Input
                id="depth"
                type="number"
                step="0.01"
                value={specs.measurements?.depth}
                onChange={(e) => handleChange('measurements', {
                  ...specs.measurements,
                  depth: parseFloat(e.target.value)
                })}
              />
              {errors.measurements?.depth && (
                <p className="text-sm text-red-500">{errors.measurements.depth}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
 
 