"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Download,
  FileSpreadsheet,
  FileIcon as FilePdf,
  FileJson,
  Calendar,
  Clock,
  CheckCircle2,
  Settings,
} from "lucide-react"

interface CostExportProps {
  filters: any // TODO: Replace 'any' with the correct type if available
}

export function CostExport({ filters }: CostExportProps) {
  const [exportFormat, setExportFormat] = useState("excel")
  const [exportOptions, setExportOptions] = useState({
    includeBreakdown: true,
    includeComparison: true,
    includeProfitability: true,
    includeRecommendations: false,
    includeCharts: true,
    detailLevel: "detailed",
  })
  const [scheduleOptions, setScheduleOptions] = useState<{
    frequency: string
    recipients: string[]
    day?: string
    date?: string
  }>({
    frequency: "weekly",
    recipients: ["accounting@example.com"],
    day: "monday",
  })

  const handleExport = () => {
    // In a real implementation, this would trigger the export process
    console.log("Exporting with format:", exportFormat)
    console.log("Export options:", exportOptions)
    alert(`Exporting cost data in ${exportFormat.toUpperCase()} format`)
  }

  const handleSchedule = () => {
    // In a real implementation, this would schedule recurring exports
    console.log("Scheduling export with options:", scheduleOptions)
    alert(`Scheduled ${scheduleOptions.frequency} export to ${scheduleOptions.recipients.join(", ")}`)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">Export Now</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Export</TabsTrigger>
          <TabsTrigger value="accounting">Accounting Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Cost Data</CardTitle>
              <CardDescription>Export production cost data for the selected period and filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-3 text-sm font-medium">Export Format</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div
                      className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent ${exportFormat === "excel" ? "border-primary bg-accent" : ""}`}
                      onClick={() => setExportFormat("excel")}
                    >
                      <FileSpreadsheet className="mb-2 h-8 w-8 text-green-600" />
                      <span className="font-medium">Excel</span>
                      <span className="text-xs text-muted-foreground">Spreadsheet (.xlsx)</span>
                    </div>
                    <div
                      className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent ${exportFormat === "pdf" ? "border-primary bg-accent" : ""}`}
                      onClick={() => setExportFormat("pdf")}
                    >
                      <FilePdf className="mb-2 h-8 w-8 text-red-600" />
                      <span className="font-medium">PDF</span>
                      <span className="text-xs text-muted-foreground">Document (.pdf)</span>
                    </div>
                    <div
                      className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent ${exportFormat === "json" ? "border-primary bg-accent" : ""}`}
                      onClick={() => setExportFormat("json")}
                    >
                      <FileJson className="mb-2 h-8 w-8 text-blue-600" />
                      <span className="font-medium">JSON</span>
                      <span className="text-xs text-muted-foreground">Data (.json)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium">Export Content</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="breakdown"
                        checked={exportOptions.includeBreakdown}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeBreakdown: !!checked })
                        }
                      />
                      <label
                        htmlFor="breakdown"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include cost breakdown
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="comparison"
                        checked={exportOptions.includeComparison}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeComparison: !!checked })
                        }
                      />
                      <label
                        htmlFor="comparison"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include actual vs. estimated comparison
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="profitability"
                        checked={exportOptions.includeProfitability}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeProfitability: !!checked })
                        }
                      />
                      <label
                        htmlFor="profitability"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include profitability analysis
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recommendations"
                        checked={exportOptions.includeRecommendations}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeRecommendations: !!checked })
                        }
                      />
                      <label
                        htmlFor="recommendations"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include optimization recommendations
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="charts"
                        checked={exportOptions.includeCharts}
                        onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeCharts: !!checked })}
                        disabled={exportFormat === "json"}
                      />
                      <label
                        htmlFor="charts"
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${exportFormat === "json" ? "opacity-70" : ""}`}
                      >
                        Include charts and visualizations
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium">Detail Level</h3>
                  <RadioGroup
                    defaultValue={exportOptions.detailLevel}
                    onValueChange={(value) => setExportOptions({ ...exportOptions, detailLevel: value })}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="summary" id="summary" />
                      <Label htmlFor="summary">Summary (high-level overview)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed">Detailed (includes all data points)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="complete" id="complete" />
                      <Label htmlFor="complete">Complete (includes all data and raw values)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Export includes data from{" "}
                {filters.dateRange?.from ? new Date(filters.dateRange.from).toLocaleDateString() : "start"} to{" "}
                {filters.dateRange?.to ? new Date(filters.dateRange.to).toLocaleDateString() : "end"}
              </div>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Recurring Exports</CardTitle>
              <CardDescription>Set up automated exports to be delivered on a schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="frequency">Export Frequency</Label>
                    <Select
                      value={scheduleOptions.frequency}
                      onValueChange={(value) => setScheduleOptions({ ...scheduleOptions, frequency: value })}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {scheduleOptions.frequency === "weekly" && (
                    <div>
                      <Label htmlFor="day">Day of Week</Label>
                      <Select
                        value={scheduleOptions.day}
                        onValueChange={(value) => setScheduleOptions({ ...scheduleOptions, day: value })}
                      >
                        <SelectTrigger id="day">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {scheduleOptions.frequency === "monthly" && (
                    <div>
                      <Label htmlFor="date">Day of Month</Label>
                      <Select
                        defaultValue="1"
                        onValueChange={(value) => setScheduleOptions({ ...scheduleOptions, date: value })}
                      >
                        <SelectTrigger id="date">
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(28)].map((_, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                          <SelectItem value="last">Last day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="format">Export Format</Label>
                    <Select defaultValue="excel">
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <div className="space-y-2">
                      {scheduleOptions.recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={recipient}
                            onChange={(e) => {
                              const newRecipients = [...scheduleOptions.recipients]
                              newRecipients[index] = e.target.value
                              setScheduleOptions({ ...scheduleOptions, recipients: newRecipients })
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newRecipients = scheduleOptions.recipients.filter((_, i) => i !== index)
                              setScheduleOptions({ ...scheduleOptions, recipients: newRecipients })
                            }}
                            disabled={scheduleOptions.recipients.length === 1}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setScheduleOptions({
                            ...scheduleOptions,
                            recipients: [...scheduleOptions.recipients, ""],
                          })
                        }}
                      >
                        Add Recipient
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Export Content</Label>
                    <div className="rounded-lg border p-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox defaultChecked id="schedule-breakdown" />
                          <label
                            htmlFor="schedule-breakdown"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Cost breakdown
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox defaultChecked id="schedule-comparison" />
                          <label
                            htmlFor="schedule-comparison"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Actual vs. estimated
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox defaultChecked id="schedule-profitability" />
                          <label
                            htmlFor="schedule-profitability"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Profitability analysis
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                Next export will be sent on the next {scheduleOptions.day || "scheduled date"}
              </div>
              <Button onClick={handleSchedule}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Export
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="accounting">
          <Card>
            <CardHeader>
              <CardTitle>Accounting System Integration</CardTitle>
              <CardDescription>Configure direct integration with your accounting system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accounting-system">Accounting System</Label>
                    <Select defaultValue="quickbooks">
                      <SelectTrigger id="accounting-system">
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quickbooks">QuickBooks</SelectItem>
                        <SelectItem value="xero">Xero</SelectItem>
                        <SelectItem value="sage">Sage</SelectItem>
                        <SelectItem value="netsuite">NetSuite</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sync-frequency">Sync Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="sync-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" value="••••••••••••••••" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Data Mapping</Label>
                    <div className="rounded-lg border p-3">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Cost Category</div>
                          <div className="text-sm font-medium">Account</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm">Direct Materials</div>
                          <Select defaultValue="5001">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5001">5001 - Materials</SelectItem>
                              <SelectItem value="5002">5002 - Raw Materials</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm">Labor Hours</div>
                          <Select defaultValue="5010">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5010">5010 - Direct Labor</SelectItem>
                              <SelectItem value="5011">5011 - Production Wages</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm">Overhead</div>
                          <Select defaultValue="5020">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5020">5020 - Manufacturing Overhead</SelectItem>
                              <SelectItem value="5021">5021 - Indirect Costs</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Integration Status</Label>
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Connected and syncing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Last sync: Today at 09:45 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex justify-between">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Advanced Settings
              </Button>
              <div className="space-x-2">
                <Button variant="outline">Test Connection</Button>
                <Button>Sync Now</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
