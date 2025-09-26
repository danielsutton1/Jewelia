"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FileUp, FileSpreadsheet, FileX } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  importData: any
  setImportData: (data: any) => void
}

export function FileUpload({ importData, setImportData }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    const fileType = file.name.split(".").pop()?.toLowerCase()

    if (fileType === "csv" || fileType === "xlsx" || fileType === "xls") {
      // In a real implementation, we would parse the file here
      // For this demo, we'll simulate parsing with mock data

      // Mock headers and data
      const mockHeaders = ["SKU", "Name", "Category", "Price", "Quantity", "Description"]
      const mockData = [
        ["JR-001", "Diamond Ring", "Rings", "1299.99", "5", "Beautiful diamond ring"],
        ["JN-002", "Gold Necklace", "Necklaces", "899.99", "8", "Elegant gold necklace"],
        ["JE-003", "Pearl Earrings", "Earrings", "499.99", "12", "Classic pearl earrings"],
      ]

      setImportData({
        ...importData,
        file,
        fileType,
        headers: mockHeaders,
        data: mockData,
        mappings: {},
      })
    } else {
      alert("Please upload a CSV or Excel file")
    }
  }

  const handleRemoveFile = () => {
    setImportData({
      ...importData,
      file: null,
      fileType: "",
      headers: [],
      data: [],
      mappings: {},
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOptionChange = (option: string, value: boolean) => {
    setImportData({
      ...importData,
      importOptions: {
        ...importData.importOptions,
        [option]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Your Inventory File</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV or Excel file containing your inventory data. You can drag and drop your file or click to browse.
        </p>
      </div>

      {!importData.file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
          <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium mb-1">Drag and drop your file here</h4>
          <p className="text-sm text-muted-foreground mb-4">Supports CSV and Excel files (.csv, .xlsx, .xls)</p>
          <Button variant="secondary" type="button">
            Browse Files
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{importData.file.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {(importData.file.size / 1024).toFixed(2)} KB • {importData.data.length} rows
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <FileX className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-medium">Import Options</h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="detect-duplicates" className="flex flex-col space-y-1">
              <span>Detect Duplicates</span>
              <span className="font-normal text-sm text-muted-foreground">Identify and flag duplicate items</span>
            </Label>
            <Switch
              id="detect-duplicates"
              checked={importData.importOptions.detectDuplicates}
              onCheckedChange={(checked) => handleOptionChange("detectDuplicates", checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="partial-import" className="flex flex-col space-y-1">
              <span>Allow Partial Import</span>
              <span className="font-normal text-sm text-muted-foreground">
                Import valid rows even if some have errors
              </span>
            </Label>
            <Switch
              id="partial-import"
              checked={importData.importOptions.allowPartialImport}
              onCheckedChange={(checked) => handleOptionChange("allowPartialImport", checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="enable-rollback" className="flex flex-col space-y-1">
              <span>Enable Rollback</span>
              <span className="font-normal text-sm text-muted-foreground">Ability to undo the import if needed</span>
            </Label>
            <Switch
              id="enable-rollback"
              checked={importData.importOptions.enableRollback}
              onCheckedChange={(checked) => handleOptionChange("enableRollback", checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="apply-transformations" className="flex flex-col space-y-1">
              <span>Apply Transformations</span>
              <span className="font-normal text-sm text-muted-foreground">Apply data transformation rules</span>
            </Label>
            <Switch
              id="apply-transformations"
              checked={importData.importOptions.applyTransformations}
              onCheckedChange={(checked) => handleOptionChange("applyTransformations", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
