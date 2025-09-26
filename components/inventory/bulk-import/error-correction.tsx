"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ErrorCorrectionProps {
  importData: any
  setImportData: (data: any) => void
}

export function ErrorCorrection({ importData, setImportData }: ErrorCorrectionProps) {
  const [correctedValues, setCorrectedValues] = useState<Record<string, string>>({})

  // Handle correcting a value
  const handleCorrectValue = (errorIndex: number, value: string) => {
    setCorrectedValues({
      ...correctedValues,
      [errorIndex]: value,
    })
  }

  // Apply corrections to the import data
  const handleApplyCorrections = () => {
    // Create a deep copy of the data
    const newData = [...importData.data]
    const newErrors = [...importData.errors]

    // Apply corrections
    Object.entries(correctedValues).forEach(([errorIndexStr, value]) => {
      const errorIndex = Number.parseInt(errorIndexStr)
      const error = importData.errors[errorIndex]

      // Find the column index for this field
      const columnIndex = importData.headers.findIndex((header: string) => importData.mappings[header] === error.field)

      if (columnIndex !== -1) {
        // Update the data
        newData[error.rowIndex][columnIndex] = value

        // Remove this error from the errors array
        newErrors.splice(errorIndex, 1)
      }
    })

    // Update the import data
    setImportData({
      ...importData,
      data: newData,
      errors: newErrors,
      validationResults: {
        ...importData.validationResults,
        validRows: importData.validationResults.validRows + Object.keys(correctedValues).length,
        errorRows: importData.validationResults.errorRows - Object.keys(correctedValues).length,
      },
    })

    // Clear corrected values
    setCorrectedValues({})
  }

  // Skip all errors and proceed with partial import
  const handleSkipAllErrors = () => {
    setImportData({
      ...importData,
      importOptions: {
        ...importData.importOptions,
        allowPartialImport: true,
      },
    })
  }

  // If no errors, show success message
  if (importData.errors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Error Correction</h3>
          <p className="text-sm text-muted-foreground">All data is valid! You can proceed to the next step.</p>
        </div>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-center">No Errors Found</h3>
            <p className="text-center text-muted-foreground">
              Your data passed all validation checks. You're ready to import!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Error Correction</h3>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handleSkipAllErrors}
              disabled={importData.importOptions.allowPartialImport}
            >
              Skip All Errors
            </Button>
            <Button onClick={handleApplyCorrections} disabled={Object.keys(correctedValues).length === 0}>
              Apply Corrections
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Correct the errors below or enable partial import to skip rows with errors.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Corrected Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importData.errors.map((error: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{error.rowIndex + 1}</TableCell>
                  <TableCell>{error.field}</TableCell>
                  <TableCell className="text-red-600">{error.value}</TableCell>
                  <TableCell>{error.error}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={correctedValues[index] || ""}
                        onChange={(e) => handleCorrectValue(index, e.target.value)}
                        placeholder="Enter corrected value"
                        className="w-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {correctedValues[index] ? (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending Correction</Badge>
                    ) : (
                      <Badge variant="destructive">Error</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {importData.importOptions.allowPartialImport && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Partial Import Enabled</h4>
            <p className="text-sm text-amber-700 mt-1">
              You've chosen to proceed with a partial import.
              {importData.errors.length} rows with errors will be skipped, and
              {importData.validationResults.validRows} valid rows will be imported.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2 mt-6">
        <h3 className="text-lg font-medium">Data Transformation Rules</h3>
        <p className="text-sm text-muted-foreground">
          Apply transformation rules to standardize your data during import.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price-format">Price Format</Label>
                <Select defaultValue="decimal">
                  <SelectTrigger id="price-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="decimal">Decimal (e.g., 99.99)</SelectItem>
                    <SelectItem value="whole">Whole Number (e.g., 9999)</SelectItem>
                    <SelectItem value="currency">Currency (e.g., $99.99)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="text-case">Text Case</Label>
                <Select defaultValue="title">
                  <SelectTrigger id="text-case">
                    <SelectValue placeholder="Select case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lower">Lowercase</SelectItem>
                    <SelectItem value="upper">Uppercase</SelectItem>
                    <SelectItem value="title">Title Case</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="iso">
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso">ISO (YYYY-MM-DD)</SelectItem>
                    <SelectItem value="us">US (MM/DD/YYYY)</SelectItem>
                    <SelectItem value="eu">EU (DD/MM/YYYY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Label className="mb-2 block">Custom Transformations</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <div className="flex-1">Replace "Gold" with "Yellow Gold" in Metal Type field</div>
                  <Button variant="ghost" size="sm">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <div className="flex-1">Convert all weights to grams</div>
                  <Button variant="ghost" size="sm">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" className="w-full mt-2">
                  Add Custom Transformation
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
