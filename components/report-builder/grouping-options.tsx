"use client"

import { DotIcon as DragHandleDots2Icon, PlusCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Sample field data (simplified version)
const getFieldsForDataSource = (dataSource: string | null, selectedFields: string[]) => {
  if (!dataSource) return []

  // This is a simplified version - in a real app, you'd filter based on the actual selected fields
  const sourceData = {
    sales: [
      { id: "order_date", name: "Order Date", type: "date" },
      { id: "status", name: "Status", type: "string" },
      { id: "payment_method", name: "Payment Method", type: "string" },
    ],
    inventory: [
      { id: "category", name: "Category", type: "string" },
      { id: "supplier", name: "Supplier", type: "string" },
      { id: "created_date", name: "Created Date", type: "date" },
    ],
    customers: [
      { id: "segment", name: "Segment", type: "string" },
      { id: "country", name: "Country", type: "string" },
      { id: "created_date", name: "Created Date", type: "date" },
    ],
    marketing: [
      { id: "campaign", name: "Campaign", type: "string" },
      { id: "channel", name: "Channel", type: "string" },
      { id: "start_date", name: "Start Date", type: "date" },
    ],
    finance: [
      { id: "transaction_type", name: "Transaction Type", type: "string" },
      { id: "account", name: "Account", type: "string" },
      { id: "transaction_date", name: "Transaction Date", type: "date" },
    ],
  }

  return sourceData[dataSource as keyof typeof sourceData] || []
}

interface GroupingOptionsProps {
  dataSource: string | null
  selectedFields: string[]
  groupings: string[]
  onUpdateGroupings: (groupings: string[]) => void
}

export function GroupingOptions({ dataSource, selectedFields, groupings, onUpdateGroupings }: GroupingOptionsProps) {
  const fields = getFieldsForDataSource(dataSource, selectedFields)

  const handleAddGrouping = (fieldId: string) => {
    if (groupings.includes(fieldId)) return
    onUpdateGroupings([...groupings, fieldId])
  }

  const handleRemoveGrouping = (fieldId: string) => {
    onUpdateGroupings(groupings.filter((id) => id !== fieldId))
  }

  if (!dataSource) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        Please select a data source first
      </div>
    )
  }

  const availableFields = fields.filter((field) => !groupings.includes(field.id))
  const selectedGroupings = fields.filter((field) => groupings.includes(field.id))

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Add Grouping</h3>
        <div className="flex items-center space-x-2">
          <Select disabled={availableFields.length === 0} onValueChange={handleAddGrouping}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select field to group by" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={availableFields.length === 0}
            onClick={() => availableFields.length > 0 && handleAddGrouping(availableFields[0].id)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Group By</h3>
        {selectedGroupings.length === 0 ? (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No groupings applied. Add groupings above.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedGroupings.map((field) => (
              <div key={field.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center space-x-2">
                  <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{field.name}</span>
                  <Badge variant="outline" className="capitalize">
                    {field.type}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveGrouping(field.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Grouping Options</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Grouping</label>
            <Select defaultValue="month">
              <SelectTrigger>
                <SelectValue placeholder="Select date grouping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort Order</label>
            <Select defaultValue="asc">
              <SelectTrigger>
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
