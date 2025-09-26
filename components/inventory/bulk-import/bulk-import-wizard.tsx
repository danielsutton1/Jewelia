"use client"

import { useState } from "react"
import { FileUpload } from "./file-upload"
import { ColumnMapping } from "./column-mapping"
import { DataValidation } from "./data-validation"
import { ErrorCorrection } from "./error-correction"
import { ImportConfirmation } from "./import-confirmation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define the steps in the import wizard
const steps = [
  { id: "upload", label: "File Upload" },
  { id: "mapping", label: "Column Mapping" },
  { id: "validation", label: "Data Validation" },
  { id: "correction", label: "Error Correction" },
  { id: "confirmation", label: "Import Confirmation" },
]

export function BulkImportWizard() {
  const [currentStep, setCurrentStep] = useState("upload")
  const [importData, setImportData] = useState<any>({
    file: null,
    fileType: "",
    mappings: {},
    data: [],
    headers: [],
    validationResults: null,
    errors: [],
    importOptions: {
      allowPartialImport: false,
      enableRollback: true,
      detectDuplicates: true,
      applyTransformations: false,
    },
    progress: 0,
    importLog: [],
  })

  // Calculate current step index for progress bar
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)
  const progress = (currentStepIndex / (steps.length - 1)) * 100

  // Handle moving to the next step
  const handleNext = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  // Handle moving to the previous step
  const handlePrevious = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  // Handle downloading a template
  const handleDownloadTemplate = () => {
    // In a real implementation, this would generate and download a CSV template
    const templateUrl = "/templates/inventory-import-template.csv"
    const link = document.createElement("a")
    link.href = templateUrl
    link.download = "inventory-import-template.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Import Wizard</h2>
          <p className="text-muted-foreground">Follow these steps to import your inventory data</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download a CSV template with the correct column headers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Tabs value={currentStep} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              {steps.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  disabled={true}
                  className={
                    steps.findIndex((s) => s.id === step.id) <= currentStepIndex ? "opacity-100" : "opacity-50"
                  }
                >
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="upload" className="py-4">
              <FileUpload importData={importData} setImportData={setImportData} />
            </TabsContent>

            <TabsContent value="mapping" className="py-4">
              <ColumnMapping importData={importData} setImportData={setImportData} />
            </TabsContent>

            <TabsContent value="validation" className="py-4">
              <DataValidation importData={importData} setImportData={setImportData} />
            </TabsContent>

            <TabsContent value="correction" className="py-4">
              <ErrorCorrection importData={importData} setImportData={setImportData} />
            </TabsContent>

            <TabsContent value="confirmation" className="py-4">
              <ImportConfirmation importData={importData} setImportData={setImportData} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === "upload"}>
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                currentStep === "confirmation" ||
                (currentStep === "upload" && !importData.file) ||
                (currentStep === "mapping" && Object.keys(importData.mappings).length === 0) ||
                (currentStep === "validation" &&
                  importData.errors.length > 0 &&
                  !importData.importOptions.allowPartialImport) ||
                (currentStep === "correction" &&
                  importData.errors.length > 0 &&
                  !importData.importOptions.allowPartialImport)
              }
            >
              {currentStep === "confirmation" ? "Finish" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
