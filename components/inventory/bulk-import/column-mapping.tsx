"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wand2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ColumnMappingProps {
  importData: any
  setImportData: (data: any) => void
}

// System fields that need to be mapped
const requiredFields = [
  { id: "sku", label: "SKU", required: true },
  { id: "name", label: "Product Name", required: true },
  { id: "category", label: "Category", required: true },
  { id: "price", label: "Price", required: true },
  { id: "quantity", label: "Quantity", required: true },
  { id: "description", label: "Description", required: false },
  { id: "metal_type", label: "Metal Type", required: false },
  { id: "metal_weight", label: "Metal Weight", required: false },
  { id: "stone_type", label: "Stone Type", required: false },
  { id: "stone_weight", label: "Stone Weight", required: false },
  { id: "stone_count", label: "Stone Count", required: false },
  { id: "certification", label: "Certification", required: false },
  { id: "location", label: "Location", required: false },
  { id: "supplier", label: "Supplier", required: false },
  { id: "cost", label: "Cost", required: false },
]

export function ColumnMapping({ importData, setImportData }: ColumnMappingProps) {
  const [suggestedMappings, setSuggestedMappings] = useState<Record<string, string>>({})

  // Simulate AI field matching on component mount
  useEffect(() => {
    if (importData.headers && importData.headers.length > 0) {
      // This would be an AI-based suggestion in a real implementation
      // Here we're just doing simple string matching
      const suggestions: Record<string, string> = {}

      importData.headers.forEach((header: string) => {
        const lowerHeader = header.toLowerCase()

        // Simple matching logic
        if (lowerHeader.includes("sku") || lowerHeader.includes("id")) {
          suggestions[header] = "sku"
        } else if (lowerHeader.includes("name") || lowerHeader.includes("title")) {
          suggestions[header] = "name"
        } else if (lowerHeader.includes("cat")) {
          suggestions[header] = "category"
        } else if (lowerHeader.includes("price") || lowerHeader.includes("rate")) {
          suggestions[header] = "price"
        } else if (lowerHeader.includes("qty") || lowerHeader.includes("quantity") || lowerHeader.includes("stock")) {
          suggestions[header] = "quantity"
        } else if (lowerHeader.includes("desc")) {
          suggestions[header] = "description"
        } else if (lowerHeader.includes("metal") && lowerHeader.includes("type")) {
          suggestions[header] = "metal_type"
        } else if (lowerHeader.includes("metal") && lowerHeader.includes("weight")) {
          suggestions[header] = "metal_weight"
        } else if (lowerHeader.includes("stone") && lowerHeader.includes("type")) {
          suggestions[header] = "stone_type"
        } else if (lowerHeader.includes("stone") && lowerHeader.includes("weight")) {
          suggestions[header] = "stone_weight"
        } else if (lowerHeader.includes("stone") && lowerHeader.includes("count")) {
          suggestions[header] = "stone_count"
        } else if (lowerHeader.includes("cert")) {
          suggestions[header] = "certification"
        } else if (lowerHeader.includes("loc")) {
          suggestions[header] = "location"
        } else if (lowerHeader.includes("supp") || lowerHeader.includes("vendor")) {
          suggestions[header] = "supplier"
        } else if (lowerHeader.includes("cost")) {
          suggestions[header] = "cost"
        }
      })

      setSuggestedMappings(suggestions)
    }
  }, [importData.headers])

  const handleApplySuggestions = () => {
    setImportData({
      ...importData,
      mappings: { ...suggestedMappings },
    })
  }

  const handleMappingChange = (header: string, fieldId: string) => {
    setImportData({
      ...importData,
      mappings: {
        ...importData.mappings,
        [header]: fieldId,
      },
    })
  }

  const getPreviewData = () => {
    // Return first 3 rows for preview
    return importData.data.slice(0, 3)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Map Your Columns</h3>
          <Button variant="outline" onClick={handleApplySuggestions} className="flex items-center">
            <Wand2 className="mr-2 h-4 w-4" />
            Apply AI Suggestions
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Match your file columns to our system fields. Required fields are marked with an asterisk.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="font-medium">File Column</div>
              <div className="font-medium">System Field</div>
            </div>

            {importData.headers.map((header: string, index: number) => (
              <div key={index} className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center">
                  <span>{header}</span>
                  {suggestedMappings[header] && !importData.mappings[header] && (
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                      Suggested: {requiredFields.find((f) => f.id === suggestedMappings[header])?.label}
                    </Badge>
                  )}
                </div>
                <Select
                  value={importData.mappings[header] || ""}
                  onValueChange={(value) => handleMappingChange(header, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Do not import</SelectItem>
                    {requiredFields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.label} {field.required && "*"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Data Preview</h3>
        <p className="text-sm text-muted-foreground">
          Preview how your data will be imported based on your column mapping.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {importData.headers.map((header: string, index: number) => (
                  <TableHead key={index}>
                    {importData.mappings[header] ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{header}</span>
                        <span>{requiredFields.find((f) => f.id === importData.mappings[header])?.label}</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">{header} (Not imported)</div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {getPreviewData().map((row: string[], rowIndex: number) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {importData.mappings[importData.headers[cellIndex]] ? (
                        cell
                      ) : (
                        <span className="text-muted-foreground italic">Skipped</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
