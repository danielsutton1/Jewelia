"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DataSourceSelector } from "@/components/report-builder/data-source-selector"
import { FieldPicker } from "@/components/report-builder/field-picker"
import { FilterBuilder } from "@/components/report-builder/filter-builder"
import { GroupingOptions } from "@/components/report-builder/grouping-options"
import { CalculationFormulas } from "@/components/report-builder/calculation-formulas"
import { LayoutOptions } from "@/components/report-builder/layout-options"
import { ReportPreview } from "@/components/report-builder/report-preview"
import { SaveReportDialog } from "@/components/report-builder/save-report-dialog"
import { ScheduleDeliveryDialog } from "@/components/report-builder/schedule-delivery-dialog"
import { ExportOptionsDialog } from "@/components/report-builder/export-options-dialog"
import { SharePermissionsDialog } from "@/components/report-builder/share-permissions-dialog"
import { Save, Clock, Download, Share2, Play } from "lucide-react"

export function ReportBuilder() {
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [filters, setFilters] = useState<any[]>([])
  const [groupings, setGroupings] = useState<string[]>([])
  const [calculations, setCalculations] = useState<any[]>([])
  const [layoutType, setLayoutType] = useState("table")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const handleRunReport = () => {
    // Logic to run the report
    console.log("Running report with:", {
      dataSource: selectedDataSource,
      fields: selectedFields,
      filters,
      groupings,
      calculations,
      layoutType,
    })
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Custom Report Builder</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(true)}>
            <Clock className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleRunReport}>
            <Play className="mr-2 h-4 w-4" />
            Run Report
          </Button>
        </div>
      </div>

      <div className="grid h-full grid-cols-12 gap-4">
        <div className="col-span-4 flex flex-col space-y-4 overflow-auto rounded-lg border p-4">
          <Tabs defaultValue="data">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="grouping">Grouping</TabsTrigger>
              <TabsTrigger value="calculations">Calculations</TabsTrigger>
            </TabsList>
            <TabsContent value="data" className="mt-4">
              <DataSourceSelector selectedDataSource={selectedDataSource} onSelectDataSource={setSelectedDataSource} />
            </TabsContent>
            <TabsContent value="fields" className="mt-4">
              <FieldPicker
                dataSource={selectedDataSource}
                selectedFields={selectedFields}
                onSelectFields={setSelectedFields}
              />
            </TabsContent>
            <TabsContent value="filters" className="mt-4">
              <FilterBuilder dataSource={selectedDataSource} filters={filters} onUpdateFilters={setFilters} />
            </TabsContent>
            <TabsContent value="grouping" className="mt-4">
              <GroupingOptions
                dataSource={selectedDataSource}
                selectedFields={selectedFields}
                groupings={groupings}
                onUpdateGroupings={setGroupings}
              />
            </TabsContent>
            <TabsContent value="calculations" className="mt-4">
              <CalculationFormulas
                dataSource={selectedDataSource}
                selectedFields={selectedFields}
                calculations={calculations}
                onUpdateCalculations={setCalculations}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="col-span-8 flex flex-col space-y-4">
          <div className="rounded-lg border p-4">
            <LayoutOptions layoutType={layoutType} onSelectLayoutType={setLayoutType} />
          </div>
          <div className="flex-1 rounded-lg border p-4">
            <ReportPreview
              dataSource={selectedDataSource}
              fields={selectedFields}
              filters={filters}
              groupings={groupings}
              calculations={calculations}
              layoutType={layoutType}
            />
          </div>
        </div>
      </div>

      <SaveReportDialog open={showSaveDialog} onOpenChange={setShowSaveDialog} />
      <ScheduleDeliveryDialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog} />
      <ExportOptionsDialog open={showExportDialog} onOpenChange={setShowExportDialog} />
      <SharePermissionsDialog open={showShareDialog} onOpenChange={setShowShareDialog} />
    </div>
  )
}
