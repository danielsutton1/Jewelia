"use client"

import { useState, useEffect } from "react"
import { Search, DotIcon as DragHandleDots2Icon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

// Sample field data
const fieldData: Record<string, any> = {
  sales: {
    orders: [
      { id: "order_id", name: "Order ID", type: "string" },
      { id: "order_date", name: "Order Date", type: "date" },
      { id: "customer_id", name: "Customer ID", type: "string" },
      { id: "total_amount", name: "Total Amount", type: "number" },
      { id: "status", name: "Status", type: "string" },
      { id: "payment_method", name: "Payment Method", type: "string" },
    ],
    order_items: [
      { id: "order_item_id", name: "Order Item ID", type: "string" },
      { id: "order_id", name: "Order ID", type: "string" },
      { id: "product_id", name: "Product ID", type: "string" },
      { id: "quantity", name: "Quantity", type: "number" },
      { id: "unit_price", name: "Unit Price", type: "number" },
      { id: "discount", name: "Discount", type: "number" },
    ],
    payments: [
      { id: "payment_id", name: "Payment ID", type: "string" },
      { id: "order_id", name: "Order ID", type: "string" },
      { id: "payment_date", name: "Payment Date", type: "date" },
      { id: "amount", name: "Amount", type: "number" },
      { id: "payment_method", name: "Payment Method", type: "string" },
      { id: "status", name: "Status", type: "string" },
    ],
  },
  inventory: {
    products: [
      { id: "product_id", name: "Product ID", type: "string" },
      { id: "name", name: "Name", type: "string" },
      { id: "description", name: "Description", type: "string" },
      { id: "category_id", name: "Category ID", type: "string" },
      { id: "price", name: "Price", type: "number" },
      { id: "cost", name: "Cost", type: "number" },
    ],
    categories: [
      { id: "category_id", name: "Category ID", type: "string" },
      { id: "name", name: "Name", type: "string" },
      { id: "parent_category_id", name: "Parent Category ID", type: "string" },
    ],
    stock_levels: [
      { id: "stock_id", name: "Stock ID", type: "string" },
      { id: "product_id", name: "Product ID", type: "string" },
      { id: "location_id", name: "Location ID", type: "string" },
      { id: "quantity", name: "Quantity", type: "number" },
      { id: "last_updated", name: "Last Updated", type: "date" },
    ],
  },
  customers: {
    customers: [
      { id: "customer_id", name: "Customer ID", type: "string" },
      { id: "first_name", name: "First Name", type: "string" },
      { id: "last_name", name: "Last Name", type: "string" },
      { id: "email", name: "Email", type: "string" },
      { id: "phone", name: "Phone", type: "string" },
      { id: "created_at", name: "Created At", type: "date" },
    ],
    segments: [
      { id: "segment_id", name: "Segment ID", type: "string" },
      { id: "name", name: "Name", type: "string" },
      { id: "description", name: "Description", type: "string" },
    ],
    addresses: [
      { id: "address_id", name: "Address ID", type: "string" },
      { id: "customer_id", name: "Customer ID", type: "string" },
      { id: "address_line_1", name: "Address Line 1", type: "string" },
      { id: "address_line_2", name: "Address Line 2", type: "string" },
      { id: "city", name: "City", type: "string" },
      { id: "state", name: "State", type: "string" },
      { id: "postal_code", name: "Postal Code", type: "string" },
      { id: "country", name: "Country", type: "string" },
    ],
  },
  marketing: {
    campaigns: [
      { id: "campaign_id", name: "Campaign ID", type: "string" },
      { id: "name", name: "Name", type: "string" },
      { id: "start_date", name: "Start Date", type: "date" },
      { id: "end_date", name: "End Date", type: "date" },
      { id: "budget", name: "Budget", type: "number" },
      { id: "status", name: "Status", type: "string" },
    ],
    channel_performance: [
      { id: "performance_id", name: "Performance ID", type: "string" },
      { id: "campaign_id", name: "Campaign ID", type: "string" },
      { id: "channel", name: "Channel", type: "string" },
      { id: "impressions", name: "Impressions", type: "number" },
      { id: "clicks", name: "Clicks", type: "number" },
      { id: "conversions", name: "Conversions", type: "number" },
      { id: "cost", name: "Cost", type: "number" },
    ],
    promotions: [
      { id: "promotion_id", name: "Promotion ID", type: "string" },
      { id: "name", name: "Name", type: "string" },
      { id: "discount_type", name: "Discount Type", type: "string" },
      { id: "discount_value", name: "Discount Value", type: "number" },
      { id: "start_date", name: "Start Date", type: "date" },
      { id: "end_date", name: "End Date", type: "date" },
    ],
  },
  finance: {
    transactions: [
      { id: "transaction_id", name: "Transaction ID", type: "string" },
      { id: "date", name: "Date", type: "date" },
      { id: "amount", name: "Amount", type: "number" },
      { id: "type", name: "Type", type: "string" },
      { id: "account_id", name: "Account ID", type: "string" },
      { id: "description", name: "Description", type: "string" },
    ],
    accounts: [
      { id: "account_id", name: "Account ID", type: "string" },
      { id: "name", name: "Name", type: "string" },
      { id: "type", name: "Type", type: "string" },
      { id: "balance", name: "Balance", type: "number" },
    ],
    expenses: [
      { id: "expense_id", name: "Expense ID", type: "string" },
      { id: "date", name: "Date", type: "date" },
      { id: "amount", name: "Amount", type: "number" },
      { id: "category", name: "Category", type: "string" },
      { id: "description", name: "Description", type: "string" },
      { id: "vendor", name: "Vendor", type: "string" },
    ],
  },
}

interface FieldPickerProps {
  dataSource: string | null
  selectedFields: string[]
  onSelectFields: (fields: string[]) => void
}

export function FieldPicker({ dataSource, selectedFields, onSelectFields }: FieldPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFieldsData, setSelectedFieldsData] = useState<any[]>([])

  useEffect(() => {
    if (!dataSource) return

    const allFields: any[] = []
    Object.keys(fieldData[dataSource]).forEach((table) => {
      fieldData[dataSource][table].forEach((field: any) => {
        allFields.push({
          ...field,
          table,
          fullId: `${table}.${field.id}`,
        })
      })
    })

    const selected = allFields.filter((field) => selectedFields.includes(field.fullId))
    setSelectedFieldsData(selected)
  }, [dataSource, selectedFields])

  const handleToggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      onSelectFields(selectedFields.filter((id) => id !== fieldId))
    } else {
      onSelectFields([...selectedFields, fieldId])
    }
  }

  if (!dataSource) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        Please select a data source first
      </div>
    )
  }

  const tables = Object.keys(fieldData[dataSource])
  const filteredTables = tables
    .map((table) => {
      const fields = fieldData[dataSource][table].filter((field: any) =>
        field.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      return { table, fields }
    })
    .filter((table) => table.fields.length > 0)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fields..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="font-medium">Available Fields</h3>
          <ScrollArea className="h-[400px] rounded-md border">
            <Accordion type="multiple" className="w-full">
              {filteredTables.map(({ table, fields }) => (
                <AccordionItem key={table} value={table}>
                  <AccordionTrigger className="px-4">
                    <span className="text-sm font-medium capitalize">{table.replace("_", " ")}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-2">
                    <div className="space-y-2">
                      {fields.map((field: any) => (
                        <div key={field.id} className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted/50">
                          <Checkbox
                            id={`${table}.${field.id}`}
                            checked={selectedFields.includes(`${table}.${field.id}`)}
                            onCheckedChange={() => handleToggleField(`${table}.${field.id}`)}
                          />
                          <label
                            htmlFor={`${table}.${field.id}`}
                            className="flex flex-1 cursor-pointer items-center justify-between"
                          >
                            <span>{field.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {field.type}
                            </Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Selected Fields</h3>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {selectedFieldsData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                No fields selected. Select fields from the available fields list.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedFieldsData.map((field) => (
                  <div key={field.fullId} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center space-x-2">
                      <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{field.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{field.table.replace("_", " ")}</div>
                      </div>
                    </div>
                    <Badge variant="outline">{field.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
