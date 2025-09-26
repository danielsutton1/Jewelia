"use client"

import { useState } from "react"
import { PlusCircle, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

// Sample field data (simplified version)
const getFieldsForDataSource = (dataSource: string | null) => {
  if (!dataSource) return []

  const fields: any[] = []
  const sourceData = {
    sales: ["Order ID", "Order Date", "Customer ID", "Total Amount", "Status"],
    inventory: ["Product ID", "Name", "Category", "Price", "Stock Level"],
    customers: ["Customer ID", "Name", "Email", "Segment", "Created Date"],
    marketing: ["Campaign ID", "Name", "Channel", "Start Date", "Budget"],
    finance: ["Transaction ID", "Date", "Amount", "Type", "Account"],
  }

  return (sourceData[dataSource as keyof typeof sourceData] || []).map((name) => {
    const id = name.toLowerCase().replace(/\s+/g, "_")
    const type = name.includes("Date")
      ? "date"
      : name.includes("Amount") || name.includes("Price") || name.includes("Budget")
        ? "number"
        : "string"
    return { id, name, type }
  })
}

const operators = {
  string: ["equals", "contains", "starts with", "ends with", "is empty", "is not empty"],
  number: ["equals", "greater than", "less than", "between", "is empty", "is not empty"],
  date: ["equals", "after", "before", "between", "is empty", "is not empty"],
}

interface FilterBuilderProps {
  dataSource: string | null
  filters: any[]
  onUpdateFilters: (filters: any[]) => void
}

export function FilterBuilder({ dataSource, filters, onUpdateFilters }: FilterBuilderProps) {
  const [newFilter, setNewFilter] = useState<{
    field: string
    operator: string
    value: string | number | Date | null
    value2: string | number | Date | null
  }>({
    field: "",
    operator: "",
    value: null,
    value2: null,
  })

  const fields = getFieldsForDataSource(dataSource)

  const handleAddFilter = () => {
    if (!newFilter.field || !newFilter.operator) return

    const fieldObj = fields.find((f) => f.id === newFilter.field)

    onUpdateFilters([
      ...filters,
      {
        id: `filter_${Date.now()}`,
        field: newFilter.field,
        fieldName: fieldObj?.name || newFilter.field,
        fieldType: fieldObj?.type || "string",
        operator: newFilter.operator,
        value: newFilter.value,
        value2: newFilter.value2,
      },
    ])

    setNewFilter({
      field: "",
      operator: "",
      value: null,
      value2: null,
    })
  }

  const handleRemoveFilter = (filterId: string) => {
    onUpdateFilters(filters.filter((filter) => filter.id !== filterId))
  }

  const getSelectedFieldType = () => {
    const field = fields.find((f) => f.id === newFilter.field)
    return field?.type || "string"
  }

  const renderValueInput = () => {
    const fieldType = getSelectedFieldType()

    if (newFilter.operator === "is empty" || newFilter.operator === "is not empty") {
      return null
    }

    if (fieldType === "date") {
      return (
        <div className="flex flex-col space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <ChevronDown className="mr-2 h-4 w-4" />
                {newFilter.value ? format(newFilter.value as Date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newFilter.value as Date}
                onSelect={(date) => setNewFilter({ ...newFilter, value: date || null })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {newFilter.operator === "between" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {newFilter.value2 ? format(newFilter.value2 as Date, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newFilter.value2 as Date}
                  onSelect={(date) => setNewFilter({ ...newFilter, value2: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )
    }

    if (fieldType === "number") {
      return (
        <div className="flex flex-col space-y-2">
          <Input
            type="number"
            placeholder="Enter value"
            value={(newFilter.value as string) || ""}
            onChange={(e) => setNewFilter({ ...newFilter, value: Number.parseFloat(e.target.value) || 0 })}
          />

          {newFilter.operator === "between" && (
            <Input
              type="number"
              placeholder="Enter second value"
              value={(newFilter.value2 as string) || ""}
              onChange={(e) => setNewFilter({ ...newFilter, value2: Number.parseFloat(e.target.value) || 0 })}
            />
          )}
        </div>
      )
    }

    return (
      <Input
        placeholder="Enter value"
        value={(newFilter.value as string) || ""}
        onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
      />
    )
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
        <h3 className="font-medium">Add Filter</h3>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Field</label>
                <Select value={newFilter.field} onValueChange={(value) => setNewFilter({ ...newFilter, field: value })}>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Operator</label>
                <Select
                  value={newFilter.operator}
                  onValueChange={(value) => setNewFilter({ ...newFilter, operator: value })}
                  disabled={!newFilter.field}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {newFilter.field &&
                      operators[getSelectedFieldType() as keyof typeof operators].map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Value</label>
              {renderValueInput()}
            </div>

            <Button
              className="mt-4 w-full"
              onClick={handleAddFilter}
              disabled={!newFilter.field || !newFilter.operator}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Filter
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Applied Filters</h3>
        {filters.length === 0 ? (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No filters applied. Add filters above.
          </div>
        ) : (
          <div className="space-y-2">
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-1 flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{filter.fieldName}</span>
                    <Badge variant="outline" className="capitalize">
                      {filter.fieldType}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{filter.operator}</span>
                    {filter.operator !== "is empty" && filter.operator !== "is not empty" && (
                      <>
                        <span className="mx-1">:</span>
                        <span>
                          {filter.fieldType === "date" ? format(new Date(filter.value), "PPP") : filter.value}
                        </span>
                        {filter.operator === "between" && (
                          <>
                            <span className="mx-1">and</span>
                            <span>
                              {filter.fieldType === "date" ? format(new Date(filter.value2), "PPP") : filter.value2}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveFilter(filter.id)}>
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
