"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, Download } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ImportConfirmationProps {
  importData: any
  setImportData: (data: any) => void
}

export function ImportConfirmation({ importData, setImportData }: ImportConfirmationProps) {
  const [importStatus, setImportStatus] = useState<"idle" | "importing" | "completed" | "failed">("idle")
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState<any>(null)
  const [importLogs, setImportLogs] = useState<any[]>([])

  // Start the import process
  const handleStartImport = () => {
    setImportStatus("importing")
    setImportProgress(0)
    setImportLogs([
      {
        timestamp: new Date().toISOString(),
        level: "info",
        message: "Starting import process...",
      },
    ])

    // Simulate the import process
    const totalRows = importData.validationResults.validRows
    let processedRows = 0
    let interval: NodeJS.Timeout

    interval = setInterval(() => {
      processedRows += 1
      const progress = Math.round((processedRows / totalRows) * 100)

      // Add a log entry
      setImportLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          level: Math.random() > 0.9 ? "warning" : "info",
          message: `Processing row ${processedRows} of ${totalRows}`,
        },
      ])

      setImportProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)

        // Add final log entries
        setImportLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            level: "success",
            message: "Import completed successfully!",
          },
          {
            timestamp: new Date().toISOString(),
            level: "info",
            message: `Imported ${totalRows} items into inventory`,
          },
        ])

        setImportStatus("completed")
        setImportResults({
          totalRows,
          successRows: totalRows,
          failedRows: 0,
          skippedRows: importData.errors.length,
          duplicates: 0,
          timestamp: new Date().toISOString(),
        })
      }
    }, 100)
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  // Get log level badge
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case "info":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Info
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Warning
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "success":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Success
          </Badge>
        )
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Import Confirmation</h3>
        <p className="text-sm text-muted-foreground">
          Review your import settings and confirm to start the import process.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Import Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">File Name</span>
                  <span className="font-medium">{importData.file?.name}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Total Rows</span>
                  <span className="font-medium">{importData.validationResults?.totalRows}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Valid Rows</span>
                  <span className="font-medium">{importData.validationResults?.validRows}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Import Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <span>Detect Duplicates</span>
                  <Badge variant={importData.importOptions.detectDuplicates ? "default" : "outline"}>
                    {importData.importOptions.detectDuplicates ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <span>Allow Partial Import</span>
                  <Badge variant={importData.importOptions.allowPartialImport ? "default" : "outline"}>
                    {importData.importOptions.allowPartialImport ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <span>Enable Rollback</span>
                  <Badge variant={importData.importOptions.enableRollback ? "default" : "outline"}>
                    {importData.importOptions.enableRollback ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <span>Apply Transformations</span>
                  <Badge variant={importData.importOptions.applyTransformations ? "default" : "outline"}>
                    {importData.importOptions.applyTransformations ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>

            {importData.errors.length > 0 && importData.importOptions.allowPartialImport && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Partial Import Warning</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {importData.errors.length} rows with errors will be skipped during import. Only{" "}
                    {importData.validationResults.validRows} valid rows will be imported.
                  </p>
                </div>
              </div>
            )}

            {importStatus === "idle" && (
              <Button
                onClick={handleStartImport}
                className="w-full"
                disabled={importData.validationResults?.validRows === 0}
              >
                Start Import
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {importStatus !== "idle" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Import Progress</h3>
              {importStatus === "completed" && (
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Log
                </Button>
              )}
            </div>
            {importStatus === "importing" && (
              <p className="text-sm text-muted-foreground">Importing your data. Please do not close this page.</p>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              {importStatus === "importing" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing data...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                </div>
              )}

              {importStatus === "completed" && importResults && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-4 py-6">
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Import Completed Successfully</h3>
                      <p className="text-muted-foreground">
                        {importResults.successRows} items were imported into your inventory
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total Processed</div>
                        <div className="text-2xl font-bold">{importResults.totalRows}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Successfully Imported</div>
                        <div className="text-2xl font-bold text-green-600">{importResults.successRows}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Failed</div>
                        <div className="text-2xl font-bold text-red-600">{importResults.failedRows}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Skipped</div>
                        <div className="text-2xl font-bold text-amber-600">{importResults.skippedRows}</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <div className="space-y-2 mt-6">
                <h4 className="font-medium">Import Log</h4>
                <Card className="border border-muted">
                  <ScrollArea className="h-64 w-full rounded-md">
                    <div className="p-4 space-y-2">
                      {importLogs.map((log, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <span className="text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <div className="min-w-[80px]">{getLogLevelBadge(log.level)}</div>
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
