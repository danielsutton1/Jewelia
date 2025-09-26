"use client"

import { useState } from "react"
import { PlusCircle, X, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Sample field data (simplified version)
const getNumericFieldsForDataSource = (dataSource: string | null, selectedFields: string[]) => {
  if (!dataSource) return []

  // This is a simplified version - in a real app, you'd filter based on the actual selected fields
  const sourceData = {
    sales: [
      { id: "total_amount", name: "Total Amount", type: "number" },
      { id: "quantity", name: "Quantity", type: "number" },
      { id: "unit_price", name: "Unit Price", type: "number" },
      { id: "discount", name: "Discount", type: "number" },
    ],
    inventory: [
      { id: "price", name: "Price", type: "number" },
      { id: "cost", name: "Cost", type: "number" },
      { id: "quantity", name: "Quantity", type: "number" },
      { id: "reorder_level", name: "Reorder Level", type: "number" },
    ],
    customers: [
      { id: "lifetime_value", name: "Lifetime Value", type: "number" },
      { id: "order_count", name: "Order Count", type: "number" },
      { id: "average_order", name: "Average Order", type: "number" },
    ],
    marketing: [
      { id: "budget", name: "Budget", type: "number" },
      { id: "impressions", name: "Impressions", type: "number" },
      { id: "clicks", name: "Clicks", type: "number" },
      { id: "conversions", name: "Conversions", type: "number" },
      { id: "cost", name: "Cost", type: "number" },
    ],
    finance: [
      { id: "amount", name: "Amount", type: "number" },
      { id: "balance", name: "Balance", type: "number" },
      { id: "tax", name: "Tax", type: "number" },
      { id: "fees", name: "Fees", type: "number" },
    ],
  }

  return sourceData[dataSource as keyof typeof sourceData] || []
}

const calculationTypes = [
  { id: "sum", name: "Sum", description: "Calculate the sum of values" },
  { id: "average", name: "Average", description: "Calculate the average of values" },
  { id: "count", name: "Count", description: "Count the number of values" },
  { id: "min", name: "Minimum", description: "Find the minimum value" },
  { id: "max", name: "Maximum", description: "Find the maximum value" },
  { id: "custom", name: "Custom Formula", description: "Create a custom calculation" },
]

interface CalculationFormulasProps {
  dataSource: string | null
  selectedFields: string[]
  calculations: any[]
  onUpdateCalculations: (calculations: any[]) => void
}

export function CalculationFormulas({
  dataSource,
  selectedFields,
  calculations,
  onUpdateCalculations,
}: CalculationFormulasProps) {
  const [newCalculation, setNewCalculation] = useState<{
    name: string
    type: string
    field: string
    formula: string
  }>({
    name: "",
    type: "",
    field: "",
    formula: "",
  })

  const fields = getNumericFieldsForDataSource(dataSource, selectedFields)

  const handleAddCalculation = () => {
    if (!newCalculation.name || !newCalculation.type) return

    let calculationObj = {
      id: `calc_${Date.now()}`,
      name: newCalculation.name,
      type: newCalculation.type,
      field: newCalculation.field,
      formula: newCalculation.formula,
    }

    if (newCalculation.type === "custom") {
      calculationObj = {
        ...calculationObj,
        field: "",
      }
    } else {
      calculationObj = {
        ...calculationObj,
        formula: "",
      }
    }

    onUpdateCalculations([...calculations, calculationObj])

    setNewCalculation({
      name: "",
      type: "",
      field: "",
      formula: "",
    })
  }

  const handleRemoveCalculation = (calculationId: string) => {
    onUpdateCalculations(calculations.filter((calc) => calc.id !== calculationId))
  }

  if (!dataSource) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        Please select a data source first
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Add Calculation</h3>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Calculation Name</label>
                <Input
                  placeholder="e.g., Total Revenue, Average Order Value"
                  value={newCalculation.name}
                  onChange={(e) => setNewCalculation({ ...newCalculation, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Calculation Type</label>
                <Select
                  value={newCalculation.type}
                  onValueChange={(value) => setNewCalculation({ ...newCalculation, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select calculation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {calculationTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex flex-col">
                          <span>{type.name}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newCalculation.type && newCalculation.type !== "custom" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field</label>
                  <Select
                    value={newCalculation.field}
                    onValueChange={(value) => setNewCalculation({ ...newCalculation, field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : newCalculation.type === "custom" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Formula</label>
                  <Input
                    placeholder="e.g., [Total Amount] - [Discount]"
                    value={newCalculation.formula}
                    onChange={(e) => setNewCalculation({ ...newCalculation, formula: e.target.value })}
                  />
                  <div className="text-xs text-muted-foreground">
                    Use field names in square brackets, e.g., [Field Name]
                  </div>
                </div>
              ) : null}

              <Button
                className="w-full"
                onClick={handleAddCalculation}
                disabled={
                  !newCalculation.name ||
                  !newCalculation.type ||
                  (newCalculation.type !== "custom" && !newCalculation.field) ||
                  (newCalculation.type === "custom" && !newCalculation.formula)
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Calculation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Applied Calculations</h3>
        {calculations.length === 0 ? (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No calculations added. Add calculations above.
          </div>
        ) : (
          <div className="space-y-2">
            {calculations.map((calc) => (
              <div key={calc.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-1 flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{calc.name}</span>
                    <Badge variant="outline" className="capitalize">
                      {calc.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {calc.type === "custom" ? (
                      <span>Formula: {calc.formula}</span>
                    ) : (
                      <span>
                        {calc.type} of {calc.fieldName}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveCalculation(calc.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
