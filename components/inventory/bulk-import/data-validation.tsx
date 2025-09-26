"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DataValidationProps {
  importData: any
  setImportData: (data: any) => void
}

export function DataValidation({ importData, setImportData }: DataValidationProps) {
  const [isValidating, setIsValidating] = useState(true)
  const [validationProgress, setValidationProgress] = useState(0)

  // Simulate validation process
  useEffect(() => {
    if (isValidating) {
      const interval = setInterval(() => {
        setValidationProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 100) {
            clearInterval(interval)
            setIsValidating(false)

            // Generate mock validation results
            const validRows = importData.data.length - 2 // Assume 2 rows have errors
            const mockErrors = [
              {
                rowIndex: 1,
                field: "price",
                value: importData.data[1][3],
                error: "Invalid price format",
                suggestion: "Ensure price is a number with up to 2 decimal places",
              },
              {
                rowIndex: 2,
                field: "quantity",
                value: importData.data[2][4],
                error: "Quantity must be a positive integer",
                suggestion: "Enter a whole number greater than 0",
              },
            ]

            // Update import data with validation results
            setImportData({
              ...importData,
              validationResults: {
                totalRows: importData.data.length,
                validRows,
                errorRows: mockErrors.length,
                duplicates: 0,
              },
              errors: mockErrors,
            })
          }
          return newProgress
        })
      }, 300)

      return () => clearInterval(interval)
    }
  }, [isValidating, importData, setImportData])

  // Get validation summary
  const getValidationSummary = () => {
    if (!importData.validationResults) return null

    const { totalRows, validRows, errorRows, duplicates } = importData.validationResults

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rows</p>
              <p className="text-2xl font-bold">{totalRows}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valid Rows</p>
              <p className="text-2xl font-bold">{validRows}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="bg-red-100 p-2 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rows with Errors</p>
              <p className="text-2xl font-bold">{errorRows}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duplicates</p>
              <p className="text-2xl font-bold">{duplicates}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Data Validation</h3>
        <p className="text-sm text-muted-foreground">
          We're checking your data for errors, duplicates, and other issues.
        </p>
      </div>

      {isValidating ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Validating data...</span>
                <span>{validationProgress}%</span>
              </div>
              <Progress value={validationProgress} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              This may take a few moments depending on the size of your file.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {getValidationSummary()}

          {importData.errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Issues Found</AlertTitle>
              <AlertDescription>
                We found {importData.errors.length} issues that need to be resolved before importing.
                {importData.importOptions.allowPartialImport && (
                  <span className="block mt-2">
                    You have enabled partial import, so you can proceed with importing valid rows only.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {importData.errors.length > 0 && (
            <div className="space-y-2 mt-6">
              <h3 className="text-lg font-medium">Error Details</h3>
              <Card>
                <CardContent className="p-0 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Suggestion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.errors.map((error: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{error.rowIndex + 1}</TableCell>
                          <TableCell>{error.field}</TableCell>
                          <TableCell>{error.value}</TableCell>
                          <TableCell className="text-red-600">{error.error}</TableCell>
                          <TableCell>{error.suggestion}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {importData.validationResults && importData.validationResults.validRows > 0 && (
            <div className="space-y-2 mt-6">
              <h3 className="text-lg font-medium">Valid Data Preview</h3>
              <Card>
                <CardContent className="p-0 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(importData.mappings)
                          .filter((header) => importData.mappings[header])
                          .map((header, index) => (
                            <TableHead key={index}>{header}</TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.data
                        .filter((_: any, index: number) => !importData.errors.some((e: any) => e.rowIndex === index))
                        .slice(0, 3)
                        .map((row: string[], rowIndex: number) => (
                          <TableRow key={rowIndex}>
                            {row
                              .filter((_: any, index: number) => importData.mappings[importData.headers[index]])
                              .map((cell, cellIndex) => (
                                <TableCell key={cellIndex}>{cell}</TableCell>
                              ))}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
