"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { ServiceRequestSpecification } from "@/types/service-request"

interface ServiceSpecificationsProps {
  specifications: ServiceRequestSpecification[]
  onChange: (specifications: ServiceRequestSpecification[]) => void
}

export function ServiceSpecifications({ specifications, onChange }: ServiceSpecificationsProps) {
  const [newSpecName, setNewSpecName] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [newSpecUnit, setNewSpecUnit] = useState("")

  const addSpecification = () => {
    if (newSpecName.trim() === "" || newSpecValue.trim() === "") return

    const newSpec: ServiceRequestSpecification = {
      id: `spec-${Date.now()}`,
      name: newSpecName,
      value: newSpecValue,
      unit: newSpecUnit.trim() === "" ? undefined : newSpecUnit,
    }

    onChange([...specifications, newSpec])

    // Clear the form
    setNewSpecName("")
    setNewSpecValue("")
    setNewSpecUnit("")
  }

  const removeSpecification = (id: string) => {
    onChange(specifications.filter((spec) => spec.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {specifications.map((spec) => (
          <div key={spec.id} className="flex items-center space-x-2 p-3 border rounded-md">
            <div className="flex-grow grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Name</Label>
                <div className="font-medium">{spec.name}</div>
              </div>
              <div>
                <Label className="text-xs">Value</Label>
                <div className="font-medium">{spec.value}</div>
              </div>
              <div>
                <Label className="text-xs">Unit</Label>
                <div className="font-medium">{spec.unit || "-"}</div>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeSpecification(spec.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}
      </div>

      <div className="border rounded-md p-4">
        <h4 className="text-sm font-medium mb-3">Add Specification</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="spec-name">Name</Label>
            <Input
              id="spec-name"
              placeholder="e.g., Metal Type"
              value={newSpecName}
              onChange={(e) => setNewSpecName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="spec-value">Value</Label>
            <Input
              id="spec-value"
              placeholder="e.g., 14K Yellow Gold"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="spec-unit">Unit (optional)</Label>
            <Input
              id="spec-unit"
              placeholder="e.g., mm, grams"
              value={newSpecUnit}
              onChange={(e) => setNewSpecUnit(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          className="mt-3"
          onClick={addSpecification}
          disabled={newSpecName.trim() === "" || newSpecValue.trim() === ""}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Specification
        </Button>
      </div>
    </div>
  )
}
