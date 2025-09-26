"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ExportOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportOptionsDialog({ open, onOpenChange }: ExportOptionsDialogProps) {
  const [format, setFormat] = useState("pdf")
  const [includeFilters, setIncludeFilters] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [fileName, setFileName] = useState("Report")
  const [orientation, setOrientation] = useState("portrait")
  const [paperSize, setPaperSize] = useState("a4")
  const [delimiter, setDelimiter] = useState("comma")
  const [includeHeaders, setIncludeHeaders] = useState(true)

  const handleExport = () => {
    // Logic to export the report
    console.log("Exporting report:", {
      format,
      includeFilters,
      includeCharts,
      fileName,
      orientation,
      paperSize,
      delimiter,
      includeHeaders,
    })

    // Close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>Configure export options for your report.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="image">Image (PNG)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="pdf" value={format} onValueChange={setFormat}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pdf">PDF</TabsTrigger>
              <TabsTrigger value="excel">Excel/CSV</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>
            <TabsContent value="pdf" className="mt-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="orientation">Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger id="orientation">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paperSize">Paper Size</Label>
                <Select value={paperSize} onValueChange={setPaperSize}>
                  <SelectTrigger id="paperSize">
                    <SelectValue placeholder="Select paper size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="tabloid">Tabloid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="excel" className="mt-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="delimiter">Delimiter (CSV)</Label>
                <Select value={delimiter} onValueChange={setDelimiter}>
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder="Select delimiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">Comma (,)</SelectItem>
                    <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                    <SelectItem value="pipe">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHeaders"
                  checked={includeHeaders}
                  onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
                />
                <Label htmlFor="includeHeaders" className="text-sm font-normal">
                  Include column headers
                </Label>
              </div>
            </TabsContent>
            <TabsContent value="image" className="mt-4 space-y-4">
              <div className="text-sm text-muted-foreground">The report will be exported as a PNG image.</div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFilters"
                  checked={includeFilters}
                  onCheckedChange={(checked) => setIncludeFilters(checked as boolean)}
                />
                <Label htmlFor="includeFilters" className="text-sm font-normal">
                  Include filters and parameters
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="includeCharts" className="text-sm font-normal">
                  Include charts and visualizations
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
