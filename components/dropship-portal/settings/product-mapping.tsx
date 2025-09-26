"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Plus, Save, Trash2 } from "lucide-react"

export function ProductMapping() {
  const [mappings, setMappings] = useState([
    {
      id: 1,
      jeweliaField: "title",
      partnerField: "product_name",
      required: true,
      transform: "none",
      status: "mapped",
    },
    {
      id: 2,
      jeweliaField: "description",
      partnerField: "description",
      required: true,
      transform: "none",
      status: "mapped",
    },
    {
      id: 3,
      jeweliaField: "price",
      partnerField: "price",
      required: true,
      transform: "none",
      status: "mapped",
    },
    {
      id: 4,
      jeweliaField: "sku",
      partnerField: "sku",
      required: true,
      transform: "none",
      status: "mapped",
    },
    {
      id: 5,
      jeweliaField: "images",
      partnerField: "image_urls",
      required: true,
      transform: "none",
      status: "mapped",
    },
    {
      id: 6,
      jeweliaField: "weight",
      partnerField: "weight_grams",
      required: false,
      transform: "convert_to_grams",
      status: "mapped",
    },
    {
      id: 7,
      jeweliaField: "dimensions",
      partnerField: "",
      required: false,
      transform: "none",
      status: "unmapped",
    },
    {
      id: 8,
      jeweliaField: "material",
      partnerField: "materials",
      required: false,
      transform: "none",
      status: "mapped",
    },
  ])

  const jeweliaFields = [
    { value: "title", label: "Title" },
    { value: "description", label: "Description" },
    { value: "price", label: "Price" },
    { value: "sku", label: "SKU" },
    { value: "images", label: "Images" },
    { value: "weight", label: "Weight" },
    { value: "dimensions", label: "Dimensions" },
    { value: "material", label: "Material" },
    { value: "category", label: "Category" },
    { value: "tags", label: "Tags" },
    { value: "variants", label: "Variants" },
    { value: "brand", label: "Brand" },
  ]

  const partnerFields = [
    { value: "product_name", label: "Product Name" },
    { value: "description", label: "Description" },
    { value: "price", label: "Price" },
    { value: "sku", label: "SKU" },
    { value: "image_urls", label: "Image URLs" },
    { value: "weight_grams", label: "Weight (grams)" },
    { value: "dimensions", label: "Dimensions" },
    { value: "materials", label: "Materials" },
    { value: "product_category", label: "Product Category" },
    { value: "keywords", label: "Keywords" },
    { value: "variations", label: "Variations" },
    { value: "manufacturer", label: "Manufacturer" },
  ]

  const transformOptions = [
    { value: "none", label: "None" },
    { value: "uppercase", label: "Uppercase" },
    { value: "lowercase", label: "Lowercase" },
    { value: "convert_to_grams", label: "Convert to Grams" },
    { value: "convert_to_cm", label: "Convert to Centimeters" },
    { value: "join_array", label: "Join Array" },
    { value: "split_string", label: "Split String" },
  ]

  const handleAddMapping = () => {
    const newId = Math.max(...mappings.map((m) => m.id), 0) + 1
    setMappings([
      ...mappings,
      {
        id: newId,
        jeweliaField: "",
        partnerField: "",
        required: false,
        transform: "none",
        status: "unmapped",
      },
    ])
  }

  const handleDeleteMapping = (id: number) => {
    setMappings(mappings.filter((m) => m.id !== id))
  }

  const handleUpdateMapping = (id: number, field: string, value: any) => {
    setMappings(
      mappings.map((m) => {
        if (m.id === id) {
          const updated = { ...m, [field]: value }
          // Update status based on whether partnerField is set
          if (field === "partnerField") {
            updated.status = value ? "mapped" : "unmapped"
          }
          return updated
        }
        return m
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Field Mappings</h3>
          <p className="text-sm text-muted-foreground">Map your product fields to Jewelia's product schema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddMapping}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Mappings
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jewelia Field</TableHead>
              <TableHead>Partner Field</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Transform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell>
                  <Select
                    value={mapping.jeweliaField}
                    onValueChange={(value) => handleUpdateMapping(mapping.id, "jeweliaField", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {jeweliaFields.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.partnerField}
                    onValueChange={(value) => handleUpdateMapping(mapping.id, "partnerField", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Mapped</SelectItem>
                      {partnerFields.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Switch
                      checked={mapping.required}
                      onCheckedChange={(checked) => handleUpdateMapping(mapping.id, "required", checked)}
                      disabled={
                        mapping.jeweliaField === "title" ||
                        mapping.jeweliaField === "price" ||
                        mapping.jeweliaField === "sku"
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.transform}
                    onValueChange={(value) => handleUpdateMapping(mapping.id, "transform", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transform" />
                    </SelectTrigger>
                    <SelectContent>
                      {transformOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {mapping.status === "mapped" ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mapped
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Unmapped
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMapping(mapping.id)}
                    disabled={mapping.required}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border p-4 bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Mapping Tips</h4>
        <ul className="space-y-1 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Required fields must be mapped to proceed with integration</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Use transformations to convert data formats between systems</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Test your mappings in the testing environment before going live</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
