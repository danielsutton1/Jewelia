"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Download, FileText, Printer, Share2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AuditCompletionProps {
  auditData: any
}

export function AuditCompletion({ auditData }: AuditCompletionProps) {
  // Mock data for the summary
  const mockSummary = {
    totalItems: 134,
    scannedItems: 134,
    completionRate: 100,
    totalDiscrepancies: 12,
    resolvedDiscrepancies: 12,
    discrepancyRate: 8.96,
    valueImpact: -3799.98,
    startDate: new Date(auditData.startDate || Date.now() - 7 * 24 * 60 * 60 * 1000),
    completionDate: new Date(),
    duration: "6 days, 4 hours",
    participants: ["John Doe", "Jane Smith", "Alice Johnson"],
  }

  // Mock data for reports
  const mockReports = {
    missingItems: [
      { sku: "JP-005", name: "Diamond Pendant", location: "Safe 1", expected: 2, actual: 0, value: 4999.98 },
      { sku: "JR-001", name: "Diamond Ring", location: "Display Case A", expected: 3, actual: 2, value: 1299.99 },
    ],
    extraItems: [
      { sku: "JE-003", name: "Pearl Earrings", location: "Display Case B", expected: 5, actual: 6, value: 499.99 },
      { sku: "JB-004", name: "Sapphire Bracelet", location: "Display Case B", expected: 1, actual: 2, value: 1899.99 },
    ],
    locationMismatches: [
      { sku: "JN-002", name: "Gold Necklace", expectedLocation: "Display Case A", actualLocation: "Display Case C" },
    ],
    valueVariances: [
      { category: "Rings", expectedValue: 12999.9, actualValue: 11699.91, difference: -1299.99 },
      { category: "Pendants", expectedValue: 9999.96, actualValue: 4999.98, difference: -4999.98 },
      { category: "Earrings", expectedValue: 2499.95, actualValue: 2999.94, difference: 499.99 },
      { category: "Bracelets", expectedValue: 1899.99, actualValue: 3799.98, difference: 1899.99 },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Audit Completion</h3>
        <p className="text-sm text-muted-foreground mb-6">Review the audit results and generate reports.</p>
      </div>

      {/* Completion Status */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-green-800">Audit Completed Successfully</h3>
            <p className="text-sm text-green-700">
              All items have been counted and all discrepancies have been resolved.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Summary</CardTitle>
          <CardDescription>Overview of the physical inventory audit results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Completion Rate</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {mockSummary.scannedItems} of {mockSummary.totalItems} items counted
                    </span>
                    <span>{mockSummary.completionRate}%</span>
                  </div>
                  <Progress value={mockSummary.completionRate} className="h-2" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Discrepancy Rate</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{mockSummary.totalDiscrepancies} discrepancies found</span>
                    <span>{mockSummary.discrepancyRate.toFixed(2)}%</span>
                  </div>
                  <Progress value={mockSummary.discrepancyRate} className="h-2" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Value Impact</h4>
                <div className="text-xl font-bold text-red-500">
                  $
                  {Math.abs(mockSummary.valueImpact).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockSummary.valueImpact < 0 ? "Negative" : "Positive"} inventory adjustment
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Audit Details</h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{mockSummary.startDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completion Date:</span>
                    <span>{mockSummary.completionDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{mockSummary.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Participants:</span>
                    <span>{mockSummary.participants.length} users</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Locations Audited:</span>
                    <span>{auditData.locations?.length || 4} locations</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Participants</h4>
                <div className="flex flex-wrap gap-2">
                  {mockSummary.participants.map((participant, index) => (
                    <Badge key={index} variant="secondary">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="flex justify-between border-t pt-6">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Summary
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </Card>

      {/* Reports */}
      <div>
        <h3 className="text-lg font-medium mb-4">Generated Reports</h3>

        <Tabs defaultValue="missing">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="missing">Missing Items</TabsTrigger>
            <TabsTrigger value="extra">Extra Items</TabsTrigger>
            <TabsTrigger value="location">Location Mismatches</TabsTrigger>
            <TabsTrigger value="value">Value Variances</TabsTrigger>
          </TabsList>

          <TabsContent value="missing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Missing Items Report</CardTitle>
                <CardDescription>Items with fewer quantities than expected</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Expected</TableHead>
                        <TableHead className="text-right">Actual</TableHead>
                        <TableHead className="text-right">Value Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockReports.missingItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right">{item.expected}</TableCell>
                          <TableCell className="text-right">{item.actual}</TableCell>
                          <TableCell className="text-right text-red-500">
                            -$
                            {item.value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <div className="border-t pt-6">
                <Button variant="outline" className="ml-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="extra" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Extra Items Report</CardTitle>
                <CardDescription>Items with more quantities than expected</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Expected</TableHead>
                        <TableHead className="text-right">Actual</TableHead>
                        <TableHead className="text-right">Value Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockReports.extraItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right">{item.expected}</TableCell>
                          <TableCell className="text-right">{item.actual}</TableCell>
                          <TableCell className="text-right text-green-500">
                            +$
                            {item.value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <div className="border-t pt-6">
                <Button variant="outline" className="ml-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Mismatches Report</CardTitle>
                <CardDescription>Items found in different locations than expected</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Expected Location</TableHead>
                        <TableHead>Actual Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockReports.locationMismatches.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.expectedLocation}</TableCell>
                          <TableCell>{item.actualLocation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <div className="border-t pt-6">
                <Button variant="outline" className="ml-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="value" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Value Variances Report</CardTitle>
                <CardDescription>Value differences by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Expected Value</TableHead>
                        <TableHead className="text-right">Actual Value</TableHead>
                        <TableHead className="text-right">Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockReports.valueVariances.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell className="text-right">
                            $
                            {item.expectedValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            $
                            {item.actualValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell
                            className={`text-right ${item.difference < 0 ? "text-red-500" : "text-green-500"}`}
                          >
                            {item.difference > 0 ? "+" : ""}$
                            {item.difference.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <div className="border-t pt-6">
                <Button variant="outline" className="ml-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
        <Button>Complete Audit</Button>
      </div>
    </div>
  )
}
