"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, Trash2, AlertTriangle, CheckCircle, Ruler } from "lucide-react"

interface MeasurementChecksProps {
  inspectionId: string
}

// Mock measurement data
const mockMeasurements = [
  {
    id: "measure-1",
    name: "Ring Size",
    expected: "7",
    actual: "7.1",
    unit: "US Size",
    tolerance: "±0.25",
    status: "pass",
    notes: "",
  },
  {
    id: "measure-2",
    name: "Band Width",
    expected: "2.0",
    actual: "2.1",
    unit: "mm",
    tolerance: "±0.2",
    status: "pass",
    notes: "Slightly wider than spec but within tolerance",
  },
  {
    id: "measure-3",
    name: "Center Stone Diameter",
    expected: "6.5",
    actual: "6.4",
    unit: "mm",
    tolerance: "±0.1",
    status: "pass",
    notes: "",
  },
  {
    id: "measure-4",
    name: "Total Weight",
    expected: "4.2",
    actual: "3.9",
    unit: "g",
    tolerance: "±0.3",
    status: "fail",
    notes: "Weight is below minimum tolerance",
  },
  {
    id: "measure-5",
    name: "Prong Height",
    expected: "1.2",
    actual: "1.1",
    unit: "mm",
    tolerance: "±0.1",
    status: "pass",
    notes: "",
  },
]

export function MeasurementChecks({ inspectionId }: MeasurementChecksProps) {
  const [measurements, setMeasurements] = useState(mockMeasurements)
  const [newMeasurement, setNewMeasurement] = useState({
    name: "",
    expected: "",
    actual: "",
    unit: "mm",
    tolerance: "",
    notes: "",
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(measurements.filter((m) => m.id !== id))
  }

  const handleAddMeasurement = () => {
    // Validate form
    if (!newMeasurement.name || !newMeasurement.expected || !newMeasurement.actual) {
      return
    }

    // Calculate status
    const expected = Number.parseFloat(newMeasurement.expected)
    const actual = Number.parseFloat(newMeasurement.actual)
    const tolerance = Number.parseFloat(newMeasurement.tolerance || "0")

    const status = Math.abs(actual - expected) <= tolerance ? "pass" : "fail"

    // Add new measurement
    const id = `measure-${Date.now()}`
    setMeasurements([
      ...measurements,
      {
        id,
        ...newMeasurement,
        status,
      },
    ])

    // Reset form
    setNewMeasurement({
      name: "",
      expected: "",
      actual: "",
      unit: "mm",
      tolerance: "",
      notes: "",
    })
    setShowAddForm(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Pass
          </Badge>
        )
      case "fail":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Fail
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const saveMeasurements = () => {
    // Logic to save measurements
    console.log("Saving measurements for inspection", inspectionId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Measurement Checks</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="h-4 w-4" />
                Add Measurement
              </Button>
              <Button onClick={saveMeasurements} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
          <CardDescription>Record and verify all required measurements</CardDescription>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add New Measurement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="measurement-name">Measurement Name</Label>
                    <Input
                      id="measurement-name"
                      value={newMeasurement.name}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, name: e.target.value })}
                      placeholder="e.g. Band Width"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="measurement-unit">Unit</Label>
                    <select
                      id="measurement-unit"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newMeasurement.unit}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, unit: e.target.value })}
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                      <option value="g">g</option>
                      <option value="ct">ct</option>
                      <option value="US Size">US Size</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="measurement-expected">Expected Value</Label>
                    <Input
                      id="measurement-expected"
                      type="number"
                      step="0.01"
                      value={newMeasurement.expected}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, expected: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="measurement-tolerance">Tolerance (±)</Label>
                    <Input
                      id="measurement-tolerance"
                      type="number"
                      step="0.01"
                      value={newMeasurement.tolerance}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, tolerance: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="measurement-actual">Actual Value</Label>
                    <Input
                      id="measurement-actual"
                      type="number"
                      step="0.01"
                      value={newMeasurement.actual}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, actual: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="measurement-notes">Notes</Label>
                    <Textarea
                      id="measurement-notes"
                      value={newMeasurement.notes}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                      placeholder="Optional notes about this measurement"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMeasurement}>Add Measurement</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {measurements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Ruler className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">No measurements recorded</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Add measurements to verify the item meets specifications
              </p>
              <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                Add First Measurement
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Measurement</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Tolerance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measurements.map((measurement) => (
                    <TableRow key={measurement.id}>
                      <TableCell className="font-medium">
                        {measurement.name}
                        {measurement.notes && <p className="text-xs text-muted-foreground mt-1">{measurement.notes}</p>}
                      </TableCell>
                      <TableCell>
                        {measurement.expected} {measurement.unit}
                      </TableCell>
                      <TableCell>
                        {measurement.actual} {measurement.unit}
                      </TableCell>
                      <TableCell>{measurement.tolerance}</TableCell>
                      <TableCell>{getStatusBadge(measurement.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMeasurement(measurement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
